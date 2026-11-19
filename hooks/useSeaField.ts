import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { SeaKind, SeigaihaField } from "@/lib/seigaiha";

/**
 * Ink for a seigaiha field. Each field draws once:
 * - hero: on load, each row's arcs spread from its middle outward (DrawSVG
 *   "50% 50%"), rows staggered from the centre row out (~1.3s), in step with
 *   the sun rising (TravelingSun) and the name's letters (useHeroAnimation);
 * - footer: when it enters the viewport, row by row from the left,
 *   like a wave passing (at most 0.8s).
 * Reduced motion: nothing runs; every field is simply drawn.
 */
export function useSeaField(field: SeigaihaField | null, kind: SeaKind) {
    const scope = useRef<HTMLDivElement>(null);
    const drawn = useRef(false);

    useGSAP(() => {
        const root = scope.current;
        if (!root || !field || drawn.current) return;
        const strokes = gsap.utils.toArray<SVGPathElement>(root.querySelectorAll('[data-sea="stroke"]'));
        if (strokes.length === 0) return;

        const mm = gsap.matchMedia();
        mm.add("(prefers-reduced-motion: no-preference)", () => {
            drawn.current = true;
            if (kind === "hero") {
                // Rows from the centre row out, 30ms apart; a row's loose crest scales
                // (their own paths, see SeaField) draw with their row.
                const center = (field.rows.length - 1) / 2;
                gsap.from(strokes, {
                    drawSVG: "50% 50%",
                    duration: 1.0,
                    ease: "power2.inOut",
                    stagger: (_index: number, target: Element) =>
                        0.03 * Math.abs(Number((target as SVGElement).dataset.row ?? center) - center),
                });
                return;
            }
            gsap.from(strokes, {
                drawSVG: "0%",
                duration: 0.5,
                ease: "power2.out",
                stagger: Math.min(0.1, 0.3 / strokes.length),
                // Start as soon as the sea enters, so its strokes are drawn before the
                // setting sun reaches it: the paper fills never show an empty bite.
                scrollTrigger: { trigger: root, start: "top bottom", once: true },
            });
        });
    }, { scope, dependencies: [field] });

    return scope;
}
