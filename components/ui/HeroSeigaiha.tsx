'use client'
import { useEffect, useState, type RefObject } from "react";
import { useHeroSeigaiha } from "@/hooks/useHeroSeigaiha";
import { seigaihaFor, type SeigaihaField } from "@/lib/seigaiha";

/**
 * "Seigaiha: el mar y el sol". A full-bleed field of seigaiha waves in cobalt
 * hairlines on the whitewash, with one orange sun rising from behind them, cropped
 * by the right edge. The pattern is generated from the measured width, so scales
 * keep their exact size and never stretch. Decorative: hidden from assistive tech.
 *
 * Sizes live in CSS variables so the server markup reserves the right space
 * before the pattern is measured: --field-h matches the generator's height
 * (192px / 280px) and --sun-d is the sun's diameter.
 */
export function HeroSeigaiha({ sectionRef, children }: { sectionRef: RefObject<HTMLElement | null>; children?: React.ReactNode }) {
    const [field, setField] = useState<SeigaihaField | null>(null);
    const scope = useHeroSeigaiha(field, sectionRef);

    useEffect(() => {
        const element = scope.current;
        if (!element) return;
        let lastWidth = 0;
        const measure = () => {
            const width = Math.round(element.getBoundingClientRect().width);
            if (width === lastWidth) return;
            lastWidth = width;
            setField(seigaihaFor(width));
        };
        const observer = new ResizeObserver(measure);
        observer.observe(element);
        return () => observer.disconnect();
    }, [scope]);

    return (
        <div
            ref={scope}
            aria-hidden="true"
            className="relative pt-[calc(var(--sun-d)*0.6)] [--field-h:192px] [--sun-d:240px] md:pt-0 md:[--field-h:280px] md:[--sun-d:400px] xl:[--sun-d:520px]"
        >
            {/* The sun sits behind the waves: its lower part is hidden by the scales' fills. */}
            <div
                className="pointer-events-none absolute size-[var(--sun-d)] right-[calc(var(--sun-d)*-0.28)] bottom-[calc(var(--field-h)-var(--sun-d)*0.4)]"
            >
                <div data-seigaiha="sun" className="size-full rounded-full bg-sun will-change-transform" />
            </div>

            <svg
                className="relative block h-[var(--field-h)] w-full"
                {...(field ? { viewBox: `0 0 ${field.width} ${field.height}` } : {})}
                preserveAspectRatio="xMidYMax slice"
                focusable="false"
            >
                {field?.rows.map((row) => (
                    <g key={`${field.width}-${row.index}`} data-seigaiha="row" className="will-change-transform">
                        <g data-seigaiha="drift" className="will-change-transform">
                            <path d={row.fill} fill="var(--background)" />
                            <path
                                data-seigaiha="stroke"
                                d={row.stroke}
                                fill="none"
                                stroke="var(--primary)"
                                strokeOpacity="0.62"
                                strokeWidth="1"
                                vectorEffect="non-scaling-stroke"
                            />
                        </g>
                    </g>
                ))}
            </svg>

            {children}
        </div>
    )
}

export default HeroSeigaiha
