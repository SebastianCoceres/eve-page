import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { splitLines } from "@/lib/splitLines";

/** ScrollTrigger id of the pinned hero: `ScrollTrigger.getById(HERO_PIN_ID)`. */
export const HERO_PIN_ID = "hero-pin";

/** The hero pin's scroll range (document px), or null when the hero is not pinned. */
export function getHeroPinRange(): { start: number; end: number } | null {
    const trigger = ScrollTrigger.getById(HERO_PIN_ID);
    return trigger ? { start: trigger.start, end: trigger.end } : null;
}

/** Pin length as a share of the viewport height. */
export const HERO_PIN_LENGTH = 1.4;
/** The name's scale once the lockup has shrunk to the top left. */
const LOCKUP_SCALE = 0.42;

const PINNED = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";
const FLOW = "(max-width: 767.98px) and (prefers-reduced-motion: no-preference)";

/**
 * Hero "Amanecer" (see components/sections/Hero).
 *
 * Load, one gesture (~1.6s, motion allowed): the sea's lines draw (useSeaField), the
 * name's letters rise out of their line masks (expo.out, 35ms apart), the sun rises
 * (useTravelingSun), the subline settles, the cobalt hairline draws, the CTAs fade up.
 *
 * Scroll, from 768px: the section pins for 140% of the viewport height (scrub, exact).
 * - 0–25%: the name shrinks to 42% toward the top left; the subline and CTAs ride up
 *   with it, the hairline fades, the sea sinks as the sun climbs (the sun itself is
 *   driven by useTravelingSun over the same range, read from this pin);
 * - 18–58%: the greeting is spoken line by line (SplitText lines with masks); the
 *   previous line dims slightly; at 58–63% every line returns to full ink and holds;
 * - 64–~92%: the values arrive from the right as one row and settle; held to the unpin.
 * Below 768px nothing pins: the greeting's lines rise with the scroll as it passes,
 * and the values drift in. Reduced motion: nothing runs, everything is visible.
 */
export function useHeroAnimation() {
    const scope = useRef<HTMLElement>(null);

    useGSAP(() => {
        const section = scope.current;
        if (!section) return;
        const one = <T extends Element>(selector: string) => section.querySelector<T>(selector);
        const logo = one<HTMLElement>("[data-hero-logo]");
        const rest = one<HTMLElement>("[data-hero-rest]");
        const subline = one("[data-hero-subline]");
        const rule = one("[data-hero-rule]");
        const lead = one<HTMLElement>("[data-hero-lead]");
        const sea = one('[data-sea-field="hero"]');
        const letters = section.querySelectorAll("[data-logo-letter]");
        const ctas = section.querySelectorAll("[data-hero-cta]");
        const values = gsap.utils.toArray<HTMLElement>("[data-hero-value]", section);
        if (!logo || !rest || !lead) return;

        const mm = gsap.matchMedia();

        mm.add("(prefers-reduced-motion: no-preference)", () => {
            const intro = gsap.timeline();
            intro.from(letters, { y: 118, duration: 1.0, ease: "expo.out", stagger: 0.035 }, 0.1)
                .from(subline, { opacity: 0, y: 8, duration: 0.6, ease: "power3.out" }, 0.75)
                .from(rule, { scaleX: 0, duration: 0.7, ease: "power3.inOut" }, 0.85)
                .from(ctas, { opacity: 0, y: 12, duration: 0.6, ease: "power3.out", stagger: 0.08 }, 1.0);
        });

        mm.add(PINNED, () => {
            section.dataset.hero = "pinned";
            let pin: ScrollTrigger | null = null;

            const build = (lines: Element[]) => {
                pin?.kill();
                const scene = gsap.timeline({ defaults: { ease: "none" } });
                scene.to(logo, { scale: LOCKUP_SCALE, transformOrigin: "0% 0%", duration: 0.25, ease: "power2.inOut" }, 0)
                    .to(rest, { y: () => -logo.offsetHeight * (1 - LOCKUP_SCALE), duration: 0.25, ease: "power2.inOut" }, 0)
                    .to(rule, { opacity: 0, duration: 0.1 }, 0)
                    .to(sea, { yPercent: 45, duration: 0.45, ease: "power1.inOut" }, 0);

                const step = 0.38 / Math.max(1, lines.length);
                lines.forEach((line, index) => {
                    const at = 0.18 + index * step;
                    scene.fromTo(line, { yPercent: 130 }, { yPercent: 0, duration: step * 1.2, ease: "power3.out" }, at);
                    if (index > 0) scene.to(lines[index - 1], { opacity: 0.42, duration: step * 0.6 }, at);
                });
                // Every line back to full ink well before the unpin, and held there.
                scene.to(lines, { opacity: 1, duration: 0.05 }, 0.58);

                scene.fromTo(values,
                    { x: (index: number) => window.innerWidth * (0.42 + index * 0.14), opacity: 0 },
                    { x: 0, opacity: 1, duration: 0.22, ease: "power3.out", stagger: 0.03 },
                    0.64,
                );
                // A hold at the end, so the greeting in full ink and the settled row are read before the unpin.
                scene.set({}, {}, 1);

                pin = ScrollTrigger.create({
                    id: HERO_PIN_ID,
                    trigger: section,
                    start: "top 64px",
                    end: () => `+=${Math.round(window.innerHeight * HERO_PIN_LENGTH)}`,
                    pin: true,
                    // Exact, like the sun's timeline: the lockup, the lines and the rising sun never drift apart.
                    scrub: true,
                    animation: scene,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                    // Refresh first: every trigger below (Mi enfoque, emakimono, sun, paper) includes its spacing.
                    refreshPriority: 3,
                });
                return scene;
            };

            const split = splitLines(lead, build);
            ScrollTrigger.refresh();

            return () => {
                pin?.kill();
                split.revert();
                gsap.set([logo, rest, sea, rule, ...values], { clearProps: "transform,opacity" });
                delete section.dataset.hero;
            };
        });

        mm.add(FLOW, () => {
            const split = splitLines(lead, (lines) => gsap.from(lines, {
                yPercent: 130,
                ease: "power3.out",
                stagger: 0.25,
                scrollTrigger: { trigger: lead, start: "top 92%", end: "bottom 62%", scrub: 0.6 },
            }));
            const drift = gsap.from(values, {
                x: (index: number) => 48 + index * 40,
                opacity: 0,
                ease: "power3.out",
                stagger: 0.15,
                scrollTrigger: { trigger: values[0], start: "top 95%", end: "top 70%", scrub: 0.6 },
            });
            return () => {
                drift.scrollTrigger?.kill();
                drift.kill();
                split.revert();
            };
        });

        return () => mm.revert();
    }, { scope });

    return scope;
}
