'use client'
import type { MouseEvent } from "react";
import { RevealTitle } from "@/components/ui/TextReveal";
import { EmakiFan } from "@/components/ui/EmakiFan";
import { Button } from "@/components/ui/Button";
import { useAboutJourney } from "@/hooks/useAboutJourney";
import { useIsInViewWithStore } from "@/hooks/useIsInViewWithStore";
import { scrollToSection } from "@/lib/scroll";

// Eve's six paragraphs, distilled into milestones (her words, nothing added): one
// large mincho line each, with at most one short Geist note.
const milestones: ReadonlyArray<{ point: string; note: string }> = [
    { point: "Latinoamérica y Europa", note: "Formación y experiencia práctica en ambos mercados." },
    { point: "Siempre aprendiendo", note: "Community management, UX/UI, programación web, diseño." },
    { point: "Hoy, por mi cuenta", note: "Trabajo para mí misma y ofrezco mis servicios en el mercado español." },
    { point: "Transparencia, innovación y compromiso", note: "Para contar la historia de tu marca de manera auténtica." },
    { point: "Profesional y cercana", note: "Un trato personalizado, orientado a tus metas." },
]

/**
 * "Sol de la tarde": the afternoon sun, one whole disc under the heading, flush with
 * its left edge. Nothing stands in front of it: no sea, no paper strip, so it is
 * never cut. The disc is [data-sun-anchor="about"]: the traveling sun parks exactly
 * there (same size and place, measured from the live layout) and only warms while
 * the text is read (useTravelingSun); under reduced motion it is the static disc.
 * Its size matches the former frame's 0.62 share: 174px on phones, 198px from 768px.
 */
const AfternoonSun = () => (
    <div data-about-sun aria-hidden="true" className="mt-14 w-[min(100%,174px)] md:w-[198px]">
        <div data-sun-anchor="about" className="pointer-events-none aspect-square w-full motion-safe:invisible">
            <div className="size-full rounded-full bg-sun" />
        </div>
    </div>
)

/**
 * Sobre mí: who Eve is, as an opening line and five milestones.
 *
 * From 1280px the left column (heading and the afternoon sun) is sticky 112px from
 * the top while the milestones pass on the right; the column is `[data-sun-sticky]`,
 * so the traveling sun stays locked to its disc, whole, for the whole sticky range
 * and warms as the text is read (useTravelingSun). The opening line is set
 * as a statement; each milestone is a large mincho line with a small seigaiha fan in
 * the margin and one short note, spaced so they arrive one at a time. The close,
 * "¡Conectemos y hagamos crecer tu marca juntos!", follows with the Contáctame pill
 * and Instagram. Below 1280px: heading, sun, then the text; nothing sticks.
 * Motion: useAboutJourney (each line turns from muted to full ink and holds there).
 * Reduced motion and no JS: everything static, visible and in full ink.
 */
export const SobreMi = () => {
    const { ref, setSelectedNavbarItem } = useIsInViewWithStore("about")
    const scope = useAboutJourney()

    const goToContact = (event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault()
        setSelectedNavbarItem("contact")
        scrollToSection("contact")
    }

    return (
        <section id="about" tabIndex={-1} className="section-pad scroll-mt-16 focus:outline-none">
            <div ref={scope} className="container">
                <div ref={ref} className="grid gap-y-14 xl:grid-cols-12 xl:gap-x-6">
                    <div className="xl:col-span-5">
                        <div data-sun-sticky className="xl:sticky xl:top-[112px]">
                            <RevealTitle text="Sobre mí" />
                            <AfternoonSun />
                        </div>
                    </div>

                    <div className="xl:col-span-6 xl:col-start-7 xl:pt-3">
                        <p data-about-open className="max-w-[20em] text-statement text-foreground">
                            Soy Eve, licenciada en Publicidad y especializada en marketing digital.
                        </p>

                        <ol className="mt-16 space-y-14 md:mt-20 md:space-y-20 xl:space-y-28">
                            {milestones.map(({ point, note }) => (
                                <li key={point} data-about-milestone className="grid grid-cols-[32px_minmax(0,1fr)] gap-x-5 md:gap-x-7">
                                    {/* A milestone on the scroll: one small seigaiha fan, drawn on enter. */}
                                    <span data-chapter-mark className="block pt-[0.55em] text-point">
                                        <EmakiFan className="w-8" />
                                    </span>
                                    <div>
                                        <p data-about-point className="text-point text-balance text-foreground">{point}</p>
                                        <p data-about-note className="mt-3 max-w-[44ch] text-base text-muted-foreground md:text-lg">{note}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>

                        <div className="mt-20 md:mt-28">
                            <p data-about-close className="max-w-[18em] text-statement text-foreground">
                                ¡Conectemos y hagamos crecer tu marca juntos!
                            </p>
                            <div data-about-cta className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3">
                                <Button asChild>
                                    <a href="#contact" onClick={goToContact}>Contáctame</a>
                                </Button>
                                <a
                                    href="https://www.instagram.com/evelyn.digitalmkt/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="link inline-flex min-h-11 items-center text-[15px] font-medium"
                                >
                                    Instagram
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default SobreMi
