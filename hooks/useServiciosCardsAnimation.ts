import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

gsap.registerPlugin(useGSAP);

export function useServiciosCardsAnimation(isInView: boolean) {
    const scope = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!isInView) return

        gsap.from(".service-card", { opacity: 0, y: 50, duration: 0.5, stagger: 0.15 })
    }, { scope, dependencies: [isInView] })

    return scope;
}
