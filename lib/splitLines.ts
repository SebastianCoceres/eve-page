import { gsap, SplitText } from "@/lib/gsap";

type LinesAnimation = gsap.core.Animation | void;

/**
 * The page's one line split for text that GSAP drives directly (the scrubbed
 * scenes: the hero greeting, Mi enfoque's statement, Sobre mí's chapters and
 * close). Same settings as components/ui/SplitText: lines in masks
 * (`.split-line-mask`, with room for the mincho's accents), re-split when the
 * width or the fonts change, and `aria: "auto"`, so assistive tech reads the
 * whole text once. Nested inline elements (an emphasis, a tonal half) are kept
 * and sliced across lines.
 *
 * `build` runs on every split with the fresh lines; when it returns an
 * animation, SplitText reverts it before the next split and carries its
 * progress over. Call `.revert()` on the result to restore the original markup.
 */
export function splitLines(element: HTMLElement, build: (lines: HTMLElement[]) => LinesAnimation, { mask = true } = {}) {
    return SplitText.create(element, {
        type: "lines",
        mask: mask ? "lines" : undefined,
        linesClass: "split-line",
        autoSplit: true,
        aria: "auto",
        onSplit: (self) => build(self.lines as HTMLElement[]),
    });
}

/**
 * RevealLead's gesture for markup it cannot take (a paragraph with inline
 * emphasis): the lines fade in once, 80ms apart (power3.out, 0.9s), when the
 * element enters. A re-split after the reveal leaves the lines visible.
 * `onLines` runs on every split, for work on the fresh pieces (see Sobre mí).
 */
export function revealLinesOnEnter(element: HTMLElement, { start = "top 85%", onLines }: { start?: string; onLines?: (lines: HTMLElement[]) => void } = {}) {
    let played = false;
    return splitLines(element, (lines) => {
        onLines?.(lines);
        if (played) return;
        return gsap.from(lines, {
            opacity: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.08,
            scrollTrigger: { trigger: element, start, once: true },
            onStart: () => { played = true; },
        });
    }, { mask: false });
}
