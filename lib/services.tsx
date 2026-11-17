import type { ReactNode } from "react";

export interface ServiceItem {
    key: string
    title: string
    description: ReactNode
}

export const Services = [
    {
        key: 'marketing-digital',
        title: 'Consultoría en marketing digital',
        description: (
            <p>
                Brindo asesoramiento estratégico para <strong>potenciar tu presencia en línea</strong> y alcanzar de manera efectiva a tu público objetivo. Mediante un enfoque personalizado, <strong>trabajaremos juntos</strong> para identificar oportunidades de crecimiento y desarrollar estrategias que impulsen <strong>el éxito de tu negocio en el mundo digital</strong>.
            </p>
        ),
    },
    {
        key: 'redes-sociales',
        title: 'Gestión de redes sociales',
        description: (
            <>
                <p>
                    Ofrezco servicios completos de creación y gestión de perfiles en redes sociales para <strong>potenciar la visibilidad y el compromiso de tu marca en línea</strong>. Trabajando de cerca contigo, desarrollaré <strong>estrategias personalizadas</strong> para cada plataforma social, creando contenido atractivo y relevante que resuene con tu audiencia.
                </p>
                <p>
                    Mi objetivo es <strong>aumentar la interacción con tus seguidores, mejorar la reputación de tu marca y generar un impacto significativo en tus objetivos comerciales</strong>.
                </p>
            </>
        ),
    },
    {
        key: 'estrategias-contenido',
        title: 'Estrategias de contenido',
        description: (
            <p>
                Desarrollo estrategias de contenido que <strong>cautivan a tu audiencia</strong>. Desde la investigación inicial hasta la creación y distribución, <strong>te ofrezco soluciones adaptadas</strong> para crear contenido relevante y atractivo que <strong>atraiga y retenga a tu audiencia</strong> en línea.
            </p>
        ),
    },
    {
        key: 'desarrollo-web',
        title: 'Desarrollo web consciente',
        description: (
            <>
                <p>
                    Ofrezco <strong>orientación experta</strong> en la creación de sitios web que reflejen fielmente los valores de tu marca y promuevan una interacción significativa con los usuarios. Trabajaremos juntos para definir la visión de tu sitio web y establecer los <strong>objetivos claros que deseas alcanzar</strong>.
                </p>
                <p>
                    <strong>Te guiaré</strong> en la selección de diseños, características y contenido que mejor representen tu identidad de marca y generen una experiencia en línea atractiva y envolvente para tus visitantes.
                </p>
            </>
        ),
    },
    {
        key: 'otros-servicios',
        title: 'Otros servicios',
        description: (
            <>
                <p>
                    Ofrezco una amplia gama de servicios <strong>adaptados a las necesidades específicas de cada cliente</strong>. Mi enfoque es trabajar estrechamente contigo para entender tus objetivos y desafíos únicos. Te proporciono soluciones a medida que <strong>impulsan el crecimiento y el éxito de tu negocio.</strong>
                </p>
                <p>
                    Mi versatilidad me permite abordar una amplia variedad de proyectos, garantizando <strong>resultados excepcionales</strong> en cada uno.
                </p>
            </>
        ),
    },
] as const

export type ServiceKeys = typeof Services[number]['key']
