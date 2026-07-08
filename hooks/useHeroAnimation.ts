import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

gsap.registerPlugin(useGSAP);

export function useHeroAnimation() {
    const scope = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        gsap.from(".hero-reveal", { opacity: 0, y: 30, duration: 0.5, stagger: 0.15 })
    }, { scope })

    return scope;
}
