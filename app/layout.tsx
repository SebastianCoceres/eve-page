import type { Metadata } from "next";
import { Roboto_Condensed } from "next/font/google";
import "./globals.css";
import { NavbarProvider } from "@/stores/nav-providers";
import { Toaster } from "@/components/ui/Toaster"

const roboto_condensed = Roboto_Condensed({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Evelyn Bogado",
  description: "Vibra alto con un marketing consciente",
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
