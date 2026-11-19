import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { revealLinesOnEnter, splitLines } from "@/lib/splitLines";

/** ScrollTrigger id of the pinned Mi enfoque stage: `ScrollTrigger.getById(FOCUS_PIN_ID)`. */
export const FOCUS_PIN_ID = "focus-pin";

/** The Mi enfoque pin's scroll range (document px), or null when it is not pinned. */
export function getFocusPinRange(): { start: number; end: number } | null {
    const trigger = ScrollTrigger.getById(FOCUS_PIN_ID);
    return trigger ? { start: trigger.start, end: trigger.end } : null;
}

/** Pin length as a share of the viewport height. */
export const FOCUS_PIN_LENGTH = 1.6;
/** Where the stage pins: 32px under the 64px navbar. */
const PIN_TOP = 96;

const PINNED = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";
const FLOW = "(max-width: 767.98px) and (prefers-reduced-motion: no-preference)";

/**
 * Mi enfoque: a contrast told line by line, then a mondō (question and answer).
 *
 * Markup contract, inside the returned `scope` (the section):
 * - `[data-focus-stage]`: the heading and the scene, the element that pins;
 * - `[data-focus-lead]`: the statement, whose first half is a muted span and whose
 *   second half (from "el marketing consciente prioriza…") is in full ink;
 * - `[data-focus-pair]` (two), each with `[data-focus-question]` and `[data-focus-answer]`.
 *
 * From 768px with motion, the section gets `data-focus="pinned"` (CSS lays the lead
 * and the two pairs in one cell) and the stage pins 96px from the top for 160% of
 * the viewport height. One scrubbed scene runs from the moment the stage is at 80%
 * of the viewport to the end of the pin:
 * - 3–40%: the statement is spoken line by line (masked lines, yPercent 130 → 0);
 *   the previous line dims to 0.42, so the muted half reads quieter still;
 * - 40–50%: every line returns to full opacity: the muted half and the ink half
 *   stand side by side (the turn);
 * - 50–55%: the statement steps back (up and out);
 * - 54–76%: the first question rises, its answer settles below (centred in the
 *   room the statement held), a short read, then it steps back;
 * - 75–100%: the second question and its answer, read to the unpin.
 * The sun rises to midday in the free zone to the right during the pin
 * (useTravelingSun, which reads this pin's range). If the stage cannot fit under
 * the navbar the section stays in the flow, as below 768px: the lines fade in on
 * enter and each question rises with its answer. Reduced motion: nothing runs.
 */
export function useFocusScene() {
    const scope = useRef<HTMLElement>(null);

    useGSAP(() => {
        const section = scope.current;
        const stage = section?.querySelector<HTMLElement>("[data-focus-stage]");
        const lead = section?.querySelector<HTMLElement>("[data-focus-lead]");
        if (!section || !stage || !lead) return;
        const pairs = gsap.utils.toArray<HTMLElement>("[data-focus-pair]", section);
        const partsOf = (pair: HTMLElement) => ({
            question: pair.querySelector<HTMLElement>("[data-focus-question]"),
            answer: pair.querySelector<HTMLElement>("[data-focus-answer]"),
        });

        const flow = () => {
            const split = revealLinesOnEnter(lead);
            const entrances = pairs.map((pair) => {
                const { question, answer } = partsOf(pair);
                const timeline = gsap.timeline({ scrollTrigger: { trigger: pair, start: "top 85%", once: true } });
                timeline.from(question, { yPercent: 40, opacity: 0, duration: 1, ease: "expo.out" }, 0)
                    .from(answer, { y: 12, opacity: 0, duration: 0.9, ease: "power3.out" }, 0.15);
                return timeline;
            });
            return () => {
                entrances.forEach((timeline) => {
                    timeline.scrollTrigger?.kill();
                    timeline.revert();
                });
                split.revert();
            };
        };

        const mm = gsap.matchMedia();

        mm.add(PINNED, () => {
            section.dataset.focus = "pinned";
            // A stage taller than the room under the navbar would be cut: keep the flow.
            if (stage.offsetHeight > window.innerHeight - PIN_TOP - 16) {
                delete section.dataset.focus;
                return flow();
            }
            let pin: ScrollTrigger | null = null;
            let play: ScrollTrigger | null = null;

            const build = (lines: HTMLElement[]) => {
                pin?.kill();
                play?.kill();
                const scene = gsap.timeline({ defaults: { ease: "none" } });

                const step = 0.35 / Math.max(1, lines.length);
                lines.forEach((line, index) => {
                    const at = 0.03 + index * step;
                    scene.fromTo(line, { yPercent: 130 }, { yPercent: 0, duration: step * 1.2, ease: "power3.out" }, at);
                    if (index > 0) scene.to(lines[index - 1], { opacity: 0.42, duration: step * 0.6 }, at);
                });
                // The turn: every line back to full opacity, muted half beside ink half.
                scene.to(lines, { opacity: 1, duration: 0.04 }, 0.4);
                scene.to(lead, { y: -32, opacity: 0, duration: 0.05, ease: "power2.in" }, 0.5);

                pairs.forEach((pair, index) => {
                    const { question, answer } = partsOf(pair);
                    const at = 0.54 + index * 0.21;
                    scene.fromTo(question, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.07, ease: "power3.out" }, at);
                    scene.fromTo(answer, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.07, ease: "power3.out" }, at + 0.04);
                    if (index < pairs.length - 1) scene.to(pair, { y: -24, opacity: 0, duration: 0.04, ease: "power2.in" }, at + 0.17);
                });
                // Held to the end, so the last answer is read before the unpin.
                scene.to({}, { duration: 0.02 }, 0.98);

                pin = ScrollTrigger.create({
                    id: FOCUS_PIN_ID,
                    trigger: stage,
                    start: `top ${PIN_TOP}px`,
                    end: () => `+=${Math.round(window.innerHeight * FOCUS_PIN_LENGTH)}`,
                    pin: true,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                    // After the hero (its spacer moves this one), before the emakimono and the sun.
                    refreshPriority: 2,
                });
                const range = pin;
                play = ScrollTrigger.create({
                    trigger: stage,
                    start: "top 80%",
                    end: () => range.end,
                    // Exact, like the sun's timeline: the scene and the rising sun stay in step.
                    scrub: true,
                    animation: scene,
                    invalidateOnRefresh: true,
                    refreshPriority: 2,
                });
                return scene;
            };

            const split = splitLines(lead, build);
            ScrollTrigger.refresh();

            return () => {
                pin?.kill();
                play?.kill();
                split.revert();
                gsap.set([lead, ...pairs, ...pairs.flatMap((pair) => Object.values(partsOf(pair)))].filter(Boolean), { clearProps: "transform,opacity" });
                delete section.dataset.focus;
            };
        });

        mm.add(FLOW, flow);

        return () => mm.revert();
    }, { scope });

    return scope;
}
