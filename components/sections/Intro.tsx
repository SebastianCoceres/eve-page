'use client'
import { useFocusScene } from "@/hooks/useFocusScene";
import { RevealTitle } from "@/components/ui/TextReveal";

type Point = { point: string; note?: string }

// Eve's statement and mondō, distilled into short points (her words, nothing added):
// first what traditional marketing does, then what conscious marketing does instead.
const acts: ReadonlyArray<{ id: "problem" | "answer"; label: string; points: ReadonlyArray<Point> }> = [
    {
        id: "problem",
        label: "El marketing tradicional",
        points: [
            { point: "Centrado en vender", note: "Productos o servicios, ante todo." },
            { point: "Estrategias persuasivas", note: "Y a menudo intrusivas." },
            { point: "Ventas a cualquier costo" },
        ],
    },
    {
        id: "answer",
        label: "El marketing consciente",
        points: [
            { point: "Integridad y conexión genuina", note: "Con tu audiencia, más allá de la venta." },
            { point: "Valores éticos", note: "Autenticidad y responsabilidad social." },
            { point: "Transparencia y bienestar", note: "De los consumidores y de la sociedad." },
            { point: "Relaciones duraderas", note: "Una lealtad más sólida y un mayor compromiso." },
        ],
    },
]

// While pinned (useFocusScene sets data-focus="pinned" from 1024px), both acts share
// one grid row: the problem on the left (the sun on the right), the answer on the
// right (the sun on the left).
const PINNED = "group-data-[focus=pinned]/focus:row-start-1 group-data-[focus=pinned]/focus:self-start"
const ACT_COLUMNS = {
    problem: `md:col-span-8 xl:col-span-7 ${PINNED} group-data-[focus=pinned]/focus:col-span-7 group-data-[focus=pinned]/focus:col-start-1`,
    answer: `md:col-span-8 md:col-start-5 xl:col-span-7 xl:col-start-6 ${PINNED} group-data-[focus=pinned]/focus:col-span-7 group-data-[focus=pinned]/focus:col-start-6`,
} as const

/**
 * Mi enfoque: the problem, then the answer, as short points in the mincho.
 *
 * Act 1, "El marketing tradicional": three points. Act 2, "El marketing consciente":
 * four points. Each point is a large mincho line (text-point) with at most one short
 * Geist note under it. The copy is distilled from Eve's own statement and mondō.
 *
 * From 1024px with motion the stage pins and the acts are told in turn with the
 * scroll (useFocusScene): the problem on the left while the sun stands on the right,
 * the sun crosses to the left, and the answer arrives on the right; every point turns
 * from muted to full ink and holds there. Below 1024px the acts are stacked (the
 * answer offset to the right from 768px) and each point rises once on enter.
 * Without JS and under reduced motion: stacked, static, all in full ink.
 */
export const Intro = () => {
    const scope = useFocusScene()

    return (
        <section ref={scope} id="focus" tabIndex={-1} className="group/focus section-pad focus:outline-none">
            <div className="container">
                <div data-focus-stage>
                    <RevealTitle text="Mi enfoque" />
                    <div className="mt-10 grid gap-y-20 md:mt-12 md:grid-cols-12 md:gap-x-6 md:gap-y-28">
                        {acts.map(({ id, label, points }) => (
                            <div key={id} data-focus-act={id} className={ACT_COLUMNS[id]}>
                                <h3 data-focus-label className="text-subtitle text-muted-foreground">{label}</h3>
                                <ul className="mt-8 space-y-8 md:mt-10 md:space-y-9">
                                    {points.map(({ point, note }) => (
                                        <li key={point} data-focus-item>
                                            <p data-focus-point className="text-point text-balance text-foreground">{point}</p>
                                            {note ? (
                                                <p data-focus-note className="mt-2 max-w-[40ch] text-base text-muted-foreground md:mt-3 md:text-lg">{note}</p>
                                            ) : null}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Intro
