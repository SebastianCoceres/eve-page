import { once } from "events";
import { stagger, useAnimate } from "framer-motion";
import { useEffect } from "react";

export function useAccordionAnimation(isInView: boolean) {
    const [scope, animate] = useAnimate();
    useEffect(() => {
        if (!isInView) return
        animate(
            ".accordionItem", { opacity: [0, 1], y: [50, 0] }, { duration: 0.5, delay: stagger(0.5) },
        )

    }, [isInView])

    return scope;
}