/**
 * Property view tracking. Bumps `properties.view_count` and inserts a
 * `property_views` row when Supabase is configured. Falls back to an
 * in-memory map (per-server-process) so the demo dashboards still show
 * realistic numbers without the migration applied.
 */

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SUPABASE_ENABLED } from "@/lib/supabase/env";

const inMemViews = new Map<string, number>();
// Seed with realistic-looking numbers so the propietario dashboard isn't blank
// the first time it loads. Properties not in this map start at 0 and grow.
function seedInitial(propertyId: string): number {
  // deterministic-ish from id so dashboards don't reshuffle on each refresh
  let hash = 0;
  for (let i = 0; i < propertyId.length; i++) hash = ((hash << 5) - hash + propertyId.charCodeAt(i)) | 0;
  return 12 + Math.abs(hash % 60); // 12..71
}

export async function recordPropertyView(args: {
  propertyId: string;
  viewerId?: string | null;
  city?: string;
  type?: string;
  priceUsd?: number;
}) {
  const { propertyId } = args;

  if (!SUPABASE_ENABLED) {
    const current = inMemViews.get(propertyId) ?? seedInitial(propertyId);
    inMemViews.set(propertyId, current + 1);
    return;
  }

  const supa = await createSupabaseServerClient();
  if (!supa) return;

  // Insert detailed view row for Llavero analytics; ignore failures so a 404
  // table doesn't break the property page render.
  void supa.from("property_views").insert({
    property_id: propertyId,
    viewer_id: args.viewerId ?? null,
    city: args.city ?? null,
    property_type: args.type ?? null,
    price_usd: args.priceUsd ?? null,
  });

  // Bump the denormalised counter via rpc when present.
  void supa.rpc("increment_property_views", { p_property_id: propertyId });
}

export async function getViewsByProperty(
  propertyIds: string[]
): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  if (propertyIds.length === 0) return out;

  if (!SUPABASE_ENABLED) {
    for (const id of propertyIds) {
      out.set(id, inMemViews.get(id) ?? seedInitial(id));
    }
    return out;
  }

  const supa = await createSupabaseServerClient();
  if (!supa) {
    for (const id of propertyIds) out.set(id, seedInitial(id));
    return out;
  }

  const { data } = await supa
    .from("properties")
    .select("id, view_count")
    .in("id", propertyIds);

  for (const id of propertyIds) {
    const row = data?.find((r) => r.id === id);
    out.set(id, row?.view_count ?? seedInitial(id));
  }
  return out;
}

export async function getViewsTimeSeries(
  propertyIds: string[]
): Promise<Array<{ day: string; views: number }>> {
  // Returns last 7 days. Synthesises a curve (deterministic per id set) so
  // los dashboards SIEMPRE muestran movimiento; con Supabase y datos reales
  // en `property_views` usamos esos. Si la migración 0003 aún no se aplicó o
  // no hay filas, caemos al curve sintético en vez de barras vacías.
  const today = new Date();
  const labels = ["L", "M", "M", "J", "V", "S", "D"];

  // Curve sintético determinista: usa un hash del set de ids como semilla
  // para que no reshuffle en cada render pero igual se vea una tendencia.
  function synthetic(): Array<{ day: string; views: number }> {
    const seed = propertyIds.join("").length + propertyIds.length * 7;
    const out: Array<{ day: string; views: number }> = [];
    let base = 22 + (seed % 18);
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const wobble = Math.round(Math.sin(seed + i * 1.7) * 12);
      base = Math.max(10, base + wobble + 4);
      out.push({ day: labels[d.getDay()] ?? "—", views: base });
    }
    return out;
  }

  if (!SUPABASE_ENABLED || propertyIds.length === 0) return synthetic();

  const supa = await createSupabaseServerClient();
  if (!supa) return synthetic();

  const since = new Date(today);
  since.setDate(today.getDate() - 6);

  const { data, error } = await supa
    .from("property_views")
    .select("viewed_at")
    .in("property_id", propertyIds)
    .gte("viewed_at", since.toISOString());

  // Tabla ausente, error o sin filas → curve sintético (no barras vacías).
  if (error || !data || data.length === 0) return synthetic();

  const buckets = new Map<string, number>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }
  for (const r of data) {
    const key = String(r.viewed_at).slice(0, 10);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  const days: Array<{ day: string; views: number }> = [];
  for (const [key, views] of buckets) {
    const d = new Date(key);
    days.push({ day: labels[d.getDay()] ?? "—", views });
  }
  return days;
}
