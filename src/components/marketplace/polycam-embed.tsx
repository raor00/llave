"use client";

/**
 * PolycamEmbed — empotra el viewer oficial de Polycam vía iframe.
 *
 * Acepta cualquier URL de tipo `https://poly.cam/capture/<id>` (con o sin
 * sufijo `/embed`). Renderizar dentro del iframe nos da exactamente la
 * misma calidad y modo de cámara que el web viewer de Polycam — incluido
 * el walkthrough estilo Matterport cuando el capture es modo "Room".
 *
 * Llave prefiere este path cuando el asesor pega un share-link de Polycam
 * como `tour_3d_url`, porque preserva texturas y materiales (algo que el
 * export `.ply` pierde).
 */
export function PolycamEmbed({ url, title }: { url: string; title: string }) {
  const src = url.includes("/embed") ? url : `${url.replace(/\/$/, "")}/embed`;
  return (
    <div className="card overflow-hidden">
      <div className="relative aspect-[16/10] sm:aspect-[16/9] bg-black">
        <iframe
          src={src}
          title={title}
          className="absolute inset-0 w-full h-full border-0"
          allow="xr-spatial-tracking; fullscreen; accelerometer; gyroscope; magnetometer"
          loading="lazy"
        />
      </div>
      <div className="p-4 flex items-center justify-between gap-3 flex-wrap text-xs text-[color:var(--color-fg-soft)]">
        <span aria-label={title}>Render fotoreal vía Polycam</span>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-[color:var(--color-brand-700)] hover:underline font-semibold"
        >
          Abrir en Polycam ↗
        </a>
      </div>
    </div>
  );
}
