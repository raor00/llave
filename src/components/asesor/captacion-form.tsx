"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { capturarInmueble } from "./captacion-action";
import { NumberStepper } from "@/components/ui/number-stepper";
import { uploadTourFile } from "@/lib/tours/upload-client";

const AMENITY_OPTIONS = [
  "planta electrica", "agua 24/7", "piscina", "gimnasio", "balcón",
  "jardín", "garage", "estacionamiento", "seguridad", "ascensor",
  "amoblado", "wifi incluido", "aire acondicionado", "vista al mar",
  "cerca metro", "terraza", "parrillera",
];

type Preview = { id: string; url: string; name: string; size: number };

export function CaptacionForm() {
  const router = useRouter();
  const [photos, setPhotos] = useState<Preview[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [amenities, setAmenities] = useState<Set<string>>(new Set());
  const [tourFile, setTourFile] = useState<File | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    return () => {
      for (const p of photos) URL.revokeObjectURL(p.url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addPhotos(files: FileList | null) {
    if (!files) return;
    const next: Preview[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      next.push({
        id: crypto.randomUUID(),
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
      });
    }
    setPhotos((prev) => [...prev, ...next]);
  }

  function removePhoto(id: string) {
    setPhotos((prev) => {
      const removed = prev.find((p) => p.id === id);
      if (removed) URL.revokeObjectURL(removed.url);
      return prev.filter((p) => p.id !== id);
    });
  }

  function move(id: string, dir: -1 | 1) {
    setPhotos((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx < 0) return prev;
      const swap = idx + dir;
      if (swap < 0 || swap >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  }

  function toggleAmenity(a: string) {
    setAmenities((prev) => {
      const next = new Set(prev);
      if (next.has(a)) next.delete(a);
      else next.add(a);
      return next;
    });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (photos.length === 0) {
      toast.error("Tomá al menos 1 foto del inmueble.");
      return;
    }
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    fd.set("amenities", JSON.stringify([...amenities]));
    fd.set("photo_count", String(photos.length));
    try {
      if (tourFile) {
        toast.loading("Subiendo tour 3D…", { id: "tour-upload" });
        const uploaded = await uploadTourFile({ file: tourFile });
        fd.set("tour_3d_url", uploaded.url);
        toast.success("Tour 3D subido", { id: "tour-upload" });
      }
      const res = await capturarInmueble(fd);
      setSubmitting(false);
      if (res.ok) {
        toast.success(`Inmueble publicado: ${res.title}`);
        router.push(`/inmueble/${res.id}`);
      } else {
        toast.error(res.error ?? "No se pudo publicar.");
      }
    } catch (err) {
      setSubmitting(false);
      toast.error(err instanceof Error ? err.message : "No se pudo subir el tour 3D.");
    }
    return;
  }

  return (
    <form onSubmit={onSubmit} className="grid lg:grid-cols-[1fr_360px] gap-8">
      {/* MAIN COLUMN */}
      <div className="space-y-8">
        {/* FOTOS */}
        <section className="card p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="font-display text-xl font-semibold">Fotos del inmueble</h2>
              <p className="text-sm text-[color:var(--color-fg-muted)] mt-1">
                Toma las fotos directo desde la cámara del dispositivo, o sube archivos existentes.
              </p>
            </div>
            <span className="chip">{photos.length} foto{photos.length === 1 ? "" : "s"}</span>
          </div>

          <div className="flex flex-wrap gap-3 mb-4">
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="btn btn-primary"
            >
              📷 Tomar foto
            </button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                addPhotos(e.target.files);
                e.target.value = "";
              }}
            />
            <label className="btn btn-outline cursor-pointer">
              📁 Subir archivos
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  addPhotos(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
          </div>

          {photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {photos.map((p, i) => (
                <div key={p.id} className="relative group rounded-lg overflow-hidden border border-[color:var(--color-border)] bg-[color:var(--color-bg)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={p.name} className="aspect-square object-cover w-full" />
                  {i === 0 && (
                    <span className="absolute top-2 left-2 chip">Portada</span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-2 flex justify-between text-xs opacity-0 group-hover:opacity-100 transition bg-gradient-to-t from-black/60 to-transparent text-white">
                    <div className="flex gap-1">
                      <button type="button" onClick={() => move(p.id, -1)} disabled={i === 0} className="px-2 py-0.5 bg-black/40 rounded">↑</button>
                      <button type="button" onClick={() => move(p.id, 1)} disabled={i === photos.length - 1} className="px-2 py-0.5 bg-black/40 rounded">↓</button>
                    </div>
                    <button type="button" onClick={() => removePhoto(p.id)} className="px-2 py-0.5 bg-[color:var(--color-danger)] rounded">×</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* TOUR 3D */}
        <section className="card p-6 bg-gradient-to-br from-[color:var(--color-brand-50)] to-white border-[color:var(--color-brand-100)]">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <span className="chip mb-2">Tour 3D web</span>
              <h2 className="font-display text-xl font-semibold">Escaneo 3D del inmueble</h2>
              <p className="text-sm text-[color:var(--color-fg-muted)] mt-1 max-w-2xl">
                En web no podemos usar el LiDAR del iPhone directamente. El flujo actual es escanear en
                Polycam, recortar/optimizar allá, subir el archivo o copiar el link público y pegarlo acá.
              </p>
            </div>
            <span className="chip chip-muted shrink-0">Flujo web</span>
          </div>

          <div className="grid sm:grid-cols-4 gap-3 mt-2">
            <StepCard
              n={1}
              title="Escanea en Polycam"
              body="Usa LiDAR o Photo Mode desde la app nativa; Safari no expone LiDAR."
            />
            <StepCard
              n={2}
              title="Recorta"
              body="Elimina techo/suelo sobrante, pasillos ajenos y geometría que no pertenece al inmueble."
            />
            <StepCard
              n={3}
              title="Exporta"
              body="Preferí GLB optimizado para web. Splat queda para inmuebles premium."
            />
            <StepCard
              n={4}
              title="Pega la URL"
              body="Llave guarda el link en el inmueble y el detalle elige el viewer correcto."
            />
          </div>

          <div className="mt-5 rounded-lg bg-white border border-[color:var(--color-border)] p-4 text-sm space-y-3">
            <div>
              <label className="label">URL del tour 3D</label>
              <input
                name="tour_3d_url"
                placeholder="https://poly.cam/... o https://.../tour.glb"
                className="input"
              />
              <div className="mt-3">
                <label className="btn btn-outline cursor-pointer inline-flex">
                  Importar archivo 3D
                  <input
                    type="file"
                    accept=".glb,.gltf,.usdz,.ply,.splat,model/gltf-binary,model/vnd.usdz+zip"
                    className="hidden"
                    onChange={(e) => setTourFile(e.target.files?.[0] ?? null)}
                  />
                </label>
                {tourFile ? (
                  <span className="ml-3 text-xs text-[color:var(--color-fg-muted)]">
                    {tourFile.name} · {(tourFile.size / 1024 / 1024).toFixed(1)} MB
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-xs text-[color:var(--color-fg-soft)]">
                Podés pegar un link de Polycam/archivo público o importar un archivo. Para iPhone, preferí .glb/.gltf para vista inline; .usdz sirve mejor para AR Quick Look.
              </p>
            </div>
            <div className="rounded-lg bg-[color:var(--color-brand-50)] p-3 text-xs text-[color:var(--color-brand-700)]">
              Ruta recomendada hoy: Polycam → Crop/Edit → Export GLB → subir a Storage/CDN → pegar URL acá.
              Cuando exista App Clip de Llave, este paso se reemplaza por upload automático al inmueble correcto.
            </div>
          </div>
        </section>

        {/* DATOS */}
        <section className="card p-6 space-y-5">
          <h2 className="font-display text-xl font-semibold">Datos del inmueble</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Tipo</label>
              <select required name="type" defaultValue="apartamento" className="input">
                <option value="apartamento">Apartamento</option>
                <option value="casa">Casa</option>
                <option value="local">Local</option>
                <option value="habitacion">Habitación</option>
                <option value="edificio">Edificio</option>
              </select>
            </div>
            <div>
              <label className="label">Precio mensual (USD)</label>
              <input required type="number" name="price_usd" min={50} step={10} placeholder="280" className="input" />
            </div>
          </div>

          <div>
            <label className="label">Título</label>
            <input required name="title" placeholder="ej: Apartamento luminoso 2 hab en Las Mercedes" className="input" />
          </div>

          <div>
            <label className="label">Descripción</label>
            <textarea name="description" rows={4} placeholder="Contá lo distintivo: zona, vista, amoblado, transporte, lo que diferencia." className="input" />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Ciudad</label>
              <input required name="city" placeholder="Caracas" className="input" />
            </div>
            <div>
              <label className="label">Estado</label>
              <input required name="state" placeholder="Distrito Capital" className="input" />
            </div>
            <div>
              <label className="label">Dirección</label>
              <input required name="address" placeholder="Av. Principal de Las Mercedes" className="input" />
            </div>
          </div>

          <div className="grid sm:grid-cols-4 gap-4">
            <div>
              <label className="label">Habitaciones</label>
              <NumberStepper name="rooms" defaultValue={2} min={0} max={20} required />
            </div>
            <div>
              <label className="label">Baños</label>
              <NumberStepper name="bathrooms" defaultValue={2} min={0} max={20} required />
            </div>
            <div>
              <label className="label">Área m²</label>
              <input type="number" name="area_m2" min={1} placeholder="85" className="input" />
            </div>
            <div>
              <label className="label">Parking</label>
              <NumberStepper name="parking_spots" defaultValue={0} min={0} max={10} />
            </div>
          </div>

          <div>
            <span className="label">Amenities (haz clic en lo que aplica)</span>
            <div className="flex flex-wrap gap-2">
              {AMENITY_OPTIONS.map((a) => {
                const active = amenities.has(a);
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAmenity(a)}
                    className={`chip ${active ? "" : "chip-muted opacity-70"} cursor-pointer`}
                  >
                    {active ? "✓ " : ""}{a}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* SIDEBAR */}
      <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
        <div className="card p-6">
          <h3 className="font-display text-lg font-semibold mb-2">Checklist de captación</h3>
          <ul className="space-y-2 text-sm">
            <CheckItem ok={photos.length >= 3}>3+ fotos del inmueble</CheckItem>
            <CheckItem ok={amenities.size >= 2}>2+ amenities marcados</CheckItem>
            <CheckItem ok={true}>Datos completos del formulario</CheckItem>
          </ul>
        </div>

        <div className="card p-6 bg-[color:var(--color-brand-50)] border-[color:var(--color-brand-100)]">
          <h3 className="font-display text-lg font-semibold mb-2">Compromiso Llave</h3>
          <p className="text-sm text-[color:var(--color-fg-muted)]">
            Este inmueble se publica bajo el modelo Llave: <strong className="text-[color:var(--color-fg)]">sin meses adelantados</strong> y con depósito reducido reembolsable.
            Llave cubre incidentes cubiertos por contrato.
          </p>
        </div>

        <button type="submit" disabled={submitting} className="btn btn-primary w-full text-base py-3">
          {submitting ? "Publicando…" : "Publicar inmueble"}
        </button>

        <p className="text-xs text-[color:var(--color-fg-soft)]">
          Demo: las fotos no se persisten al storage en esta sesión. En producción suben a Vercel Blob.
        </p>
      </aside>
    </form>
  );
}

function CheckItem({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      <span className={`size-4 rounded-full flex items-center justify-center text-[10px] ${ok ? "bg-[color:var(--color-brand-500)] text-white" : "bg-[color:var(--color-border)] text-[color:var(--color-fg-soft)]"}`}>
        {ok ? "✓" : ""}
      </span>
      <span className={ok ? "" : "text-[color:var(--color-fg-soft)]"}>{children}</span>
    </li>
  );
}

function StepCard({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="rounded-lg bg-white border border-[color:var(--color-border)] p-3">
      <div className="size-7 rounded-full bg-[color:var(--color-brand-500)] text-white text-xs font-bold grid place-items-center mb-2">
        {n}
      </div>
      <div className="font-semibold text-sm leading-tight">{title}</div>
      <div className="text-xs text-[color:var(--color-fg-muted)] mt-1 leading-relaxed">{body}</div>
    </div>
  );
}
