'use client'
import type { ReactNode } from "react";
import Image from "next/image";
import Heading from "@/components/ui/Heading";
import { useFadeStagger } from "@/hooks/useFadeStagger";
import { useIsInViewWithStore } from "@/hooks/useIsInViewWithStore";

// Key phrases switch voice to the serif italic at 0.98em, which matches the Geist
// x-height (measured 53 vs 54 units per 100px), and
// stay in the paragraph colour: only the italic carries the emphasis.
const Em = ({ children }: { children: ReactNode }) => (
    <em className="font-serif text-[0.98em] italic">{children}</em>
)

/**
 * The page's one photograph, in an arched doorway (4:5, a true half-circle top,
 * square bottom). The photo is printed on the paper: a multiply layer of the live
 * paper colour and a slight saturation trim, no border, shadow, blur or gradient.
 * From 768px the afternoon sun parks behind the arch, peeking out past its
 * upper-right shoulder (about 43% of the disc in view): the anchor below is that
 * spot, used by useTravelingSun and shown as the static sun under reduced motion.
 * Percent offsets are of the frame's width (margin-top percentages are too). The
 * 64px under the heading keeps the parked disc 48px clear of it.
 */
const Portrait = () => (
    <div data-portrait className="relative mt-16 w-full md:max-w-[384px]">
        <div
            data-sun-anchor="about"
            className="pointer-events-none absolute left-[60%] top-0 -mt-[4%] hidden aspect-square w-[52%] motion-safe:invisible md:block"
        >
            <div className="size-full rounded-full bg-sun" />
        </div>
        <div data-portrait-photo className="relative aspect-[4/5] overflow-hidden rounded-t-[999px]">
            <Image
                src="/fondo-hero.webp"
                alt="Evelyn Bogado"
                fill
                // Landscape source (16:9) in a 4:5 frame: object-cover scales by height,
                // so the rendered width is ~2.2x the frame width.
                sizes="(min-width: 768px) 860px, calc((100vw - 48px) * 2.25)"
                quality={90}
                className="object-cover object-[71%_center] saturate-[0.9]"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-paper opacity-50 mix-blend-multiply" />
        </div>
    </div>
)

export const SobreMi = () => {
    const { ref } = useIsInViewWithStore("about")
    const scope = useFadeStagger()

    return (
        <section id="about" tabIndex={-1} className="section-pad scroll-mt-16 focus:outline-none">
            <div ref={scope} className="container">
                <div ref={ref} className="grid gap-y-12 xl:grid-cols-12 xl:gap-x-6">
                    <div className="reveal xl:col-span-5">
                        <Heading is="h2">Sobre mí</Heading>
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
                        <p className="reveal !mt-12 max-w-[40ch] text-lead text-foreground">
                            ¡Conectemos y hagamos crecer tu marca juntos!
                        </p>
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
