'use client'
import {
    MotionAccordion,
    MotionAccordionContent,
    MotionAccordionItem,
    MotionAccordionTrigger,
} from "@/components/ui/AccordionWithMotion";
import { useAccordionAnimation } from "@/hooks/useAccordionAnimation";
import { useIsInViewWithStore } from "@/hooks/useIsInViewWithStore";


export const Intro = () => {
    const { ref, isInView } = useIsInViewWithStore("focus")
    const scope = useAccordionAnimation(isInView);

    return (
        <section id="focus" className="snap-always snap-center flex flex-col justify-center items-center flex-fill min-h-screen bg-background">
            <div ref={scope} className="container md:max-w-6xl mx-auto text-xl md:text-2xl">
                <div ref={ref}>
                    <MotionAccordion type="single" defaultValue={"item-1"}>
                        <MotionAccordionItem value="item-1" className="accordionItem my-8">
                            <MotionAccordionTrigger>¿Qué es el marketing consciente?</MotionAccordionTrigger>
                            <MotionAccordionContent>
                                <p>
                                    El marketing consciente se enfoca en valores éticos, autenticidad y responsabilidad social. Se centra en la transparencia y el bienestar tanto personal como colectivo.
                                </p>
                                <p>
                                    Al priorizar la conexión genuina, la responsabilidad social y el impacto positivo en la sociedad, busca un equilibrio entre el éxito empresarial y el crecimiento personal.
                                </p>
                            </MotionAccordionContent>
                        </MotionAccordionItem>
                        <MotionAccordionItem value="item-2" className="accordionItem my-8">
                            <MotionAccordionTrigger>¿Por que elegirlo?</MotionAccordionTrigger>
                            <MotionAccordionContent>
                                <p>
                                    Elegirlo es optar por una forma de promoción que va más allá de la simple venta de productos o servicios. Al adoptar el enfoque del marketing consciente, te comprometes a construir una marca auténtica y significativa que resuene con tu audiencia de manera genuina. Al priorizar la conexión emocional, puedes establecer relaciones más profundas y duraderas con tus clientes, lo que conduce a una lealtad más sólida y un mayor compromiso.
                                </p>
                                <p>
                                    Además, el marketing consciente te permite diferenciarte de la competencia al destacar tus valores y tu compromiso con el bienestar de la comunidad. Al elegir el marketing consciente, estás contribuyendo a un cambio positivo en la industria y en la sociedad en general, mientras construyes un negocio exitoso y ético.
                                </p>
                            </MotionAccordionContent>
                        </MotionAccordionItem>
                        <MotionAccordionItem value="item-3" className="accordionItem my-8 border-none">
                            <MotionAccordionTrigger>¿En qué se diferencia del marketing tradicional?</MotionAccordionTrigger>
                            <MotionAccordionContent>
                                <p>
                                    Mientras que el marketing tradicional se centra principalmente en la venta de productos o servicios mediante estrategias persuasivas y a menudo intrusivas, el marketing consciente prioriza la integridad y la conexión genuina con la audiencia. En lugar de buscar simplemente aumentar las ventas a cualquier costo, el marketing consciente se preocupa por el bienestar tanto de los consumidores como de la sociedad en general.
                                </p>
                            </MotionAccordionContent>
                        </MotionAccordionItem>
                    </MotionAccordion>
                </div>
            </div>
        </section>
    )
}

export default Intro