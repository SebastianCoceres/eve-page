'use client'
import Image from "next/image";
import type { MouseEvent } from "react";
import imagen from "@/public/fondo-hero.webp";
import Heading from "@/components/ui/Heading";
import { Button } from "@/components/ui/Button";
import { useIsInViewWithStore } from "@/hooks/useIsInViewWithStore";
import { useHeroAnimation } from "@/hooks/useHeroAnimation";
import { scrollToSection } from "@/lib/scroll";

const values = ["Transparencia", "Innovación", "Compromiso"] as const

export const Hero = () => {
    const { ref, setSelectedNavbarItem } = useIsInViewWithStore("home")
    const heroScope = useHeroAnimation();

    const goTo = (event: MouseEvent<HTMLAnchorElement>, key: "contact" | "about") => {
        event.preventDefault()
        setSelectedNavbarItem(key)
        scrollToSection(key)
    }

    return (
        <section id="home" tabIndex={-1} className="scroll-mt-16 pt-16 pb-24 focus:outline-none md:pt-24 md:pb-32 xl:pt-32 xl:pb-40">
            <div ref={ref} className="container">
                <div ref={heroScope}>
                    <div className="grid gap-16 md:grid-cols-12 md:items-center md:gap-x-6">
                        <div className="md:col-span-7">
                            <p className="hero-reveal text-eyebrow">¡Hola! Soy Eve 👋</p>
                            <Heading is="h1" className="hero-reveal mt-4">Evelyn Bogado</Heading>
                            <p className="hero-reveal mt-8 max-w-[40ch] text-lead text-foreground">
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

                        {/* The one curve on the page: a whitewashed doorway arch. A true half-circle
                            on a 4:5 box needs radii of 50% of the width and 40% of the height. */}
                        <div className="hero-image relative aspect-[4/5] overflow-hidden rounded-t-[50%_40%] bg-surface md:col-span-5 md:col-start-8">
                            <Image
                                priority
                                src={imagen}
                                alt="Evelyn Bogado en su espacio de trabajo"
                                fill
                                sizes="(min-width: 1280px) 480px, (min-width: 768px) 40vw, 100vw"
                                className="object-cover object-[64%_50%]"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Hero
