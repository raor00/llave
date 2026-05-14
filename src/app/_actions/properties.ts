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
  });

  if (!updated) return { ok: false, error: "No se pudo actualizar el inmueble." };
  revalidateProperty(id);
  return { ok: true, id: updated.id };
}
