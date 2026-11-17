'use client'
import { useRef, type MouseEvent } from "react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { HeroSeigaiha } from "@/components/ui/HeroSeigaiha";
import { useIsInViewWithStore } from "@/hooks/useIsInViewWithStore";
import { useHeroAnimation } from "@/hooks/useHeroAnimation";
import { scrollToSection } from "@/lib/scroll";

const values = ["Transparencia", "Innovación", "Compromiso"] as const

export const Hero = () => {
    const { ref, setSelectedNavbarItem } = useIsInViewWithStore("home")
    const heroScope = useHeroAnimation();
    const sectionRef = useRef<HTMLElement>(null)

    const goTo = (event: MouseEvent<HTMLAnchorElement>, key: "contact" | "about") => {
        event.preventDefault()
        setSelectedNavbarItem(key)
        scrollToSection(key)
    }

    return (
        <section
            ref={sectionRef}
            id="home"
            tabIndex={-1}
            className="relative scroll-mt-16 overflow-hidden pt-16 focus:outline-none md:pt-24 xl:pt-32"
        >
            {/* Content first, in its own band: the waves never run under the text. */}
            <div ref={ref} className="container relative z-10 pb-12 md:pb-20">
                <div ref={heroScope} className="md:max-w-[58%]">
                    <p className="hero-reveal text-eyebrow">¡Hola! Soy Eve 👋</p>
                    {/* The logotype is the hero's lead element; the h1 keeps a readable text name. */}
                    <h1 className="hero-reveal mt-6 text-foreground">
                        <span className="sr-only">Evelyn Bogado — Publicidad y marketing digital</span>
                        <Logo aria-hidden="true" className="block h-auto w-full max-w-[340px] md:max-w-[560px]" />
                    </h1>
                    <p className="hero-reveal mt-10 max-w-[40ch] text-lead text-foreground">
                        Vibra alto con un marketing consciente. Ayudo a marcas a crecer de forma auténtica y ética.
                    </p>
                    <div className="hero-reveal mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                        <Button asChild>
                            <a href="#contact" onClick={(event) => goTo(event, "contact")}>Contáctame</a>
                        </Button>
                        <Button asChild variant="quiet" size="inline">
                            <a href="#about" onClick={(event) => goTo(event, "about")}>Quiero conocerte más</a>
                        </Button>
                    </div>
                    <ul className="hero-reveal mt-12 max-w-sm border-t border-hairline">
                        {values.map((value) => (
                            <li key={value} className="border-b border-hairline py-3 text-[15px] text-foreground">
                                {value}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* "Seigaiha: el mar y el sol" — full bleed under the content. */}
            <HeroSeigaiha sectionRef={sectionRef}>
                {/* Artist's seal, stamped on the print's lower-right corner. */}
                <span
                    aria-hidden="true"
                    className="absolute bottom-6 right-6 z-10 flex size-10 items-center justify-center bg-sun font-display text-[15px] leading-none text-field md:bottom-10 md:right-10"
                >
                    EB
                </span>
            </HeroSeigaiha>
        </section>
    )
}

export default Hero
