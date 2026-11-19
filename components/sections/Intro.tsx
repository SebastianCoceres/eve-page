'use client'
import { useIsInViewWithStore } from "@/hooks/useIsInViewWithStore";
import { useFocusScene } from "@/hooks/useFocusScene";
import { RevealTitle } from "@/components/ui/TextReveal";

// The mondō (問答): two questions, each answered in turn.
const mondo = [
    {
        question: "¿Qué es el marketing consciente?",
        answer: "El marketing consciente se enfoca en valores éticos, autenticidad y responsabilidad social. Se centra en la transparencia y el bienestar tanto personal como colectivo.",
    },
    {
        question: "¿Por qué elegirlo?",
        answer: "Elegirlo es optar por una forma de promoción que va más allá de la simple venta de productos o servicios. Al adoptar el enfoque del marketing consciente, te comprometes a construir una marca auténtica y significativa que resuene con tu audiencia de manera genuina. Al priorizar la conexión emocional, puedes establecer relaciones más profundas y duraderas con tus clientes, lo que conduce a una lealtad más sólida y un mayor compromiso.",
    },
] as const

// While pinned (useFocusScene sets data-focus="pinned" from 768px), the statement and
// the two pairs share one grid cell and the scene shows them in turn; the active pair
// is centred in that cell (the room the statement held), never left at its top.
const PINNED_CELL = "group-data-[focus=pinned]/focus:[grid-area:1/1]"

/**
 * Mi enfoque: one statement, then a mondō.
 *
 * The statement is set large in the mincho and tells the contrast in its tone: the
 * traditional half in muted ink, and from "el marketing consciente prioriza…" the
 * full ink. The two questions follow as a dialogue, each question a step above the
 * statement in the mincho (text-question) and its answer in Geist at lead size
 * (text-answer, at most 52ch) beside a 1px hairline, one pair after the other.
 *
 * Without JS, under reduced motion and below 768px everything is in the flow (the
 * lines fade in and each pair rises on enter with motion). From 768px the stage pins
 * and the scene is spoken with the scroll (useFocusScene) while the sun rises to
 * midday in the free zone to the right of the text (useTravelingSun).
 */
export const Intro = () => {
    const { ref } = useIsInViewWithStore("focus")
    const scope = useFocusScene()

    return (
        <section ref={scope} id="focus" tabIndex={-1} className="group/focus section-pad scroll-mt-16 focus:outline-none">
            <div ref={ref} className="container">
                <div data-focus-stage>
                    <RevealTitle text="Mi enfoque" />
                    <div className="mt-10 grid md:mt-12 md:grid-cols-12 md:gap-x-6">
                        <div className="grid md:col-span-8">
                            <p data-focus-lead className={`text-statement text-foreground ${PINNED_CELL} group-data-[focus=pinned]/focus:self-start`}>
                                <span className="text-muted-foreground">
                                    Mientras que el marketing tradicional se centra principalmente en la venta de productos o servicios mediante estrategias persuasivas y a menudo intrusivas,
                                </span>{" "}
                                <span>
                                    el marketing consciente prioriza la integridad y la conexión genuina con la audiencia. En lugar de buscar simplemente aumentar las ventas a cualquier costo, el marketing consciente se preocupa por el bienestar tanto de los consumidores como de la sociedad en general.
                                </span>
                            </p>
                            {mondo.map(({ question, answer }) => (
                                <div
                                    key={question}
                                    data-focus-pair
                                    className={`mt-16 md:mt-24 group-data-[focus=pinned]/focus:mt-0 ${PINNED_CELL} group-data-[focus=pinned]/focus:self-center`}
                                >
                                    <h3 data-focus-question className="text-question text-foreground">{question}</h3>
                                    <p
                                        data-focus-answer
                                        className="mt-6 max-w-[52ch] border-l border-hairline pl-6 text-answer text-muted-foreground md:mt-8 md:pl-8"
                                    >
                                        {answer}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Intro
