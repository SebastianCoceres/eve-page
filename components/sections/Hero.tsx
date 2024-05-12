'use client'
import Image from "next/image";
import imagen from "@/public/fondo-hero.webp";
import { Logo } from "@/components/ui/Logo";
import Heading from "@/components/ui/Heading";
import { Button } from "@/components/ui/Button";
import { useIsInViewWithStore } from "@/hooks/useIsInViewWithStore";


export const Hero = () => {
    const { ref } = useIsInViewWithStore("home")
    return (
        <section id="home" className="relative  flex flex-col justify-center items-center flex-fill min-h-screen">
            <div className="absolute inset-0 -z-[1]">
                <div className="absolute inset-0 lg:bg-hero-pattern bg-no-repeat bg-cover opacity-20"></div>
                <div className="absolute right-0 w-full h-full md:w-2/3">
                    <Image priority src={imagen} alt="" fill className="object-cover mask-gradient grayscale "></Image>
                </div>
            </div>
            <div ref={ref} className="flex container md:max-w-6xl mx-auto">
                <div className="md:w-2/3 text-balance flex flex-col justify-center items-start">
                    <div className="text-center">
                        <Heading is="h1" className="hidden md:block">
                            <span className="sr-only">Evelyn Bogado</span>
                            <Logo />
                        </Heading>
                        <Heading is="h2" className="relative z-[1] text-left">
                            Vibra alto con un marketing consciente
                        </Heading>
                    </div>
                    <Button size={"xl"} className={"mt-4"} rounded={"full"}>
                        Contactame
                    </Button>
                    <Button variant={"outline"} size={"xl"} className={"mt-4 text-primary"} rounded={"full"}>
                        Quiero conocerte más
                    </Button>
                </div>
            </div>
        </section>
    )
}

export default Hero