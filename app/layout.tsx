import type { Metadata } from "next";
import { Geist, Zen_Old_Mincho } from "next/font/google";
import "./globals.css";
import { NavbarProvider } from "@/stores/nav/nav-providers";
import { ServiceProvider } from "@/stores/service/service-provider";
import { Toaster } from "@/components/ui/Toaster";

// The mincho voice (headings, leads, values): a Japanese old-style mincho with full
// Latin, including ¡ ¿ ñ and accented vowels. Only the Latin subset is downloaded.
const mincho = Zen_Old_Mincho({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  variable: "--font-mincho",
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
    <html lang="es" className={`${mincho.variable} ${geist.variable}`}>
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
