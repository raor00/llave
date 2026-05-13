"use client";

import dynamic from "next/dynamic";

const Hero3D = dynamic(() => import("./hero-3d").then((m) => m.Hero3D), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center text-[color:var(--color-fg-soft)]">
      Cargando vista 3D…
    </div>
  ),
});

export function Hero3DWrapper() {
  return <Hero3D />;
}
