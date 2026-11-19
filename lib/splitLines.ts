import { gsap, SplitText } from "@/lib/gsap";

type LinesAnimation = gsap.core.Animation | void;

/**
 * The page's one line split for text that GSAP drives directly (the scrubbed
 * scenes: the hero greeting and Sobre mí's close). Same settings as components/ui/SplitText: lines in masks
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

