'use client'
import Heading from "@/components/ui/Heading";
import { UndrawArtThinking } from "@/components/vectors/UndrawArtThinking2";
import { useIsInViewWithStore } from "@/hooks/useIsInViewWithStore";
import Link from "next/link";
import { Button } from "../ui/Button";
import { Instagram } from "../vectors/Instragram";
import { Carousel, CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/Carousel";
import { useEffect, useState } from "react";

export const SobreMi = () => {
    const [api, setApi] = useState<CarouselApi>()
    const [current, setCurrent] = useState(0)
    const [count, setCount] = useState(0)
    const { ref } = useIsInViewWithStore("about")

    useEffect(() => {
        if (!api) {
            return
        }

        setCount(api.scrollSnapList().length)
        setCurrent(api.selectedScrollSnap() + 1)

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1)
        })
    }, [api])
    return (
        <section id="about" className=" flex flex-col justify-center items-center flex-fill min-h-screen bg-background py-16">
            <div ref={ref} className="container md:max-w-6xl mx-auto">
                <Heading is="h2" className="text-secondary">Sobre mí</Heading>
                <div className="flex flex-wrap items-center -mx-4">
                    <div className="w-full sm:w-1/2 px-4 mb-4 flex flex-col items-center ">
                        <UndrawArtThinking className="w-full p-4 max-h-[250px] md:max-h-[100%]" />
                        {/* <Button asChild variant={"secondary"}>
                            <Link href="/sobre-mi">Quiero conocerte más</Link>
                        </Button> */}
                    </div>
                    <div className="w-full sm:w-1/2 px-4 mb-4 text-md md:text-xl text-balance">
                        <Carousel setApi={setApi} opts={{ loop: true, align: 'center' }}>
                            <CarouselContent >
                                <CarouselItem className="flex flex-col justify-center items-center">
                                    <p>
                                        ¡Hola! Soy Eve, <strong>licenciada en Publicidad</strong> y especializada en <strong>marketing digital</strong>. Mi formación académica, junto con mi experiencia práctica, abarca tanto el mercado <strong>latinoamericano</strong> como el <strong>europeo</strong>.
                                    </p>
                                    <p>
                                        Constantemente estoy en aprendizaje, por lo que siempre estoy realizando un curso nuevo. Entre ellos se destacan los de community management, UX/UI, programación web, diseño, entre otros. Estas competencias me han permitido desarrollarme plenamente en el vasto campo de la comunicación y el marketing digital.
                                    </p>

                                </CarouselItem>
                                <CarouselItem className="flex flex-col justify-center items-center">
                                    <p>
                                        Afortunadamente, en mi trayectoria me he cruzado con personas muy profesionales y generosas que me han guiado en este hermoso camino. Gracias a ellos, he podido adquirir valiosos conocimientos y experiencias que me han permitido crecer en este campo.
                                    </p>
                                    <p>
                                        He trabajado con diversos clientes, desde el <strong>Museo de la Evolución Humana</strong> en Burgos, así como con la <strong>Televisión de Galicia</strong>.  Además, he participado en proyectos dedicados al cuidado del medio ambiente como <strong>LIFE SMART AgroMobility</strong>, y en sectores más comerciales con empresas de venta de ropa y accesorios.
                                    </p>
                                </CarouselItem>
                                <CarouselItem className="flex flex-col justify-center items-center">
                                    <p>
                                        Mi recorrido es amplio y variado, y me permite la adaptación a diferentes industrias y necesidades.
                                    </p>
                                    <p>
                                        Hoy, tengo la suerte de trabajar para mí misma, lo que me ha llevado a expandir mis horizontes y ofrecer mis servicios en el mercado español. Mi objetivo es cruzar fronteras y colaborar con quienes buscan <strong>potenciar su presencia digital</strong>. Estoy aquí para aportar toda mi experiencia y dedicación, orientándome siempre a las necesidades específicas de cada proyecto.
                                    </p>
                                </CarouselItem>
                                <CarouselItem className="flex flex-col justify-center items-center">
                                    <p>
                                        Creo firmemente en la importancia de la <strong>transparencia, la innovación y el compromiso</strong>. Mi objetivo es ayudar a las marcas a contar su historia de manera auténtica y efectiva, conectando con su audiencia de una manera genuina.
                                    </p>
                                    <p>

                                        Si buscas a alguien que combine profesionalidad con un trato cercano y personalizado, estaré encantada de ayudarte a alcanzar tus metas.  <strong>¡Conectemos y hagamos crecer tu marca juntos!
                                        </strong>
                                    </p>

                                </CarouselItem>
                            </CarouselContent>
                            <div className="flex justify-between items-center mt-4">
                                <div className="flex gap-4">
                                    <CarouselPrevious className="static" />
                                    <CarouselNext className="static" />
                                </div>
                                <div className="py-2 text-center text-sm text-primary">
                                    {current} / {count}
                                </div>
                            </div>
                        </Carousel>
                        {/* <p className="mb-4">
                            ¡Hola! Soy Evelyn Bogado y estoy aquí para ayudarte a explorar el mundo del marketing consciente.
                        </p>
                        <p className="mb-4">
                            ¡Construyamos juntos una presencia digital que refleje tus valores y conecte de verdad con tu audiencia!
                        </p> */}
                        <Link href="https://www.instagram.com/evelyn.digitalmkt/" target="_blank" rel="noopener noreferrer" className="flex justify-center group">
                            <Instagram className="w-full aspect-[2/1] sm:scale-50" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default SobreMi