'use client'
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

// One seigaiha scale: four concentric semicircles sharing a base line, radius 24
// (48px wide), drawn innermost first. Half-pixel inset keeps the outer 1px arc
// inside the box.
const SIZE = 48;
const RINGS = [6, 12, 18, 23.5];
const arc = (r: number) => `M${24 - r} 24A${r} ${r} 0 0 1 ${24 + r} 24`;

/**
 * A quiet section mark: a single seigaiha scale on the content axis, like a mon
 * stamped between chapters. It draws once when it enters the viewport, arcs from
 * the innermost outward (0.6s, power2.out). Reduced motion: static.
 * Decorative: hidden from assistive tech.
 */
export function SectionMark() {
    const scope = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const mm = gsap.matchMedia();
        mm.add("(prefers-reduced-motion: no-preference)", () => {
            gsap.from("path", {
                drawSVG: "50% 50%",
                duration: 0.6,
                ease: "power2.out",
                stagger: 0.08,
                scrollTrigger: { trigger: scope.current, start: "top 85%", once: true },
            });
        });
        return () => mm.revert();
    }, { scope });

    return (
        <div ref={scope} aria-hidden="true" className="container flex justify-center">
            <svg data-section-mark width={SIZE} height={SIZE / 2} viewBox={`0 0 ${SIZE} ${SIZE / 2}`} className="block overflow-visible" focusable="false">
                {RINGS.map((r) => (
                    <path
                        key={r}
                        d={arc(r)}
                        fill="none"
                        stroke="var(--primary)"
                        strokeOpacity="0.7"
                        strokeWidth="1"
                        vectorEffect="non-scaling-stroke"
                    />
                ))}
            </svg>
        </div>
    )
}

export default SectionMark
