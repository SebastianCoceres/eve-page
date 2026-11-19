import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import type { SeaKind, SeigaihaField } from "@/lib/seigaiha";

/**
 * Ink and swell for a seigaiha field.
 *
 * Ink: each field draws once:
 * - hero: on load, each row's arcs spread from its middle outward (DrawSVG
 *   "50% 50%"), rows staggered from the centre row out (~1.3s), in step with
 *   the sun rising (TravelingSun) and the name's letters (useHeroAnimation);
 * - footer: when it enters the viewport, row by row from the left,
 *   like a wave passing (at most 0.8s).
 *
 * Swell: the sea lives. Each row bobs 1–2px (more at the front than at the
 * horizon), out of phase with its neighbours, and every other row drifts a
 * pixel or two sideways, slowly, like a print breathing. It is ambient (time,
 * not scroll): it moves the rows' contents, never a row itself, so the scale
 * journey's scroll-driven dissolve of the hero rows (useScaleJourney) composes
 * with it exactly. It only runs while the sea is in view (and, like every GSAP
 * tween, not while the tab is hidden).
 *
 * Reduced motion: nothing runs; every field is simply drawn and still.
 */
export function useSeaField(field: SeigaihaField | null, kind: SeaKind) {
    const scope = useRef<HTMLDivElement>(null);
    const drawn = useRef(false);

    useGSAP(() => {
        const root = scope.current;
        if (!root || !field) return;
        const strokes = gsap.utils.toArray<SVGPathElement>(root.querySelectorAll('[data-sea="stroke"]'));
        if (strokes.length === 0) return;

        const mm = gsap.matchMedia();
        mm.add("(prefers-reduced-motion: no-preference)", () => {
            if (!drawn.current) {
                drawn.current = true;
                if (kind === "hero") {
                    // Rows from the centre row out, 30ms apart; a row's loose crest scales
                    // (their own paths, see SeaField) draw with their row.
                    const center = (field.rows.length - 1) / 2;
                    gsap.from(strokes, {
                        drawSVG: "50% 50%",
                        duration: 1.0,
                        ease: "power2.inOut",
                        stagger: (_index: number, target: Element) =>
                            0.03 * Math.abs(Number((target as SVGElement).dataset.row ?? center) - center),
                    });
                } else {
                    gsap.from(strokes, {
                        drawSVG: "0%",
                        duration: 0.5,
                        ease: "power2.out",
                        stagger: Math.min(0.1, 0.3 / strokes.length),
                        // Start as soon as the sea enters, so its strokes are drawn before the
                        // setting sun reaches it: the paper fills never show an empty bite.
                        scrollTrigger: { trigger: root, start: "top bottom", once: true },
                    });
                }
            }

            // The swell: per row, a slow bob and (every other row) a sideways drift.
            const rows = gsap.utils.toArray<SVGGElement>(root.querySelectorAll("[data-sea-svg] > g"));
            const swell: gsap.core.Tween[] = [];
            rows.forEach((row, k) => {
                const front = rows.length > 1 ? k / (rows.length - 1) : 1;
                const bob = gsap.to(row.children, {
                    y: -(0.8 + 1.2 * front),
                    duration: 2.8 + 0.6 * ((k * 7) % 5) / 4,
                    ease: "sine.inOut",
                    yoyo: true,
                    repeat: -1,
                    paused: true,
                });
                bob.totalTime(k * 0.45);
                swell.push(bob);
                if (k % 2 === 1) {
                    const drift = gsap.to(row.children, {
                        x: k % 4 === 1 ? 1.5 : -1.5,
                        duration: 5.5 + (k % 3),
                        ease: "sine.inOut",
                        yoyo: true,
                        repeat: -1,
                        paused: true,
                    });
                    drift.totalTime(k * 0.7);
                    swell.push(drift);
                }
            });
            const inView = ScrollTrigger.create({
                trigger: root,
                start: "top bottom",
                end: "bottom top",
                onToggle: (self) => swell.forEach((tween) => (self.isActive ? tween.resume() : tween.pause())),
            });
            if (inView.isActive) swell.forEach((tween) => tween.resume());

            return () => {
                inView.kill();
                swell.forEach((tween) => tween.kill());
                gsap.set(rows.flatMap((row) => [...row.children]), { clearProps: "transform" });
            };
        });
    }, { scope, dependencies: [field], revertOnUpdate: true });

    return scope;
}
