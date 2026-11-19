import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { splitLines } from "@/lib/splitLines";

/**
 * Sobre mí's text as a journey (see components/sections/SobreMi).
 *
 * Markup contract, inside the returned `scope`:
 * - `[data-about-open]`: the opening line (a statement);
 * - `[data-about-milestone]` (five), each with `[data-about-point]` (the mincho line),
 *   `[data-about-note]` and a small seigaiha fan (`[data-emaki-arc]` paths, EmakiFan);
 * - `[data-about-close]`: the closing line; `[data-about-cta]`: its actions.
 *
 * With motion, at every width, each piece is told with the scroll, one at a time:
 * - the opening line and every milestone rise into place (y 32 → 0, fading in) as
 *   they enter, starting in the muted tone and turning to full ink; the colour is
 *   done when the piece is about 60% down the viewport and holds in ink from there
 *   (scrubbed, flat), so nothing is read half dark;
 * - each milestone's fan draws from the centre outward (0.6s, power2.out) and its
 *   note fades in after the line;
 * - the close is spoken with the scroll: its masked lines rise (yPercent 130 → 0,
 *   scrub 0.6) as it enters, done once the whole line is in view; the actions fade up once.
 * The left column's stickiness is CSS (from 1280px); the sun parked there is
 * useTravelingSun's. Reduced motion: nothing runs, everything in full ink.
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

            // Rise, then muted → ink; the last 30% of the range holds the line in full ink.
            const tell = (trigger: HTMLElement, line: HTMLElement, note?: HTMLElement | null) => {
                const timeline = gsap.timeline({
                    defaults: { ease: "none" },
                    scrollTrigger: { trigger, start: "top 92%", end: "top 48%", scrub: true },
                });
                timeline.fromTo(line, { y: 32, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: "power3.out" }, 0)
                    .fromTo(line, { color: muted }, { color: ink, duration: 0.55 }, 0.15);
                if (note) timeline.fromTo(note, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.3);
                timeline.set({}, {}, 1);
                cleanups.push(() => {
                    timeline.scrollTrigger?.kill();
                    timeline.revert();
                });
            };

            const open = root.querySelector<HTMLElement>("[data-about-open]");
            if (open) tell(open, open);

            gsap.utils.toArray<HTMLElement>("[data-about-milestone]", root).forEach((milestone) => {
                const point = milestone.querySelector<HTMLElement>("[data-about-point]");
                if (!point) return;
                gsap.from(milestone.querySelectorAll("[data-emaki-arc]"), {
                    drawSVG: "50% 50%",
                    duration: 0.6,
                    ease: "power2.out",
                    stagger: 0.08,
                    scrollTrigger: { trigger: milestone, start: "top 85%", once: true },
                });
                tell(milestone, point, milestone.querySelector<HTMLElement>("[data-about-note]"));
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
