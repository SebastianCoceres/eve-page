'use client'
import Heading from "@/components/ui/Heading";
import { EmakiFan } from "@/components/ui/EmakiFan";
import { useIsInViewWithStore } from "@/hooks/useIsInViewWithStore";
import { useEmakiScroll } from "@/hooks/useEmakiScroll";
import { useServicesStore } from "@/stores/service/service-provider";
import { Services, type ServiceKeys } from "@/lib/services";
import { scrollToSection } from "@/lib/scroll";
import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";

// Where each fan rests along the horizon (share of the panel width): an uneven
// rhythm, like waves painted along a scroll, never a repeated stamp.
const FAN_AT = ["0%", "46%", "14%", "58%", "30%"];

/**
 * Servicios as an emakimono, a hand-scroll unrolled by the vertical scroll.
 *
 * Every layout below 1024px, under reduced motion and without JS is the stacked
 * one; `useEmakiScroll` sets `data-emaki="pinned"` on the section from 1024px and
 * the `group-data-[emaki=pinned]/emaki:` classes lay the track out horizontally:
 * tall panels joined by 1px hairlines, one continuous horizon through all of them
 * (`data-emaki-horizon`), a fan resting on it in each panel.
 *
 * Sun integration: the pin is `ScrollTrigger.getById("emaki-pin")` (see
 * `getEmakiPinRange` in hooks/useEmakiScroll), mirrored on this section as
 * `data-emaki-start` / `data-emaki-end` in document px.
 */
