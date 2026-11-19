'use client'
import type { ReactNode } from "react";
import Image from "next/image";
import { RevealLead, RevealTitle } from "@/components/ui/TextReveal";
import { SeaField } from "@/components/ui/SeaField";
import { useFadeStagger } from "@/hooks/useFadeStagger";
import { useIsInViewWithStore } from "@/hooks/useIsInViewWithStore";

// Key phrases carry the emphasis in ink and weight, not in italics (the mincho
// voice has none, and Japanese editorial emphasis is tonal): Geist 500 in the full
// ink colour inside the muted paragraph.
const Em = ({ children }: { children: ReactNode }) => (
    <em className="font-medium not-italic text-foreground">{children}</em>
)

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
 * bust's straight bottom edge is never seen. W stays at or under 380px so the
 * 655px source is upscaled at most 1.16x at DPR 2.
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
    </div>
)

export const SobreMi = () => {
    const { ref } = useIsInViewWithStore("about")
    const scope = useFadeStagger()

    return (
        <section id="about" tabIndex={-1} className="section-pad scroll-mt-16 focus:outline-none">
            <div ref={scope} className="container">
                <div ref={ref} className="grid gap-y-12 xl:grid-cols-12 xl:gap-x-6">
                    <div className="xl:col-span-5">
                        <RevealTitle text="Sobre mí" />
                        <Portrait />
                    </div>

                    <div className="max-w-[65ch] text-muted-foreground xl:col-span-6 xl:col-start-7 [&>p+p]:mt-6">
                        <p className="reveal">
                            ¡Hola! Soy Eve, <Em>licenciada en Publicidad</Em> y especializada en <Em>marketing digital</Em>. Mi formación académica, junto con mi experiencia práctica, abarca tanto el mercado <Em>latinoamericano</Em> como el <Em>europeo</Em>.
                        </p>
                        <p className="reveal">
                            Constantemente estoy en aprendizaje, por lo que siempre estoy realizando un curso nuevo. Entre ellos se destacan los de community management, UX/UI, programación web, diseño, entre otros. Estas competencias me han permitido desarrollarme plenamente en el vasto campo de la comunicación y el marketing digital.
                        </p>
                        <p className="reveal">
                            Mi recorrido es amplio y variado, y me permite la adaptación a diferentes industrias y necesidades.
                        </p>
                        <p className="reveal">
                            Hoy, tengo la suerte de trabajar para mí misma, lo que me ha llevado a expandir mis horizontes y ofrecer mis servicios en el mercado español. Mi objetivo es cruzar fronteras y colaborar con quienes buscan <Em>potenciar su presencia digital</Em>. Estoy aquí para aportar toda mi experiencia y dedicación, orientándome siempre a las necesidades específicas de cada proyecto.
                        </p>
                        <p className="reveal">
                            Creo firmemente en la importancia de la <Em>transparencia, la innovación y el compromiso</Em>. Mi objetivo es ayudar a las marcas a contar su historia de manera auténtica y efectiva, conectando con su audiencia de una manera genuina.
                        </p>
                        <p className="reveal">
                            Si buscas a alguien que combine profesionalidad con un trato cercano y personalizado, estaré encantada de ayudarte a alcanzar tus metas.
                        </p>
                        <RevealLead text="¡Conectemos y hagamos crecer tu marca juntos!" className="!mt-12 max-w-[40ch]" />
                        <p className="reveal !mt-8">
                            <a
                                href="https://www.instagram.com/evelyn.digitalmkt/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link inline-flex min-h-11 items-center text-[15px] font-medium"
                            >
                                Instagram
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default SobreMi
