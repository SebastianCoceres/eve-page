'use client'
import Heading from "@/components/ui/Heading";
import { UndrawArtThinking } from "@/components/vectors/UndrawArtThinking2";
import { useIsInViewWithStore } from "@/hooks/useIsInViewWithStore";
import Link from "next/link";
import { Button } from "../ui/Button";
import { Instagram } from "../vectors/Instragram";

export const SobreMi = () => {
    const { ref } = useIsInViewWithStore("about")
    return (
        <section id="about" className="snap-always snap-center flex flex-col justify-center items-center flex-fill min-h-screen bg-background">
            <div ref={ref} className="container md:max-w-6xl mx-auto text-xl md:text-2xl">
                <Heading is="h2" className="text-secondary text-6xl">Sobre mí</Heading>
                <div className="flex flex-wrap -mx-4">
                    <div className="w-full sm:w-1/2 px-4 mb-4 flex flex-col items-center">
                        <UndrawArtThinking className="w-full p-4" />
                        <Button asChild variant={"secondary"}>
                            <Link href="/sobre-mi">Quiero conocerte más</Link>
                        </Button>
                    </div>
                    <div className="w-full sm:w-1/2 px-4 mb-4 text-3xl text-center text-balance">
                        <p className="mb-4">
                            ¡Hola! Soy Evelyn Bogado y estoy aquí para ayudarte a explorar el mundo del marketing consciente.
                        </p>
                        <p className="mb-4">
                            ¡Construyamos juntos una presencia digital que refleje tus valores y conecte de verdad con tu audiencia!
                        </p>
                        <Link href="https://www.instagram.com/evelyn.digitalmkt/" target="_blank" rel="noopener noreferrer" className="flex justify-center group">
                            <Instagram />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default SobreMi