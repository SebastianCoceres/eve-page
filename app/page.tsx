import { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { Intro } from "@/components/sections/Intro";
import { SobreMi } from "@/components/sections/SobreMi";
import Footer from "@/components/sections/Footer";
import Servicios from "@/components/sections/Servicios";
import Contacto from "@/components/sections/Contacto";
import { SectionMark } from "@/components/ui/SectionMark";
import { TravelingSun } from "@/components/ui/TravelingSun";
import { ScaleJourney } from "@/components/ui/ScaleJourney";
import { PageMotion } from "@/components/ui/PageMotion";
import { FloatingContact } from "@/components/ui/FloatingContact";

export const metadata: Metadata = {
  title: "Evelyn Bogado",
  description: "Vibra alto con un marketing consciente",
};

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[100] focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-full focus:bg-primary focus:px-6 focus:text-[15px] focus:font-medium focus:text-primary-foreground"
      >
        Saltar al contenido
      </a>
      {/* "El viaje del sol": one sun behind everything, rising in the hero and setting in the footer. */}
      {/* The sea's scales follow the sun: spray, wake, fans, momiji, and back to the sea.
          Behind the sun, so the disc occludes them like the seas do. */}
      <ScaleJourney />
      <TravelingSun />
      <main id="main" tabIndex={-1} className="relative z-10 focus:outline-none">
        <Hero />
        <Intro />
        {/* A single seigaiha scale as a quiet pause between chapters; elsewhere whitespace alone. */}
        <SectionMark />
        <Servicios />
        <SobreMi />
        <SectionMark />
        <Contacto />
      </main>
      <Footer />
      {/* No navbar: the one persistent action, shown once the hero's Contáctame has left. */}
      <FloatingContact />
      <PageMotion />
    </>
  );
}
