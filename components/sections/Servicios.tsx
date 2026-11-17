'use client'
import Heading from "@/components/ui/Heading";
import { useIsInViewWithStore } from "@/hooks/useIsInViewWithStore";
import { useFadeStagger } from "@/hooks/useFadeStagger";
import { useServicesStore } from "@/stores/service/service-provider";
import { Services, type ServiceKeys } from "@/lib/services";
import { scrollToSection } from "@/lib/scroll";
import { cn } from "@/lib/utils";

export const ServiciosSection = () => {
    const { ref, setSelectedNavbarItem } = useIsInViewWithStore("services")
    const scope = useFadeStagger()
    const selectedService = useServicesStore(state => state.selectedService)
    const setSelectedService = useServicesStore(state => state.setSelectedService)

    function selectService(key: ServiceKeys) {
        setSelectedService(key)
        setSelectedNavbarItem("contact")
        scrollToSection("contact")
    }

    return (
        <section id="services" tabIndex={-1} className="section-pad scroll-mt-16 focus:outline-none">
            <div ref={scope} className="container">
                <div ref={ref}>
                    <Heading is="h2" className="reveal max-w-[18ch] xl:max-w-none">Conoce lo que puedo ofrecerte</Heading>

                    {/* The index sits on the shaded side of the wall; hairlines separate rows, no cards. */}
                    <ul className="reveal mt-16 bg-surface">
                        {Services.map((service) => {
                            const isSelected = selectedService === service.key
                            return (
                                <li
                                    key={service.key}
                                    className="group relative grid gap-4 border-b border-hairline px-6 py-8 transition-colors duration-150 ease-out last:border-b-0 hover:bg-background motion-reduce:transition-none md:px-10 xl:grid-cols-12 xl:gap-x-6"
                                >
                                    <Heading is="h3" variant="item" className="xl:col-span-4">
                                        <button
                                            type="button"
                                            onClick={() => selectService(service.key)}
                                            aria-describedby={`service-description-${service.key}`}
                                            aria-pressed={isSelected}
                                            className="inline-flex cursor-pointer items-center gap-3 text-left focus-visible:outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-ring"
                                        >
                                            <span
                                                aria-hidden="true"
                                                className={cn("size-1.5 shrink-0 rounded-full bg-accent", !isSelected && "hidden")}
                                            />
                                            {service.title}
                                        </button>
                                    </Heading>
                                    <div
                                        id={`service-description-${service.key}`}
                                        className="max-w-[65ch] text-muted-foreground xl:col-span-7 [&_p+p]:mt-4 [&_strong]:font-medium [&_strong]:text-foreground"
                                    >
                                        {service.description}
                                    </div>
                                    <span
                                        aria-hidden="true"
                                        className={cn(
                                            "text-[15px] font-medium xl:col-span-1 xl:justify-self-end",
                                            isSelected ? "text-foreground" : "text-link group-hover:underline group-hover:decoration-1 group-hover:underline-offset-[3px]"
                                        )}
                                    >
                                        {isSelected ? "Elegido" : "Elegir"}
                                    </span>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </div>
        </section>
    )
}

export default ServiciosSection
