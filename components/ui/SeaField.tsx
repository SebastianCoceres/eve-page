'use client'
import { useEffect, useState, type ReactNode } from "react";
import { useSeaField } from "@/hooks/useSeaField";
import { looseCrestFor, seaFor, type SeaKind, type SeigaihaField } from "@/lib/seigaiha";
import { cn } from "@/lib/utils";

// Reserved heights, matching the generator presets, so nothing jumps on measure.
const HEIGHT: Record<SeaKind, string> = {
    hero: "h-[192px] md:h-[280px]",
    footer: "h-[120px] md:h-[200px]",
};

/**
 * A full-bleed seigaiha sea (see lib/seigaiha). The pattern is generated from the
 * measured width, so scales keep their exact size and never stretch. Children
 * render behind the waves (for the static sun) unless they position themselves
 * above. Decorative: hidden from assistive tech.
 *
 * The hero sea keeps its crest scales apart (`[data-sea-scale]`, one group each,
 * in their row's place so the occlusion is unchanged): the scale journey
 * (hooks/useScaleJourney) hides each one as it lifts it out of the sea. Without
 * JS and under reduced motion they are drawn like every other scale.
 */
export function SeaField({ kind, className, children }: { kind: SeaKind; className?: string; children?: ReactNode }) {
    const [field, setField] = useState<SeigaihaField | null>(null);
    const scope = useSeaField(field, kind);

    useEffect(() => {
        const element = scope.current;
        if (!element) return;
        let lastWidth = 0;
        const observer = new ResizeObserver(() => {
            const width = Math.round(element.getBoundingClientRect().width);
            if (width === lastWidth) return;
            lastWidth = width;
            setField(seaFor(kind, width, kind === "hero" ? looseCrestFor(width) : 0));
        });
        observer.observe(element);
        return () => observer.disconnect();
    }, [scope, kind]);

    return (
        <div ref={scope} data-sea-field={kind} aria-hidden="true" className={cn("relative", className)}>
            {children}
            <svg
                data-sea-svg
                className={cn("relative block w-full", HEIGHT[kind])}
                {...(field ? { viewBox: `0 0 ${field.width} ${field.height}` } : {})}
                preserveAspectRatio="xMidYMax slice"
                focusable="false"
            >
                {field?.rows.map((row, order) => (
                    <g key={`${field.width}-${row.index}`}>
                        {row.fill && <path d={row.fill} fill="var(--background)" />}
                        {row.stroke && (
                            <path
                                data-sea="stroke"
                                data-row={order}
                                d={row.stroke}
                                fill="none"
                                stroke="var(--primary)"
                                strokeOpacity={row.opacity}
                                strokeWidth="1"
                                vectorEffect="non-scaling-stroke"
                            />
                        )}
                        {row.loose.map((scale) => (
                            <g key={scale.id} data-sea-scale={scale.id}>
                                <path d={scale.fill} fill="var(--background)" />
                                <path
                                    data-sea="stroke"
                                    data-row={order}
                                    d={scale.stroke}
                                    fill="none"
                                    stroke="var(--primary)"
                                    strokeOpacity={scale.opacity}
                                    strokeWidth="1"
                                    vectorEffect="non-scaling-stroke"
                                />
                            </g>
                        ))}
                    </g>
                ))}
            </svg>
        </div>
    )
}

export default SeaField
