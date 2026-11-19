import { cn } from "@/lib/utils";

// One seigaiha scale (the same geometry as SectionMark, at a larger radius):
// concentric semicircles sharing a base line, innermost first so a draw-in
// reads from the centre outward. The outer arc is inset half a pixel to keep
// its 1px stroke inside the box. The viewBox is fixed; the rendered width comes
// from `className`, and non-scaling strokes keep every arc at 1px.
const R = 64;
const RINGS = [0.25, 0.5, 0.75, 1].map((t) => (t === 1 ? R - 0.5 : R * t));
const arc = (r: number) => `M${R - r} ${R}A${r} ${r} 0 0 1 ${R + r} ${R}`;

interface EmakiFanProps {
    className?: string;
}

/**
 * A single seigaiha fan whose base line sits on the bottom edge of its box.
 * Decorative: hidden from assistive tech. Arcs carry `data-emaki-arc` so a
 * parent can draw them in (DrawSVG).
 */
export function EmakiFan({ className }: EmakiFanProps) {
    return (
        <svg
            aria-hidden="true"
            focusable="false"
            viewBox={`0 0 ${R * 2} ${R}`}
            className={cn("block aspect-[2/1] overflow-visible", className)}
        >
            {RINGS.map((r) => (
                <path
                    key={r}
                    data-emaki-arc
                    d={arc(r)}
                    fill="none"
                    stroke="var(--primary)"
                    strokeOpacity="0.7"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                />
            ))}
        </svg>
    );
}

export default EmakiFan;
