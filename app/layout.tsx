import type { Metadata } from "next";
import { Roboto_Condensed } from "next/font/google";
import "./globals.css";
import { NavbarProvider } from "@/stores/nav/nav-providers";
import { ServiceProvider } from "@/stores/service/service-provider";
import { Toaster } from "@/components/ui/Toaster";

const roboto_condensed = Roboto_Condensed({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Evelyn Bogado",
  description: "Vibra alto con un marketing consciente",
  authors: [{ name: "Evelyn Bogado" }, { name: "Sebastian Coceres", url: "https://sebastiancoceres.dev" }],
  creator: "Sebastian Coceres",
  keywords: ["Evelyn Bogado", "Marketing conciente", "Marketing responsable", "Crecimiento empresarial", "Marketing digital"],
  icons: {
    icon: "/logo-sin-fondo.png",
  }
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${roboto_condensed.className}`}>
        <ServiceProvider>
          <NavbarProvider>
            {children}
          </NavbarProvider>
        </ServiceProvider>
        <Toaster />
      </body>
    </html>
  );
}
