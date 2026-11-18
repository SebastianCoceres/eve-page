import { gsap, useGSAP } from "@/lib/gsap";

const STOPS = ["--paper-morning", "--paper-midday", "--paper-afternoon", "--paper-dusk"] as const;

/**
 * The paper's day: one scroll-scrubbed tween on two custom properties of <html>,
 * `--paper` (the washi ground every surface derives from, see app/globals.css)
 * and `--sun-now` (the travelling sun's colour). Flat colours only, never
 * gradients: the whole page is one paper colour at any scroll position.
 *
 * - morning washi at the top of the hero;
 * - midday kinari as Servicios reaches the middle of the viewport;
 * - an autumn afternoon as Sobre mí does (the sun starts to warm);
 * - dusk at the end of the page, with the sun set in persimmon.
 *
 * Rebuilt when the document height changes, because the stops follow the live
 * section positions. Reduced motion: nothing runs; CSS holds a static midday.
 */
export function usePaperDay() {
    useGSAP(() => {
        const mm = gsap.matchMedia();
        mm.add("(prefers-reduced-motion: no-preference)", () => {
            const root = document.documentElement;
            const css = getComputedStyle(root);
            const read = (name: string) => css.getPropertyValue(name).trim();
            const paper = STOPS.map(read);
            const sun = read("--sun");
            const warm = read("--sun-warm");
            const sunAt = [sun, sun, gsap.utils.interpolate(sun, warm, 0.45), warm];

            let tween: gsap.core.Tween | null = null;

            const build = () => {
                tween?.scrollTrigger?.kill();
                tween?.kill();
                const vh = window.innerHeight;
                const max = Math.max(1, root.scrollHeight - vh);
                const at = (id: string, fallback: number) => {
                    const element = document.getElementById(id);
                    if (!element) return fallback;
                    const top = element.getBoundingClientRect().top + window.scrollY;
                    return gsap.utils.clamp(0.05, 0.95, (top - vh * 0.5) / max);
                };
                const midday = at("services", 0.35);
                const afternoon = Math.max(midday + 0.05, at("about", 0.65));
                const pct = (value: number) => `${Math.round(value * 1000) / 10}%`;
                const stop = (index: number) => ({ "--paper": paper[index], "--sun-now": sunAt[index] });

                gsap.set(root, stop(0));
                tween = gsap.to(root, {
                    keyframes: {
                        "0%": stop(0),
                        [pct(midday)]: stop(1),
                        [pct(afternoon)]: stop(2),
                        "100%": stop(3),
                        easeEach: "none",
                    },
                    ease: "none",
                    scrollTrigger: { start: 0, end: "max", scrub: 0.6 },
                });
            };

            build();
            let frame = 0;
            let lastHeight = root.scrollHeight;
            const observer = new ResizeObserver(() => {
                if (root.scrollHeight === lastHeight) return;
                lastHeight = root.scrollHeight;
                cancelAnimationFrame(frame);
                frame = requestAnimationFrame(build);
            });
            observer.observe(document.body);

            return () => {
                observer.disconnect();
                cancelAnimationFrame(frame);
                tween?.scrollTrigger?.kill();
                tween?.kill();
                root.style.removeProperty("--paper");
                root.style.removeProperty("--sun-now");
            };
        });
        return () => mm.revert();
    });
}
