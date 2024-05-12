'use client'
import Heading from "@/components/ui/Heading";
import { useIsInViewWithStore } from "@/hooks/useIsInViewWithStore";
import Image from "next/image";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi
} from "@/components/ui/Carousel"
import { useEffect, useState } from "react";



const services = [
    {
        title: 'Consultoría en marketing digital',
        description: '<p>Brindo asesoramiento estratégico para <strong>potenciar tu presencia en línea</strong> y alcanzar de manera efectiva a tu público objetivo. Mediante un enfoque personalizado, <strong>trabajaremos juntos</strong> para identificar oportunidades de crecimiento y desarrollar estrategias que impulsen <strong>el éxito de tu negocio en el mundo digital</strong>.',
        image: '/undraw_mobile_marketing_re_p77p.svg'
    },
    {
        title: 'Gestión de redes sociales',
        description: '<p>Ofrezco servicios completos de creación y gestión de perfiles en redes sociales para <strong>potenciar la visibilidad y el compromiso de tu marca en línea</strong>. Trabajando de cerca contigo, desarrollaré <strong>estrategias personalizadas</strong> para cada plataforma social, creando contenido atractivo y relevante que resuene con tu audiencia.</p><p> Mi objetivo es <strong>aumentar la interacción con tus seguidores, mejorar la reputación de tu marca y generar un impacto significativo en tus objetivos comerciales</strong>.</p>',
        image: '/undraw_social_media_re_sulg.svg'
    },
    {
        title: 'Estrategias de contenido',
        description: '<p>Desarrollo estrategias de contenido que <strong>cautivan a tu audiencia</strong>. Desde la investigación inicial hasta la creación y distribución, <strong>te ofrezco soluciones adaptadas</strong> para crear contenido relevante y atractivo que <strong>atraiga y retenga a tu audiencia</strong> en línea.',
        image: '/undraw_file_analysis_8k9b.svg'
    },
    {
        title: 'Desarrollo web consciente',
        description: '<p>Ofrezco <strong>orientación experta</strong> en la creación de sitios web que reflejen fielmente los valores de tu marca y promuevan una interacción significativa con los usuarios. Trabajaremos juntos para definir la visión de tu sitio web y establecer los <strong>objetivos claros que deseas alcanzar</strong>.</p><p> <strong>Te guiaré</strong> en la selección de diseños, características y contenido que mejor representen tu identidad de marca y generen una experiencia en línea atractiva y envolvente para tus visitantes.</p> ',
        image: '/undraw_start_building_re_xani.svg'
    },
    {
        title: 'Otros servicios',
        description: '<p>Ofrezco una amplia gama de servicios <strong>adaptados a las necesidades específicas de cada cliente</strong>. Mi enfoque es trabajar estrechamente contigo para entender tus objetivos y desafíos únicos. Te proporciono soluciones a medida que <strong>impulsan el crecimiento y el éxito de tu negocio </strong>.</p> <p>Mi versatilidad me permite abordar una amplia variedad de proyectos, garantizando <strong>resultados excepcionales </strong> en cada uno.</p>',
        image: '/undraw_random_thoughts_re_cob6.svg'
    },

]

export const SobreMi = () => {
    const [api, setApi] = useState<CarouselApi>()
    const [current, setCurrent] = useState(0)
    const [count, setCount] = useState(0)
    const { ref } = useIsInViewWithStore("services")

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
        <section id="services" className=" flex flex-col justify-center items-center flex-fill min-h-screen  bg-primary/10">
            <div ref={ref} className="container md:max-w-6xl mx-auto">
                <Heading is="h2" className="text-primary">Conoce lo que puedo ofrecerte</Heading>
                <Carousel setApi={setApi} opts={{ loop: true, align: 'center' }}>
                    <CarouselContent >
                        {services.map((service, index) => (
                            <CarouselItem key={index} className="flex basis-full md:basis-1/2">
                                <div className="flex flex-col -mx-4 flex-1 p-4 border bg-background rounded-lg overflow-hidden">
                                    <div className="relative aspect-[3/1]">
                                        <Image src={service.image} alt={service.title} fill></Image>
                                    </div>
                                    <div className="flex-1 p-4">
                                        <Heading is="h3" className="text-primary relative z-10 ">
                                            {service.title}
                                        </Heading>
                                        <hr className="w-1/3 my-2 border-b border-primary/50" />
                                        <div dangerouslySetInnerHTML={{ __html: service.description }}>
                                        </div>
                                    </div>
                                </div>

                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="absolute top-auto -bottom-1 left-4 translate-y-full"/>
                    <CarouselNext className="absolute top-auto -bottom-1 right-4 translate-y-full"/>
                </Carousel>
                <div className="py-2 text-center text-sm text-primary">
                    {current} / {count}
                </div>
            </div>
        </section >
    )
}

export default SobreMi