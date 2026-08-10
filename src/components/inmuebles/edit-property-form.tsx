"use client";

/**
 * Formulario de edición de inmueble: campos pre-cargados con los valores
 * actuales, amenities como chips toggleables y selector de estado. Al guardar
 * llama updatePropertyAction y vuelve a la cartera del asesor.
 */

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { updatePropertyAction } from "@/app/_actions/properties";
import { NumberStepper } from "@/components/ui/number-stepper";
import { uploadTourFile } from "@/lib/tours/upload-client";
import type { Property } from "@/lib/types";

const AMENITY_OPTIONS = [
  "planta electrica", "agua 24/7", "piscina", "gimnasio", "balcón",
  "jardín", "garage", "estacionamiento", "seguridad", "ascensor",
  "amoblado", "wifi incluido", "aire acondicionado", "vista al mar",
  "cerca metro", "terraza", "parrillera",
];

const STATUS_LABELS: Record<Property["status"], string> = {
  disponible: "Disponible",
  reservado: "Reservado",
  alquilado: "Alquilado",
  pausado: "Pausado",
};

export function EditPropertyForm({ property }: { property: Property }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [tourFile, setTourFile] = useState<File | null>(null);
  const [amenities, setAmenities] = useState<Set<string>>(
    new Set(property.amenities)
  );

  // Amenities pre-cargados que no están en el catálogo base.
  const extraAmenities = property.amenities.filter(
    (a) => !AMENITY_OPTIONS.includes(a)
  );
  const allAmenities = [...AMENITY_OPTIONS, ...extraAmenities];

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
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    fd.set("id", property.id);
    fd.set("amenities", JSON.stringify([...amenities]));
    try {
      if (tourFile) {
        toast.loading("Subiendo tour 3D…", { id: "tour-upload" });
        const uploaded = await uploadTourFile({ file: tourFile, propertyId: property.id });
        fd.set("tour_3d_url", uploaded.url);
        toast.success("Tour 3D subido", { id: "tour-upload" });
      }
      const res = await updatePropertyAction(fd);
      setSubmitting(false);
      if (res.ok) {
        toast.success("Inmueble actualizado");
        router.push("/asesor/inmuebles");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    } catch (err) {
      setSubmitting(false);
      toast.error(err instanceof Error ? err.message : "No se pudo subir el tour 3D.");
    }
    return;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <section className="card p-6 space-y-5">
        <h2 className="font-display text-xl font-semibold">Datos del inmueble</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Tipo</label>
            <select required name="type" defaultValue={property.type} className="input">
              <option value="apartamento">Apartamento</option>
              <option value="casa">Casa</option>
              <option value="local">Local</option>
              <option value="habitacion">Habitación</option>
              <option value="edificio">Edificio</option>
            </select>
          </div>
          <div>
            <label className="label">Precio mensual (USD)</label>
            <input
              required
              type="number"
              name="price_usd"
              min={50}
              step={10}
              defaultValue={property.price_usd}
              className="input"
            />
          </div>
        </div>

        <div>
          <label className="label">Título</label>
          <input required name="title" defaultValue={property.title} className="input" />
        </div>

        <div>
          <label className="label">Descripción</label>
          <textarea
            name="description"
            rows={4}
            defaultValue={property.description}
            className="input"
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Ciudad</label>
            <input required name="city" defaultValue={property.city} className="input" />
          </div>
          <div>
            <label className="label">Estado</label>
            <input required name="state" defaultValue={property.state} className="input" />
          </div>
          <div>
            <label className="label">Dirección</label>
            <input required name="address" defaultValue={property.address} className="input" />
          </div>
        </div>

        <div className="grid sm:grid-cols-4 gap-4">
          <div>
            <label className="label">Habitaciones</label>
            <NumberStepper name="rooms" defaultValue={property.rooms} min={0} max={20} required />
          </div>
          <div>
            <label className="label">Baños</label>
            <NumberStepper name="bathrooms" defaultValue={property.bathrooms} min={0} max={20} required />
          </div>
          <div>
            <label className="label">Área m²</label>
            <input
              type="number"
              name="area_m2"
              min={1}
              defaultValue={property.area_m2 ?? undefined}
              className="input"
            />
          </div>
          <div>
            <label className="label">Parking</label>
            <NumberStepper name="parking_spots" defaultValue={property.parking_spots} min={0} max={10} />
          </div>
        </div>

        <div>
          <label className="label">Estado del inmueble</label>
          <select name="status" defaultValue={property.status} className="input">
            {(Object.keys(STATUS_LABELS) as Property["status"][]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className="label">Amenities (haz clic en lo que aplica)</span>
          <div className="flex flex-wrap gap-2">
            {allAmenities.map((a) => {
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

        <div>
          <label className="label">Reglas (una por línea)</label>
          <textarea
            name="rules"
            rows={3}
            defaultValue={property.rules.join("\n")}
            placeholder="No mascotas&#10;No fumar"
            className="input"
          />
        </div>

        <div>
          <label className="label">URL del tour 3D</label>
          <input
            name="tour_3d_url"
            defaultValue={property.splat_url ?? property.tour_3d_url ?? ""}
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
            Soporta Polycam, .glb, .gltf, .usdz, .ply y .splat. Para iPhone, preferí .glb/.gltf para vista inline; .usdz es mejor como AR Quick Look.
          </p>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={submitting} className="btn btn-primary">
          {submitting ? "Guardando…" : "Guardar cambios"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/asesor/inmuebles")}
          className="btn btn-outline"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
