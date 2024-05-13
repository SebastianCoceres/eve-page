import type { Metadata } from "next";
import { Roboto_Condensed } from "next/font/google";
import "./globals.css";
import { NavbarProvider } from "@/stores/nav-providers";
import { Toaster } from "@/components/ui/Toaster";
import Script from 'next/script';

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
        <NavbarProvider>
          {children}
        </NavbarProvider>
        <Toaster />
      </body>
    </html>
  );
}
