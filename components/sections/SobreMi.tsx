'use client'
import type { ReactNode } from "react";
import Heading from "@/components/ui/Heading";
import { useFadeStagger } from "@/hooks/useFadeStagger";
import { useIsInViewWithStore } from "@/hooks/useIsInViewWithStore";

// Key phrases switch voice to the serif italic in full ink; the rest stays muted.
const Em = ({ children }: { children: ReactNode }) => (
    <em className="font-serif text-[1.0625em] italic text-foreground">{children}</em>
)

export const SobreMi = () => {
    const { ref } = useIsInViewWithStore("about")
    const scope = useFadeStagger()

    return (
        <section id="about" tabIndex={-1} className="section-pad scroll-mt-16 focus:outline-none">
            <div ref={scope} className="container">
                <div ref={ref} className="grid gap-y-8 xl:grid-cols-12 xl:gap-x-6">
                    <div className="reveal xl:col-span-4">
                        <Heading is="h2">Sobre mí</Heading>
                    </div>

                    <div className="max-w-[65ch] text-muted-foreground xl:col-span-7 xl:col-start-5 [&>p+p]:mt-6">
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
                                className="inline-flex min-h-11 items-center text-[15px] font-medium text-link underline decoration-1 underline-offset-[3px]"
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
