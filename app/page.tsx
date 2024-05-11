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
    <div id="wrapper" className="min-h-screen max-h-screen overflow-y-scroll scrollbar-hide snap-y snap-mandatory scroll-smooth scroll-pe-[2em]">
      <header className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </header>
      <main >
        <Hero />
        <Intro />
        <Servicios />
        <SobreMi />
        <Contacto />
      </main >
      <Footer />
    </div>
  );
}
