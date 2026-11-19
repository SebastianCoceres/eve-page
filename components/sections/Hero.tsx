'use client'
import type { MouseEvent } from "react";
import { LogoStacked, LogoSubline } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { SeaField } from "@/components/ui/SeaField";
import { EmakiFan } from "@/components/ui/EmakiFan";
import { useIsInViewWithStore } from "@/hooks/useIsInViewWithStore";
import { useHeroAnimation } from "@/hooks/useHeroAnimation";
import { scrollToSection } from "@/lib/scroll";

const values = ["Transparencia", "Innovación", "Compromiso"] as const

// While pinned (useHeroAnimation sets data-hero="pinned" from 768px), the lead and the
// values lie over the stage, starting below where the shrunken lockup ends: the stage
// padding, 42% of the name, the subline and CTA rows (24 + 16 + 36 + 48 = 124px), a gap.
const PINNED_AFTER = [
    "group-data-[hero=pinned]/hero:pointer-events-none",
    "group-data-[hero=pinned]/hero:absolute",
    "group-data-[hero=pinned]/hero:inset-x-0",
    "group-data-[hero=pinned]/hero:top-0",
    "group-data-[hero=pinned]/hero:h-[var(--hero-h)]",
    "group-data-[hero=pinned]/hero:pb-0",
    "group-data-[hero=pinned]/hero:pt-[calc(var(--pt)+var(--logo-h)*0.42+124px+clamp(28px,4.5vh,48px))]",
].join(" ")

/**
 * Hero "Amanecer": the brand's name, giant, over a morning sun rising out of a
 * seigaiha sea, with the two actions visible from the first frame.
 *
 * Without JS, under reduced motion and below 768px the hero is a stage (one viewport
 * under the navbar) followed by the greeting lead and the values in the flow. From
 * 768px with motion the section pins (useHeroAnimation): the lockup shrinks to the
 * top left, the greeting is spoken line by line, then the values arrive as one row.
 * The sun rises from `[data-sun-anchor="hero"]` toward `[data-sun-anchor="hero-high"]`
 * during the pin (useTravelingSun owns it); the hero anchor is also the static sun
 * under reduced motion. Text never runs over the waves or the sun.
 */
export const Hero = () => {
    const { ref, setSelectedNavbarItem } = useIsInViewWithStore("home")
    const scope = useHeroAnimation();

    const goTo = (event: MouseEvent<HTMLAnchorElement>, key: "contact" | "about") => {
        event.preventDefault()
        setSelectedNavbarItem(key)
        scrollToSection(key)
    }

    return (
        <section
            ref={scope}
            id="home"
            tabIndex={-1}
            className="group/hero hero-frame relative scroll-mt-16 overflow-hidden focus:outline-none"
        >
            <div ref={ref} data-hero-stage className="relative h-[var(--hero-h)]">
                {/* Where the sun rises: behind the sea, cropped by the right edge. */}
                <div
                    data-sun-anchor="hero"
                    className="pointer-events-none absolute right-[calc(var(--sun-d)*-0.3)] bottom-[calc(var(--sea-h)-var(--sun-d)*0.42)] size-[var(--sun-d)] [--sea-h:192px] [--sun-d:62vw] motion-safe:invisible md:[--sea-h:280px] md:[--sun-d:clamp(320px,40vw,640px)]"
                >
                    <div className="size-full rounded-full bg-sun" />
                </div>
                {/* Where the morning sun has climbed by the end of the pin (never shown). */}
                <div
                    data-sun-anchor="hero-high"
                    aria-hidden="true"
                    className="pointer-events-none invisible absolute right-[max(40px,calc((100%-1200px)/2))] top-[clamp(24px,4vh,48px)] hidden size-[clamp(160px,18vw,280px)] md:block"
                />

                <SeaField kind="hero" className="absolute inset-x-0 bottom-0" />

                <div className="container relative z-10 pt-[var(--pt)]">
                    <h1 className="text-foreground">
                        <span className="sr-only">Evelyn Bogado — Publicidad y marketing digital</span>
                        <span data-hero-logo className="block w-[var(--logo-w)] max-w-full origin-top-left">
                            <LogoStacked aria-hidden="true" className="block h-auto w-full" />
                        </span>
                    </h1>
                    {/* Rides up with the name while it shrinks (the pin). */}
                    <div data-hero-rest>
                        <div className="mt-6 flex h-4 items-center gap-6">
                            <span data-hero-subline className="block shrink-0">
                                <LogoSubline aria-hidden="true" className="block h-[11px] w-auto md:h-[14px]" />
                            </span>
                            <span data-hero-rule aria-hidden="true" className="h-px max-w-[560px] flex-1 origin-left bg-primary" />
                        </div>
                        <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-3">
                            <Button asChild>
                                <a data-hero-cta href="#contact" onClick={(event) => goTo(event, "contact")}>Contáctame</a>
                            </Button>
                            <Button asChild variant="link" size="inline">
                                <a data-hero-cta href="#about" onClick={(event) => goTo(event, "about")}>Quiero conocerte más</a>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div data-hero-after className={`container relative z-10 pt-12 pb-20 md:pb-28 ${PINNED_AFTER}`}>
                <p data-hero-lead className="pointer-events-auto max-w-[24em] text-hero-lead text-foreground">
                    <span className="block">¡Hola! Soy Eve.</span>
                    <span className="block">Vibra alto con un marketing consciente.</span>
                    <span className="block">Ayudo a marcas a crecer de forma auténtica y ética.</span>
                </p>
                <ul className="pointer-events-auto mt-[clamp(20px,3.5vh,36px)] flex flex-wrap items-center gap-x-[0.45em] gap-y-1 text-values text-foreground">
                    {values.map((value, index) => (
                        <li key={value} data-hero-value className="flex items-center gap-x-[0.45em]">
                            {/* A single seigaiha scale between the values. */}
                            {index > 0 && <EmakiFan className="w-[0.6em]" />}
                            {value}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}

export default Hero
