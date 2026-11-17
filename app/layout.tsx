import type { Metadata } from "next";
import { Geist, Libre_Caslon_Display, Libre_Caslon_Text } from "next/font/google";
import "./globals.css";
import { NavbarProvider } from "@/stores/nav/nav-providers";
import { ServiceProvider } from "@/stores/service/service-provider";
import { Toaster } from "@/components/ui/Toaster";

const caslonDisplay = Libre_Caslon_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-caslon-display",
  display: "swap",
});

const caslonText = Libre_Caslon_Text({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-caslon-text",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

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
    <html lang="es" className={`${caslonDisplay.variable} ${caslonText.variable} ${geist.variable}`}>
      <body className="relative font-sans antialiased">
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
