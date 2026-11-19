'use client'
import { useEffect, useState, type ReactNode } from "react";
import { useSeaField } from "@/hooks/useSeaField";
import { seaFor, type SeaKind, type SeigaihaField } from "@/lib/seigaiha";
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
            setField(seaFor(kind, width));
        });
        observer.observe(element);
        return () => observer.disconnect();
    }, [scope, kind]);

    return (
        <div ref={scope} data-sea-field={kind} aria-hidden="true" className={cn("relative", className)}>
            {children}
            <svg
                className={cn("relative block w-full", HEIGHT[kind])}
                {...(field ? { viewBox: `0 0 ${field.width} ${field.height}` } : {})}
                preserveAspectRatio="xMidYMax slice"
                focusable="false"
            >
                {field?.rows.map((row) => (
                    <g key={`${field.width}-${row.index}`}>
                        <path d={row.fill} fill="var(--background)" />
                        <path
                            data-sea="stroke"
                            d={row.stroke}
                            fill="none"
                            stroke="var(--primary)"
                            strokeOpacity={row.opacity}
                            strokeWidth="1"
                            vectorEffect="non-scaling-stroke"
                        />
                    </g>
                ))}
            </svg>
        </div>
    )
}

export default SeaField
