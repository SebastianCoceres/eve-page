import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";

/** ScrollTrigger id of the pinned Mi enfoque stage: `ScrollTrigger.getById(FOCUS_PIN_ID)`. */
export const FOCUS_PIN_ID = "focus-pin";

/** The Mi enfoque pin's scroll range (document px), or null when it is not pinned. */
export function getFocusPinRange(): { start: number; end: number } | null {
    const trigger = ScrollTrigger.getById(FOCUS_PIN_ID);
    return trigger ? { start: trigger.start, end: trigger.end } : null;
}

/** Pin length as a share of the viewport height. */
export const FOCUS_PIN_LENGTH = 2.8;
/** Where the stage pins: 32px under the 64px navbar. */
export const FOCUS_PIN_TOP = 96;

/**
 * The scene's phases, as shares of the pin. The sun's leg (useTravelingSun) reads
 * the same numbers, so the two acts and the sun's crossing stay in one rhythm.
 * - act 1, the problem (text left, sun right): its items arrive from PROBLEM_FROM,
 *   ITEM_STEP apart, each reaching full ink INK_AFTER later; then a hold, and the act
 *   steps back over [PROBLEM_OUT, PROBLEM_OUT + OUT];
 * - the sun crosses from right to left over CROSS;
 * - act 2, the answer (text right, sun left): its label at ANSWER_FROM and its items
 *   from ANSWER_FROM + LABEL, ITEM_STEP apart, all in full ink well before the end.
 */
export const FOCUS_SCENE = {
    PROBLEM_FROM: 0.02,
    PROBLEM_OUT: 0.34,
    OUT: 0.06,
    CROSS: [0.37, 0.57] as const,
    ANSWER_FROM: 0.53,
    LABEL: 0.04,
    ITEM_STEP: 0.07,
    ANSWER_STEP: 0.07,
    /** An item rises over RISE and turns from muted to ink over [RISE / 2, INK_AFTER]. */
    RISE: 0.05,
    INK_AFTER: 0.08,
} as const;

const PINNED = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";
const FLOW = "(max-width: 1023.98px) and (prefers-reduced-motion: no-preference)";

/**
 * Mi enfoque in two acts: the problem, then the answer.
 *
 * Markup contract, inside the returned `scope` (the section):
 * - `[data-focus-stage]`: the heading and the scene, the element that pins;
 * - `[data-focus-act]` (two: "problem", then "answer"), each with a
 *   `[data-focus-label]` and its `[data-focus-item]`s, each item holding a
 *   `[data-focus-point]` (the mincho headline) and an optional `[data-focus-note]`.
 *
 * From 1024px with motion the section gets `data-focus="pinned"` (CSS lays both acts
 * in one grid row: the problem on the left, the answer on the right) and the stage
 * pins 96px from the top for 280% of the viewport height, scrubbed exactly like the
 * sun (FOCUS_SCENE has the phases):
 * - act 1: the problem's items rise one by one, each starting in the muted tone and
 *   turning to full ink; all of them hold in ink for a beat, then the act steps back;
 * - the sun crosses the sky from right to left (useTravelingSun);
 * - act 2: the answer's label and items arrive one by one on the right, each turning
 *   to full ink, and hold in ink until the unpin.
 * If the stage cannot fit under the navbar the section stays in the flow. Below
 * 1024px the acts are stacked and each item rises once on enter, already in ink.
 * Reduced motion and no JS: everything static, stacked and in full ink.
 */
