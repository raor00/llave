import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "Llave — Alquilar sin meses adelantados",
  description:
    "Plataforma venezolana de alquileres sin meses adelantados, con asistente IA Llavero. Reducí la fricción, mudate tranquilo.",
  openGraph: {
    title: "Llave — Alquilar sin meses adelantados",
    description:
      "Plataforma venezolana de alquileres sin meses adelantados, con asistente IA Llavero.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${jakarta.variable}`}>
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