export const ServiciosSection = () => {
    const { ref, setSelectedNavbarItem } = useIsInViewWithStore("services")
    const { scope, active } = useEmakiScroll(Services.length)
    const selectedService = useServicesStore(state => state.selectedService)
    const setSelectedService = useServicesStore(state => state.setSelectedService)

    function selectService(key: ServiceKeys) {
        setSelectedService(key)
        setSelectedNavbarItem("contact")
        scrollToSection("contact")
    }

    return (
        <section
            ref={scope}
            id="services"
            tabIndex={-1}
            data-emaki-pin
            className="group/emaki section-pad scroll-mt-16 [--emaki-sky:clamp(80px,15vh,168px)] focus:outline-none data-[emaki=pinned]:flex data-[emaki=pinned]:h-screen data-[emaki=pinned]:flex-col data-[emaki=pinned]:justify-center data-[emaki=pinned]:pt-16 data-[emaki=pinned]:pb-0"
        >
            <div ref={ref} className="container">
                <Heading data-emaki-heading is="h2" className="max-w-[18ch] xl:max-w-none">Conoce lo que puedo ofrecerte</Heading>
            </div>

            <div
                data-emaki-viewport
                className="container mt-16 group-data-[emaki=pinned]/emaki:mt-[clamp(32px,6vh,64px)] group-data-[emaki=pinned]/emaki:max-w-none group-data-[emaki=pinned]/emaki:overflow-x-clip group-data-[emaki=pinned]/emaki:px-0"
            >
                <div
                    data-emaki-track
                    className="relative group-data-[emaki=pinned]/emaki:h-[clamp(440px,66vh,600px)] group-data-[emaki=pinned]/emaki:w-max group-data-[emaki=pinned]/emaki:px-[max(40px,calc((100%-1200px)/2))] group-data-[emaki=pinned]/emaki:will-change-transform"
                >
                    {/* One horizon through the whole scroll; every fan rests on it. */}
                    <span
                        data-emaki-horizon
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 top-[var(--emaki-sky)] hidden h-px bg-primary/45 group-data-[emaki=pinned]/emaki:block"
                    />
                    <ol className="flex flex-col group-data-[emaki=pinned]/emaki:h-full group-data-[emaki=pinned]/emaki:flex-row">
                        {Services.map((service, index) => {
                            const isSelected = selectedService === service.key
                            return (
                                <li
                                    key={service.key}
                                    data-emaki-panel
                                    className="group relative flex flex-col pb-14 last:pb-0 group-data-[emaki=pinned]/emaki:h-full group-data-[emaki=pinned]/emaki:w-[clamp(520px,58vw,600px)] xl:group-data-[emaki=pinned]/emaki:w-[clamp(440px,44vw,620px)] group-data-[emaki=pinned]/emaki:shrink-0 group-data-[emaki=pinned]/emaki:border-l group-data-[emaki=pinned]/emaki:border-hairline group-data-[emaki=pinned]/emaki:pb-0 group-data-[emaki=pinned]/emaki:last:border-r"
                                >
                                    {/* The sky: the fan sits on the horizon line below it. */}
                                    <div className="flex h-10 shrink-0 items-end group-data-[emaki=pinned]/emaki:h-[var(--emaki-sky)] group-data-[emaki=pinned]/emaki:px-10 xl:group-data-[emaki=pinned]/emaki:px-12">
                                        <div
                                            data-emaki-fan
                                            style={{ "--fan-at": FAN_AT[index % FAN_AT.length] } as CSSProperties}
                                            className="will-change-transform group-data-[emaki=pinned]/emaki:ml-[var(--fan-at)]"
                                        >
                                            <EmakiFan className="w-20 group-data-[emaki=pinned]/emaki:w-32" />
                                        </div>
                                    </div>

                                    <div className="border-t border-primary/45 pt-8 group-data-[emaki=pinned]/emaki:border-t-0 group-data-[emaki=pinned]/emaki:px-10 group-data-[emaki=pinned]/emaki:pt-[clamp(28px,5vh,48px)] xl:group-data-[emaki=pinned]/emaki:px-12">
                                        <Heading
                                            is="h3"
                                            variant="item"
                                            className="font-display text-[clamp(1.75rem,1.1rem+1.5vw,2.5rem)] font-normal leading-[1.08] tracking-[-0.015em]"
                                        >
                                            {/* The stretched ::after makes the whole panel the button's hit area. */}
                                            <button
                                                type="button"
                                                onClick={() => selectService(service.key)}
                                                aria-describedby={`service-description-${service.key}`}
                                                aria-pressed={isSelected}
                                                className="cursor-pointer text-left after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
                                            >
                                                <span
                                                    aria-hidden="true"
                                                    className={cn(
                                                        "mr-3 -ml-[18px] inline-block size-1.5 rounded-full bg-sun align-middle transition-[opacity,scale] duration-150 ease-out motion-reduce:transition-none",
                                                        isSelected ? "scale-100 opacity-100" : "scale-50 opacity-0"
                                                    )}
                                                />
                                                <span className="inline-block transition-transform duration-150 ease-out group-hover:translate-x-1 group-has-[:focus-visible]:translate-x-1 motion-reduce:transition-none">
                                                    {service.title}
                                                </span>
                                            </button>
                                        </Heading>
                                        <div
                                            id={`service-description-${service.key}`}
                                            className="mt-5 max-w-[62ch] text-muted-foreground group-data-[emaki=pinned]/emaki:text-[15px] xl:group-data-[emaki=pinned]/emaki:text-base [&_p+p]:mt-4 [&_strong]:font-medium [&_strong]:text-foreground"
                                        >
                                            {service.description}
                                        </div>
                                    </div>

                                    {/* Hover and focus frame: the hairline joins turn to solid cobalt. */}
                                    <span
                                        aria-hidden="true"
                                        className="pointer-events-none absolute -inset-x-4 inset-y-0 border border-primary opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100 group-has-[:focus-visible]:border-2 group-has-[:focus-visible]:opacity-100 motion-reduce:transition-none group-data-[emaki=pinned]/emaki:inset-x-0"
                                    />
                                </li>
                            )
                        })}
                    </ol>
                </div>
            </div>

            {/* Progress: one mark per panel, the active one in cobalt. */}
            <div aria-hidden="true" className="container mt-[clamp(24px,4vh,40px)] hidden gap-2 group-data-[emaki=pinned]/emaki:flex">
                {Services.map((service, index) => (
                    <span
                        key={service.key}
                        className={cn(
                            "h-px w-6 transition-colors duration-150 ease-out motion-reduce:transition-none",
                            index === active ? "bg-primary" : "bg-input-border/45"
                        )}
                    />
                ))}
            </div>
        </section>
    )
}

export default ServiciosSection
