import { gsap } from "@/lib/gsap";

// Height of the sticky navbar, kept clear above the scrolled-to section.
const NAV_OFFSET = 64;

/**
 * Scrolls to a section by id: a 0.3s ease, or an instant jump when the visitor
 * prefers reduced motion. Moves focus to the section afterwards so keyboard and
 * screen-reader users land where the eye does.
 */
export function scrollToSection(id: string) {
    const target = document.getElementById(id);
    if (!target) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const focusTarget = () => target.focus({ preventScroll: true });

    if (reduce) {
        const top = target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
        window.scrollTo({ top, behavior: "auto" });
        focusTarget();
        return;
    }

    gsap.to(window, {
        duration: 0.3,
        ease: "power2.out",
        scrollTo: { y: target, offsetY: NAV_OFFSET, autoKill: true },
        onComplete: focusTarget,
    });
}
