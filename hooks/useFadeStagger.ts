import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Section entrance: the matched children fade in (opacity only, 0.2s) the first
 * time the section scrolls into view. Reduced motion shows everything at once.
 */
export function useFadeStagger(selector = ".reveal") {
    const scope = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const mm = gsap.matchMedia();
        mm.add("(prefers-reduced-motion: no-preference)", () => {
            gsap.from(selector, {
                opacity: 0,
                duration: 0.2,
                stagger: 0.06,
                ease: "power2.out",
                clearProps: "opacity",
                scrollTrigger: { trigger: scope.current, start: "top 85%", once: true },
            });
        });
        return () => mm.revert();
    }, { scope });

    return scope;
}
