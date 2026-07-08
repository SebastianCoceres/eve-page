import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

gsap.registerPlugin(useGSAP);

export function useSobreMiAnimation(isInView: boolean) {
    const scope = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!isInView) return

        gsap.from(".sobre-mi-illustration", { opacity: 0, x: -40, duration: 0.5 })
        gsap.from(".sobre-mi-carousel", { opacity: 0, duration: 0.5, delay: 0.2 })
    }, { scope, dependencies: [isInView] })

    return scope;
}
