import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

// Content is visible in the server-rendered markup; the entrance only runs when
// JS is available and the visitor has not asked for reduced motion. The hero
// graphic runs its own choreography (useHeroScene).
export function useHeroAnimation() {
    const scope = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const mm = gsap.matchMedia();
        mm.add("(prefers-reduced-motion: no-preference)", () => {
            gsap.from(".hero-reveal", { opacity: 0, y: 8, duration: 0.3, stagger: 0.06, ease: "power2.out" });
        });
        return () => mm.revert();
    }, { scope });

    return scope;
}
