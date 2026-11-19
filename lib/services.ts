/**
 * The five services, in their fixed order (the contact form's preselect keys on
 * `key`). Each one is distilled into two or three short points taken only from
 * Eve's confirmed copy for that service: no new claims, metrics or guarantees.
 */
export interface ServiceItem {
    key: string
    title: string
    points: readonly string[]
}

export const Services = [
    {
        key: 'marketing-digital',
        title: 'Consultoría en marketing digital',
        points: [
            'Asesoramiento estratégico para tu presencia en línea',
            'Un enfoque personalizado: trabajamos juntos',
            'Oportunidades de crecimiento para tu negocio',
        ],
    },
    {
        key: 'redes-sociales',
        title: 'Gestión de redes sociales',
        points: [
            'Creación y gestión de tus perfiles',
            'Estrategias personalizadas para cada plataforma',
            'Contenido que resuena con tu audiencia',
        ],
    },
    {
        key: 'estrategias-contenido',
        title: 'Estrategias de contenido',
        points: [
            'De la investigación inicial a la creación y distribución',
            'Contenido relevante, adaptado a tu audiencia',
        ],
    },
    {
        key: 'desarrollo-web',
        title: 'Desarrollo web consciente',
        points: [
            'Sitios que reflejan los valores de tu marca',
            'Definimos juntos la visión y los objetivos',
            'Te guío en el diseño, las características y el contenido',
        ],
    },
    {
        key: 'otros-servicios',
        title: 'Otros servicios',
        points: [
            'Soluciones a medida de tus necesidades',
            'Trabajo de cerca contigo para entender tus objetivos',
            'Una amplia variedad de proyectos',
        ],
    },
] as const satisfies readonly ServiceItem[]

export type ServiceKeys = typeof Services[number]['key']
