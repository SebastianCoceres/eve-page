'use client'
import type { MouseEvent, ReactNode } from "react";
import Image from "next/image";
import { RevealTitle } from "@/components/ui/TextReveal";
import { SeaField } from "@/components/ui/SeaField";
import { EmakiFan } from "@/components/ui/EmakiFan";
import { Button } from "@/components/ui/Button";
import { useAboutJourney } from "@/hooks/useAboutJourney";
import { useIsInViewWithStore } from "@/hooks/useIsInViewWithStore";
import { scrollToSection } from "@/lib/scroll";

// Key phrases carry the emphasis in ink and weight, not in italics (the mincho
// voice has none, and Japanese editorial emphasis is tonal): Geist 500 in the full
// ink colour inside the muted paragraph. With motion they turn from muted to ink as
// they cross the reading zone (useAboutJourney).
const Em = ({ children }: { children: ReactNode }) => (
    <em className="font-medium not-italic text-foreground">{children}</em>
)

// Eve's six paragraphs, read as chapters of one journey (her copy, unchanged).
const chapters: ReactNode[] = [
    <>¡Hola! Soy Eve, <Em>licenciada en Publicidad</Em> y especializada en <Em>marketing digital</Em>. Mi formación académica, junto con mi experiencia práctica, abarca tanto el mercado <Em>latinoamericano</Em> como el <Em>europeo</Em>.</>,
    <>Constantemente estoy en aprendizaje, por lo que siempre estoy realizando un curso nuevo. Entre ellos se destacan los de community management, UX/UI, programación web, diseño, entre otros. Estas competencias me han permitido desarrollarme plenamente en el vasto campo de la comunicación y el marketing digital.</>,
    <>Mi recorrido es amplio y variado, y me permite la adaptación a diferentes industrias y necesidades.</>,
    <>Hoy, tengo la suerte de trabajar para mí misma, lo que me ha llevado a expandir mis horizontes y ofrecer mis servicios en el mercado español. Mi objetivo es cruzar fronteras y colaborar con quienes buscan <Em>potenciar su presencia digital</Em>. Estoy aquí para aportar toda mi experiencia y dedicación, orientándome siempre a las necesidades específicas de cada proyecto.</>,
    <>Creo firmemente en la importancia de la <Em>transparencia, la innovación y el compromiso</Em>. Mi objetivo es ayudar a las marcas a contar su historia de manera auténtica y efectiva, conectando con su audiencia de una manera genuina.</>,
    <>Si buscas a alguien que combine profesionalidad con un trato cercano y personalizado, estaré encantada de ayudarte a alcanzar tus metas.</>,
]

/**
 * "Retrato frente al sol": Eve's bust (public/eve-bust.webp, a cut-out with alpha)
 * stands in front of a large orange disc, her head breaking out above it like a
 * figure on a print, and rises from a narrow seigaiha band (three rows of small
 * scales) as the sun rises from the sea. The disc is [data-sun-anchor="about"]: the
 * traveling sun parks exactly there (same size and place, measured from the live
 * layout), and it is the static disc under reduced motion.
 *
 * Geometry, in shares of the frame width W (the bust is 655×510 px, so its height is
 * 0.7786 W): the disc is 0.70 W wide, centred at 0.527 W across and 0.458 W down
 * (margin-top percentages are of the width). Its lower edge sits under the band,
 * whose paper fills hide it; the band overlaps the bust by BAND_NOTCH + 2px so the
 * bust's straight bottom edge is never seen. Under the band, a strip of paper
 * (0.1 W) hides the disc as it sinks while the text is read (up to 0.084 W, see
 * useTravelingSun): the sun sets behind the sea, never below it. W stays at or under
 * 380px so the 655px source is upscaled at most 1.16x at DPR 2.
 */
const Portrait = () => (
    <div data-portrait className="relative mx-auto mt-14 w-[min(100%,340px)] md:mx-0 md:w-[380px]">
        <div
            data-sun-anchor="about"
            className="pointer-events-none absolute left-[17.7%] top-0 mt-[10.8%] aspect-square w-[70%] motion-safe:invisible"
        >
            <div className="size-full rounded-full bg-sun" />
        </div>
        <div data-portrait-photo className="relative aspect-[655/510]">
            <Image
                src="/eve-bust.webp"
                alt="Evelyn Bogado"
                fill
                sizes="(min-width: 768px) 380px, 340px"
                quality={90}
                className="object-contain"
            />
        </div>
        <SeaField kind="band" className="-mt-[22px]" />
        <div aria-hidden="true" className="relative bg-background pt-[10%]" />
    </div>
)

/**
 * Sobre mí: Eve in front of the afternoon sun, and her story as a journey.
 *
 * From 1280px the portrait column (heading, bust, the parked sun, the seigaiha base)
 * is sticky 112px from the top while the text column scrolls past it; the column is
 * `[data-sun-sticky]`, so the traveling sun stays locked to its disc for the whole
 * sticky range and sinks a little and warms as the text is read (useTravelingSun).
 * The six paragraphs are chapters, each with a small seigaiha fan in the margin like
 * a milestone; the close, "¡Conectemos y hagamos crecer tu marca juntos!", is set
 * large in the mincho with the Contáctame pill and Instagram below it.
 * Below 1280px: the portrait first, then the chapters, then the close; nothing sticks.
 * Motion: useAboutJourney. Reduced motion and no JS: everything static and visible.
 */
export const SobreMi = () => {
    const { ref, setSelectedNavbarItem } = useIsInViewWithStore("about")
    const scope = useAboutJourney()

    const goToContact = (event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault()
        setSelectedNavbarItem("contact")
        scrollToSection("contact")
    }

    return (
        <section id="about" tabIndex={-1} className="section-pad scroll-mt-16 focus:outline-none">
            <div ref={scope} className="container">
                <div ref={ref} className="grid gap-y-14 xl:grid-cols-12 xl:gap-x-6">
                    <div className="xl:col-span-5">
                        <div data-sun-sticky className="xl:sticky xl:top-[112px]">
                            <RevealTitle text="Sobre mí" />
                            <Portrait />
                        </div>
                    </div>

                    <div className="xl:col-span-6 xl:col-start-7 xl:pt-3">
                        <div className="space-y-12 md:space-y-14">
                            {chapters.map((chapter, index) => (
                                <div key={index} data-about-chapter className="grid grid-cols-[24px_minmax(0,1fr)] gap-x-5 md:gap-x-6">
                                    {/* A milestone on the scroll: one small seigaiha fan, drawn on enter. */}
                                    <span data-chapter-mark className="block pt-2 md:pt-[9px]">
                                        <EmakiFan className="w-6" />
                                    </span>
                                    <p data-chapter-text className="max-w-[60ch] text-muted-foreground md:text-[17px] md:leading-[1.7]">
                                        {chapter}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 md:mt-14">
                            <p data-about-close className="max-w-[18em] text-statement text-foreground">
                                ¡Conectemos y hagamos crecer tu marca juntos!
                            </p>
                            <div data-about-cta className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3">
                                <Button asChild>
                                    <a href="#contact" onClick={goToContact}>Contáctame</a>
                                </Button>
                                <a
                                    href="https://www.instagram.com/evelyn.digitalmkt/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="link inline-flex min-h-11 items-center text-[15px] font-medium"
                                >
                                    Instagram
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default SobreMi
