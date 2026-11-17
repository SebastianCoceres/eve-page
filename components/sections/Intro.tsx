'use client'
import { useFadeStagger } from "@/hooks/useFadeStagger";
import { useIsInViewWithStore } from "@/hooks/useIsInViewWithStore";
import { Heading } from "@/components/ui/Heading";

export const Intro = () => {
    const { ref } = useIsInViewWithStore("focus")
    const scope = useFadeStagger()

    return (
        <section id="focus" tabIndex={-1} className="section-pad scroll-mt-16 bg-surface focus:outline-none">
            <div ref={scope} className="container">
                <div ref={ref} className="grid gap-y-8 md:grid-cols-12 md:gap-x-6">
                    <Heading is="h2" className="reveal md:col-span-12 xl:col-span-4">Mi enfoque</Heading>
                    <p className="reveal max-w-[40ch] text-lead text-foreground md:col-span-10 xl:col-span-8 xl:col-start-5">
                        Mientras que el marketing tradicional se centra principalmente en la venta de productos o servicios mediante estrategias persuasivas y a menudo intrusivas, el marketing consciente prioriza la integridad y la conexión genuina con la audiencia. En lugar de buscar simplemente aumentar las ventas a cualquier costo, el marketing consciente se preocupa por el bienestar tanto de los consumidores como de la sociedad en general.
                    </p>

                    <div className="reveal mt-8 border-t border-hairline pt-8 md:col-span-6 md:mt-16 xl:col-span-4 xl:col-start-5">
                        <Heading is="h3">¿Qué es el marketing consciente?</Heading>
                        <p className="mt-4 max-w-[65ch] text-muted-foreground">
                            El marketing consciente se enfoca en valores éticos, autenticidad y responsabilidad social. Se centra en la transparencia y el bienestar tanto personal como colectivo.
                        </p>
                    </div>
                    <div className="reveal border-t border-hairline pt-8 md:col-span-6 md:mt-16 xl:col-span-4 xl:col-start-9">
                        <Heading is="h3">¿Por qué elegirlo?</Heading>
                        <p className="mt-4 max-w-[65ch] text-muted-foreground">
                            Elegirlo es optar por una forma de promoción que va más allá de la simple venta de productos o servicios. Al adoptar el enfoque del marketing consciente, te comprometes a construir una marca auténtica y significativa que resuene con tu audiencia de manera genuina. Al priorizar la conexión emocional, puedes establecer relaciones más profundas y duraderas con tus clientes, lo que conduce a una lealtad más sólida y un mayor compromiso.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Intro
