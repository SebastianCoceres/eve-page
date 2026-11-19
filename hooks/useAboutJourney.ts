import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { revealLinesOnEnter, splitLines } from "@/lib/splitLines";

/**
 * Sobre mí's text as a journey (see components/sections/SobreMi).
 *
 * Markup contract, inside the returned `scope`:
 * - `[data-about-chapter]` (one per paragraph), holding `[data-chapter-text]` and a
 *   small seigaiha fan in the margin (`[data-emaki-arc]` paths, EmakiFan);
 * - `[data-about-close]`: the closing line; `[data-about-cta]`: its actions.
 *
 * With motion, at every width:
 * - each chapter's lines fade in on enter (RevealLead's gesture, 80ms apart) while
 *   its fan draws from the centre outward (0.6s, power2.out), a milestone on the scroll;
 * - the key phrases (`em`, Geist 500) start in the muted tone and turn to full ink
 *   as they cross the reading zone (72% → 52% of the viewport), scrubbed and flat;
 * - the close is spoken with the scroll: its masked lines rise (yPercent 130 → 0,
 *   scrub 0.6) as it enters, done once the whole line is in view; the actions fade up once.
 * The portrait column's stickiness is CSS (from 1280px); the sun behind Eve is
 * useTravelingSun's. Reduced motion: nothing runs, the emphasis stays in full ink.
 */
export function useAboutJourney() {
    const scope = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const root = scope.current;
        if (!root) return;
        const mm = gsap.matchMedia();

        mm.add("(prefers-reduced-motion: no-preference)", () => {
            const css = getComputedStyle(document.documentElement);
            const muted = css.getPropertyValue("--muted-foreground").trim();
            const ink = css.getPropertyValue("--foreground").trim();
            const cleanups: Array<() => void> = [];

            gsap.utils.toArray<HTMLElement>("[data-about-chapter]", root).forEach((chapter) => {
                const text = chapter.querySelector<HTMLElement>("[data-chapter-text]");
                if (!text) return;
                gsap.from(chapter.querySelectorAll("[data-emaki-arc]"), {
                    drawSVG: "50% 50%",
                    duration: 0.6,
                    ease: "power2.out",
                    stagger: 0.08,
                    scrollTrigger: { trigger: chapter, start: "top 85%", once: true },
                });

                // The split clones each emphasis per line: tween the fresh pieces on every split.
                let emphasis: gsap.core.Tween[] = [];
                const clear = () => {
                    emphasis.forEach((tween) => {
                        tween.scrollTrigger?.kill();
                        tween.revert();
                    });
                    emphasis = [];
                };
                const split = revealLinesOnEnter(text, {
                    onLines: () => {
                        clear();
                        emphasis = gsap.utils.toArray<HTMLElement>("em", text).map((em) => gsap.fromTo(em,
                            { color: muted },
                            { color: ink, ease: "none", scrollTrigger: { trigger: em, start: "top 72%", end: "top 52%", scrub: true } },
                        ));
                    },
                });
                cleanups.push(() => {
                    clear();
                    split.revert();
                });
            });

            const close = root.querySelector<HTMLElement>("[data-about-close]");
            if (close) {
                let rise: gsap.core.Tween | null = null;
                const split = splitLines(close, (lines) => {
                    rise = gsap.from(lines, {
                        yPercent: 130,
                        ease: "power3.out",
                        stagger: 0.25,
                        // Done by the time the whole line is in view (its bottom 4% above the fold): never half risen at rest.
                        scrollTrigger: { trigger: close, start: "top bottom", end: "bottom 96%", scrub: 0.6 },
                    });
                    return rise;
                });
                cleanups.push(() => {
                    rise?.scrollTrigger?.kill();
                    split.revert();
                });
            }

            const actions = root.querySelector("[data-about-cta]");
            if (actions) {
                gsap.from(actions.children, {
                    opacity: 0,
                    y: 12,
                    duration: 0.6,
                    ease: "power3.out",
                    stagger: 0.08,
                    scrollTrigger: { trigger: actions, start: "top 92%", once: true },
                });
            }

            return () => cleanups.forEach((cleanup) => cleanup());
        });

        return () => mm.revert();
    }, { scope });

    return scope;
}
