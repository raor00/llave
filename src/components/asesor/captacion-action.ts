"use server";

import { revalidatePath } from "next/cache";
import { insertProperty } from "@/lib/db/queries";
import { DEMO_OWNER } from "@/lib/db/seed-data";


function normalizeOptionalTourUrl(value: FormDataEntryValue | null): string | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  if (raw.startsWith("/")) return raw;
  try {
    const url = new URL(raw);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function classifyTourUrl(url: string): "tour" | "splat" | null {
  const lower = url.toLowerCase().split("?")[0];
  if (/^https?:\/\/(www\.)?poly\.cam\//i.test(url)) return "tour";
  if (/\.(glb|gltf|usdz|ply)$/.test(lower)) return "tour";
  if (/\.splat$/.test(lower)) return "splat";
  return null;
}

const DEFAULT_COVERS = [
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200",
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200",
];

export async function capturarInmueble(form: FormData): Promise<
  | { ok: true; id: string; title: string }
  | { ok: false; error: string }
> {
  try {
    const photoCount = Number(form.get("photo_count") ?? 0);
    if (photoCount === 0) return { ok: false, error: "Subí al menos 1 foto" };

    const amenities = JSON.parse(String(form.get("amenities") ?? "[]")) as string[];
    const tourUrl = normalizeOptionalTourUrl(form.get("tour_3d_url"));
    const tourUrlKind = tourUrl ? classifyTourUrl(tourUrl) : null;
    if (tourUrl && !tourUrlKind) {
      return { ok: false, error: "El tour 3D debe ser un link Polycam o un archivo .glb, .gltf, .usdz, .ply o .splat" };
    }
    const cover = DEFAULT_COVERS[Math.floor(Math.random() * DEFAULT_COVERS.length)];
    const gallery = Array.from({ length: Math.min(photoCount, 4) }, () =>
      DEFAULT_COVERS[Math.floor(Math.random() * DEFAULT_COVERS.length)]
    );

    const property = await insertProperty({
      owner_id: DEMO_OWNER.id,
      title: String(form.get("title") ?? "Inmueble sin título"),
      description: String(form.get("description") ?? ""),
      type: form.get("type") as
        | "apartamento"
        | "casa"
        | "local"
        | "edificio"
        | "habitacion",
      city: String(form.get("city") ?? "Caracas"),
      state: String(form.get("state") ?? "Distrito Capital"),
      address: String(form.get("address") ?? ""),
      price_usd: Number(form.get("price_usd") ?? 0),
      rooms: Number(form.get("rooms") ?? 0),
      bathrooms: Number(form.get("bathrooms") ?? 0),
      area_m2: form.get("area_m2") ? Number(form.get("area_m2")) : undefined,
      parking_spots: Number(form.get("parking_spots") ?? 0),
      amenities,
      cover_url: cover,
      gallery_urls: gallery,
      tour_3d_url: tourUrlKind === "tour" ? tourUrl : null,
      splat_url: tourUrlKind === "splat" ? tourUrl : null,
    });

    revalidatePath("/buscar");
    revalidatePath("/asesor");
    return { ok: true, id: property.id, title: property.title };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Falló la publicación" };
  }
}
