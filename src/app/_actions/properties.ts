"use server";

/**
 * Server actions de inmuebles: cambiar estado y editar campos. Escriben vía
 * queries seed-aware y revalidan las carteras (asesor + propietario) y el
 * detalle público para reflejar los cambios al instante.
 */

import { revalidatePath } from "next/cache";
import { updateProperty, updatePropertyStatus } from "@/lib/db/queries";
import type { Property, PropertyType } from "@/lib/types";

const VALID_STATUSES: Property["status"][] = [
  "disponible",
  "reservado",
  "alquilado",
  "pausado",
];

const VALID_TYPES: PropertyType[] = [
  "apartamento",
  "casa",
  "local",
  "edificio",
  "habitacion",
];


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

function revalidateProperty(id: string) {
  revalidatePath("/asesor/inmuebles");
  revalidatePath("/propietario/inmuebles");
  revalidatePath("/inmueble/" + id);
}

export async function setPropertyStatusAction(
  id: string,
  status: string
): Promise<
  { ok: true; status: Property["status"] } | { ok: false; error: string }
> {
  if (!id) return { ok: false, error: "Falta el inmueble." };
  if (!VALID_STATUSES.includes(status as Property["status"])) {
    return { ok: false, error: "Estado no soportado." };
  }
  const next = status as Property["status"];
  const updated = await updatePropertyStatus(id, next);
  if (!updated) return { ok: false, error: "No se pudo actualizar el estado." };
  revalidateProperty(id);
  return { ok: true, status: updated.status };
}

export async function updatePropertyAction(
  formData: FormData
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { ok: false, error: "Falta el inmueble." };

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const type = String(formData.get("type") ?? "") as PropertyType;
  const city = String(formData.get("city") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const status = String(formData.get("status") ?? "") as Property["status"];

  if (!title) return { ok: false, error: "El título es obligatorio." };
  if (!city) return { ok: false, error: "La ciudad es obligatoria." };
  if (!VALID_TYPES.includes(type)) {
    return { ok: false, error: "Tipo de inmueble no soportado." };
  }
  if (!VALID_STATUSES.includes(status)) {
    return { ok: false, error: "Estado no soportado." };
  }

  const priceRaw = Number(formData.get("price_usd"));
  const price_usd = Number.isFinite(priceRaw) ? Math.max(0, priceRaw) : 0;
  const rooms = Math.max(0, Number(formData.get("rooms")) || 0);
  const bathrooms = Math.max(0, Number(formData.get("bathrooms")) || 0);
  const parking_spots = Math.max(0, Number(formData.get("parking_spots")) || 0);
  const areaRaw = Number(formData.get("area_m2"));
  const area_m2 = Number.isFinite(areaRaw) && areaRaw > 0 ? areaRaw : null;

  let amenities: string[] = [];
  try {
    const parsed: unknown = JSON.parse(String(formData.get("amenities") ?? "[]"));
    if (Array.isArray(parsed)) {
      amenities = parsed.filter((a): a is string => typeof a === "string");
    }
  } catch {
    amenities = [];
  }

  const rules = String(formData.get("rules") ?? "")
    .split("\n")
    .map((r) => r.trim())
    .filter(Boolean);

  const tourUrl = normalizeOptionalTourUrl(formData.get("tour_3d_url"));
  const tourUrlKind = tourUrl ? classifyTourUrl(tourUrl) : null;
  if (tourUrl && !tourUrlKind) {
    return { ok: false, error: "El tour 3D debe ser un link Polycam o un archivo .glb, .gltf, .usdz, .ply o .splat." };
  }

  const updated = await updateProperty(id, {
    title,
    description,
    type,
    price_usd,
    city,
    state,
    address,
    rooms,
    bathrooms,
    area_m2,
    parking_spots,
    amenities,
    rules,
    status,
    tour_3d_url: tourUrlKind === "tour" ? tourUrl : null,
    splat_url: tourUrlKind === "splat" ? tourUrl : null,
  });

  if (!updated) return { ok: false, error: "No se pudo actualizar el inmueble." };
  revalidateProperty(id);
  return { ok: true, id: updated.id };
}
