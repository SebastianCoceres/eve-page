import { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { Intro } from "@/components/sections/Intro";
import { SobreMi } from "@/components/sections/SobreMi";
import { NavbarSection as Navbar } from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import Servicios from "@/components/sections/Servicios";
import Contacto from "@/components/sections/Contacto";
import { SectionMark } from "@/components/ui/SectionMark";
import { TravelingSun } from "@/components/ui/TravelingSun";
import { PageMotion } from "@/components/ui/PageMotion";

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
      <header className="sticky top-0 z-50">
        <Navbar />
      </header>
      {/* "El viaje del sol": one sun behind everything, rising in the hero and setting in the footer. */}
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
      <PageMotion />
    </>
  );
}
