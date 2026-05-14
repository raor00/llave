import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
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
    "Plataforma venezolana de alquileres sin meses adelantados, con asistente IA Llavero. Reduce la fricción, múdate tranquilo.",
  openGraph: {
    title: "Llave — Alquilar sin meses adelantados",
    description:
      "Plataforma venezolana de alquileres sin meses adelantados, con asistente IA Llavero.",
    type: "website",
  },
};

// El SiteHeader lee cookies + sesión Supabase; forzamos render dinámico para
// que el header refleje el estado autenticado (user menu + bell + role nav)
// en cuanto inicias sesión, sin servir una versión cacheada con la nav pública.
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${jakarta.variable}`}>
      <head>
        {/* Smart App Banner — surfaces Polycam install banner on iOS Safari for asesores
            in /asesor/captacion who haven't installed it yet. */}
        <meta name="apple-itunes-app" content="app-id=1532482376" />
      </head>
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <Toaster richColors position="top-center" />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
