import { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { Intro } from "@/components/sections/Intro";
import { SobreMi } from "@/components/sections/SobreMi";
import { NavbarSection as Navbar } from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import Servicios from "@/components/sections/Servicios";
import Contacto from "@/components/sections/Contacto";

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
      <main id="main" tabIndex={-1} className="focus:outline-none">
        <Hero />
        <Intro />
        <Servicios />
        <SobreMi />
        <Contacto />
      </main>
      <Footer />
    </>
  );
}
