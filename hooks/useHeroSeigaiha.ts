import { useRef, type RefObject } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import type { SeigaihaField } from "@/lib/seigaiha";

/**
 * Motion for the hero's seigaiha and sun. The grammar is one ink gesture, then
 * stillness with slow breathing:
 *
 * - Intro (once, ~1.8s): every row's arcs are drawn from its middle outward
 *   (DrawSVG "50% 50%" to "0% 100%"), rows staggered from the centre row out,
 *   while the sun rises from behind the waves (expo.out).
 * - Scroll (scrub over the hero): the sun sinks into the sea, hidden by the
 *   scales' opaque fills, and warms one step; far rows lag a little (parallax).
 * - Ambient: each row drifts sideways by exactly one period and wraps, at its own
 *   slow speed, so the loop is seamless. Paused while the hero is off screen.
 * - Reduced motion: nothing runs; the composed pattern is shown as is.
 *
 * Motion uses transforms only (plus DrawSVG's dash offset during the intro).
 */
export function useHeroSeigaiha(field: SeigaihaField | null, sectionRef: RefObject<HTMLElement | null>) {
    const scope = useRef<HTMLDivElement>(null);
    const introPlayed = useRef(false);

    useGSAP(() => {
        const root = scope.current;
        if (!root || !field) return;

        const rows = gsap.utils.toArray<SVGGElement>(root.querySelectorAll('[data-seigaiha="row"]'));
        const drifts = gsap.utils.toArray<SVGGElement>(root.querySelectorAll('[data-seigaiha="drift"]'));
        const strokes = gsap.utils.toArray<SVGPathElement>(root.querySelectorAll('[data-seigaiha="stroke"]'));
        const sun = root.querySelector<HTMLElement>('[data-seigaiha="sun"]');
        if (!sun || rows.length === 0) return;

        const mm = gsap.matchMedia();
        mm.add("(prefers-reduced-motion: no-preference)", () => {
            const css = getComputedStyle(document.documentElement);
            const token = (name: string) => css.getPropertyValue(name).trim();

            // Intro: plays once per page load, not again on resize.
            let intro: gsap.core.Timeline | null = null;
            if (!introPlayed.current) {
                introPlayed.current = true;
                intro = gsap.timeline()
                    .from(strokes, {
                        drawSVG: "50% 50%",
                        duration: 1.2,
                        ease: "power2.inOut",
                        stagger: { each: 0.035, from: "center" },
                    }, 0)
                    .from(sun, { yPercent: 70, duration: 1.8, ease: "expo.out" }, 0);
            }

            // Scroll: the sun sets into the sea; the far rows lag behind the near ones.
            const trigger = sectionRef.current ?? root;
            const scroll = gsap.timeline({
                defaults: { ease: "none" },
                scrollTrigger: { trigger, start: "top top", end: "bottom top", scrub: 0.6 },
            })
                .fromTo(sun, { y: 0, backgroundColor: token("--sun") }, { y: () => sun.offsetHeight * 0.55, backgroundColor: token("--sun-warm") }, 0);
            rows.forEach((row, index) => {
                const depth = 1 - index / Math.max(1, rows.length - 1);
                scroll.to(row, { y: Math.round(depth * 28) }, 0);
            });

            // Ambient: one period of drift per loop, alternating directions, slow.
            const ambient = gsap.timeline({ paused: true });
            drifts.forEach((drift, index) => {
                const direction = index % 2 === 0 ? -1 : 1;
                ambient.to(drift, {
                    x: direction * field.period,
                    duration: 48 + (index % 5) * 9,
                    ease: "none",
                    repeat: -1,
                }, 0);
            });

            const startAmbient = () => ambient.play();
            if (intro) intro.eventCallback("onComplete", startAmbient);
            else startAmbient();

            const visibility = ScrollTrigger.create({
                trigger,
                start: "top bottom",
                end: "bottom top",
                onToggle: (self) => {
                    if (intro?.isActive()) return;
                    if (self.isActive) ambient.play();
                    else ambient.pause();
                },
            });

            return () => {
                visibility.kill();
                ambient.kill();
            };
        });

        return () => mm.revert();
    }, { scope, dependencies: [field], revertOnUpdate: true });

    return scope;
}
