import { useRef, useState } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";

/** ScrollTrigger id of the pinned emakimono: `ScrollTrigger.getById(EMAKI_PIN_ID)`. */
export const EMAKI_PIN_ID = "emaki-pin";

/**
 * The scroll range (document px) over which the emakimono is pinned and
 * unrolls, or null when it is not pinned (narrow viewports, reduced motion).
 * Also mirrored on the section as `data-emaki-start` / `data-emaki-end`.
 */
export function getEmakiPinRange(): { start: number; end: number } | null {
    const trigger = ScrollTrigger.getById(EMAKI_PIN_ID);
    return trigger ? { start: trigger.start, end: trigger.end } : null;
}

const PINNED = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";
const STACKED = "(max-width: 1023.98px) and (prefers-reduced-motion: no-preference)";

// How far a fan drifts along the horizon as its panel crosses the viewport (px, each way).
const DRIFT = 24;

const drawFan = (panel: Element, delay = 0) =>
    gsap.to(panel.querySelectorAll("[data-emaki-arc]"), {
        drawSVG: "0% 100%",
        duration: 1.1,
        ease: "power3.out",
        stagger: 0.08,
        delay,
    });

/**
 * The emakimono (horizontal hand-scroll) behaviour of a section.
 *
 * Markup contract, inside the returned `scope`:
 * - `[data-emaki-heading]`: the heading block (its reveal is components/ui/TextReveal);
 * - `[data-emaki-viewport]` > `[data-emaki-track]`: the track that translates;
 * - `[data-emaki-panel]` (one per item) holding a `[data-emaki-fan]` with `[data-emaki-arc]` paths.
 *
 * From 1024px (motion allowed) the section gets `data-emaki="pinned"` (CSS lays the
 * track out horizontally from that), pins, and vertical scroll unrolls the track
 * (one scrubbed translate). Each fan draws as its panel enters and drifts gently
 * along the horizon. Focusing inside a panel scrolls the pin so the panel is fully
 * in view. Below 1024px the panels stack and cascade in; reduced motion shows
 * everything static. Without JS the stacked layout is the default.
 *
 * Returns the scope ref and the active panel index (for a progress indicator).
 */
export function useEmakiScroll(count: number) {
    const scope = useRef<HTMLElement>(null);
    const [active, setActive] = useState(0);

    useGSAP(() => {
        const section = scope.current;
        const viewport = section?.querySelector<HTMLElement>("[data-emaki-viewport]");
        const track = section?.querySelector<HTMLElement>("[data-emaki-track]");
        if (!section || !viewport || !track) return;
        const panels = gsap.utils.toArray<HTMLElement>("[data-emaki-panel]", section);
        const arcs = section.querySelectorAll("[data-emaki-arc]");

        const mm = gsap.matchMedia();

        mm.add(PINNED, () => {
            section.dataset.emaki = "pinned";
            gsap.set(arcs, { drawSVG: "50% 50%" });

            const fans = panels.map((panel) => panel.querySelector<HTMLElement>("[data-emaki-fan]"));
            const setFanX = fans.map((fan) => (fan ? gsap.quickSetter(fan, "x", "px") : () => { }));
            const drawn = new Set<number>();
            const draws: gsap.core.Tween[] = [];
            let entered = false;

            const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);

            // Driven by the scrubbed track position, so fans follow the smoothed motion.
            const sync = () => {
                const x = Number(gsap.getProperty(track, "x")) || 0;
                const width = viewport.clientWidth;
                panels.forEach((panel, index) => {
                    const left = panel.offsetLeft + x;
                    const center = left + panel.offsetWidth / 2;
                    setFanX[index](gsap.utils.clamp(-1, 1, (center - width / 2) / width) * DRIFT);
                    if (entered && !drawn.has(index) && left < width * 0.8) {
                        drawn.add(index);
                        draws.push(drawFan(panel, drawn.size === 1 ? 0.15 : 0));
                    }
                });
            };

            const unroll = gsap.to(track, { x: () => -distance(), ease: "none", onUpdate: sync });

            const pin = ScrollTrigger.create({
                id: EMAKI_PIN_ID,
                trigger: section,
                start: "top top",
                end: () => `+=${distance()}`,
                pin: true,
                scrub: 0.8,
                animation: unroll,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                // Refresh before every trigger created earlier (sun, paper day), so their
                // positions below this section already include the pin spacing.
                refreshPriority: 1,
                onUpdate: (self) => {
                    const index = Math.round(self.progress * (count - 1));
                    setActive((previous) => (previous === index ? previous : index));
                },
                onRefresh: (self) => {
                    section.dataset.emakiStart = String(Math.round(self.start));
                    section.dataset.emakiEnd = String(Math.round(self.end));
                    sync();
                },
            });

            const reveal = ScrollTrigger.create({
                trigger: section,
                start: "top 60%",
                once: true,
                onEnter: () => {
                    entered = true;
                    sync();
                },
            });

            // Keyboard: bring the focused panel fully into view by scrolling the pin.
            const onFocus = (event: FocusEvent) => {
                const panel = (event.target as Element | null)?.closest<HTMLElement>("[data-emaki-panel]");
                const range = distance();
                if (!panel || range <= 0) return;
                const width = viewport.clientWidth;
                const inset = parseFloat(getComputedStyle(track).paddingLeft) || 0;
                const current = -(Number(gsap.getProperty(track, "x")) || 0);
                let target = current;
                if (panel.offsetLeft - current < inset) target = panel.offsetLeft - inset;
                else if (panel.offsetLeft + panel.offsetWidth - current > width - inset) {
                    target = panel.offsetLeft + panel.offsetWidth - (width - inset);
                }
                const progress = gsap.utils.clamp(0, 1, target / range);
                const top = pin.start + progress * (pin.end - pin.start);
                if (Math.abs(window.scrollY - top) > 1) window.scrollTo({ top, behavior: "instant" });
            };
            section.addEventListener("focusin", onFocus);

            ScrollTrigger.refresh();

            return () => {
                section.removeEventListener("focusin", onFocus);
                draws.forEach((tween) => tween.kill());
                pin.kill();
                reveal.kill();
                unroll.kill();
                gsap.set(track, { clearProps: "transform" });
                gsap.set(fans.filter(Boolean), { clearProps: "transform" });
                delete section.dataset.emaki;
                delete section.dataset.emakiStart;
                delete section.dataset.emakiEnd;
                setActive(0);
            };
        });

        mm.add(STACKED, () => {
            gsap.set(panels, { opacity: 0, y: 16 });
            gsap.set(arcs, { drawSVG: "50% 50%" });
            const tweens: gsap.core.Tween[] = [];
            const triggers = ScrollTrigger.batch(panels, {
                start: "top 88%",
                once: true,
                onEnter: (batch) => {
                    tweens.push(gsap.to(batch, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.08 }));
                    batch.forEach((panel, index) => tweens.push(drawFan(panel, 0.2 + index * 0.08)));
                },
            });
            return () => {
                tweens.forEach((tween) => tween.kill());
                triggers.forEach((trigger) => trigger.kill());
            };
        });

        return () => mm.revert();
    }, { scope, dependencies: [count] });

    return { scope, active };
}