export function useFocusScene() {
    const scope = useRef<HTMLElement>(null);

    useGSAP(() => {
        const section = scope.current;
        const stage = section?.querySelector<HTMLElement>("[data-focus-stage]");
        if (!section || !stage) return;
        const acts = gsap.utils.toArray<HTMLElement>("[data-focus-act]", section);
        const [problem, answer] = acts;
        if (!problem || !answer) return;
        const partsOf = (act: HTMLElement) => ({
            label: act.querySelector<HTMLElement>("[data-focus-label]"),
            items: gsap.utils.toArray<HTMLElement>("[data-focus-item]", act),
        });
        const pieceOf = (item: HTMLElement) => ({
            point: item.querySelector<HTMLElement>("[data-focus-point]"),
            note: item.querySelector<HTMLElement>("[data-focus-note]"),
        });
        const everything = () => acts.flatMap((act) => {
            const { label, items } = partsOf(act);
            return [act, label, ...items, ...items.flatMap((item) => Object.values(pieceOf(item)))];
        }).filter(Boolean) as HTMLElement[];

        // Below the breakpoint (or when the stage is too tall): each label and item rises once on enter.
        const flow = () => {
            const entrances = acts.flatMap((act) => {
                const { label, items } = partsOf(act);
                return [label, ...items].filter(Boolean).map((element) => gsap.from(element, {
                    y: 24,
                    opacity: 0,
                    duration: 0.9,
                    ease: "power3.out",
                    scrollTrigger: { trigger: element, start: "top 88%", once: true },
                }));
            });
            return () => entrances.forEach((tween) => {
                tween.scrollTrigger?.kill();
                tween.revert();
            });
        };

        const mm = gsap.matchMedia();

        mm.add(PINNED, () => {
            section.dataset.focus = "pinned";
            // A stage taller than the room under the navbar would be cut: keep the flow.
            if (stage.offsetHeight > window.innerHeight - FOCUS_PIN_TOP - 16) {
                delete section.dataset.focus;
                return flow();
            }
            const css = getComputedStyle(document.documentElement);
            const muted = css.getPropertyValue("--muted-foreground").trim();
            const ink = css.getPropertyValue("--foreground").trim();
            const S = FOCUS_SCENE;

            const scene = gsap.timeline({ defaults: { ease: "none" } });
            // An item rises in the muted tone, then turns to full ink while it settles.
            const arrive = (item: HTMLElement, at: number) => {
                const { point, note } = pieceOf(item);
                scene.fromTo(item, { y: 32, opacity: 0 }, { y: 0, opacity: 1, duration: S.RISE, ease: "power3.out" }, at);
                if (point) scene.fromTo(point, { color: muted }, { color: ink, duration: S.INK_AFTER - S.RISE / 2 }, at + S.RISE / 2);
                if (note) scene.fromTo(note, { opacity: 0 }, { opacity: 1, duration: S.RISE }, at + S.RISE / 2);
            };

            const first = partsOf(problem);
            first.items.forEach((item, index) => arrive(item, S.PROBLEM_FROM + index * S.ITEM_STEP));
            // All in ink, held; then the problem steps back as the sun starts to cross.
            scene.to(problem, { y: -40, opacity: 0, duration: S.OUT, ease: "power2.in" }, S.PROBLEM_OUT);

            const second = partsOf(answer);
            if (second.label) {
                scene.fromTo(second.label, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: S.LABEL, ease: "power3.out" }, S.ANSWER_FROM);
            }
            second.items.forEach((item, index) => arrive(item, S.ANSWER_FROM + S.LABEL + index * S.ANSWER_STEP));
            // Held in ink to the unpin.
            scene.set({}, {}, 1);

            const pin = ScrollTrigger.create({
                id: FOCUS_PIN_ID,
                trigger: stage,
                start: `top ${FOCUS_PIN_TOP}px`,
                end: () => `+=${Math.round(window.innerHeight * FOCUS_PIN_LENGTH)}`,
                pin: true,
                // Exact, like the sun's timeline: the acts and the crossing sun stay in step.
                scrub: true,
                animation: scene,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                // After the hero (its spacer moves this one), before the emakimono and the sun.
                refreshPriority: 2,
            });
            ScrollTrigger.refresh();

            return () => {
                pin.kill();
                scene.kill();
                gsap.set(everything(), { clearProps: "transform,opacity,color" });
                delete section.dataset.focus;
            };
        });

        mm.add(FLOW, flow);

        return () => mm.revert();
    }, { scope });

    return scope;
}
