import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SUPABASE_ENABLED } from "@/lib/supabase/env";
import type { Property, PropertySummary } from "@/lib/types";
import { DEMO_LEADS, DEMO_OWNER, DEMO_PROPERTIES } from "./seed-data";

export type SearchFilters = {
  query?: string;
  city?: string;
  state?: string;
  type?: Property["type"];
  price_min?: number;
  price_max?: number;
  rooms_min?: number;
  bathrooms_min?: number;
  amenities?: string[];
  limit?: number;
};

const PROPERTY_SUMMARY_COLS =
  "id,title,type,city,state,price_usd,rooms,bathrooms,area_m2,amenities,cover_url,no_months_upfront,deposit_months";

function summarize(p: Property): PropertySummary {
  return {
    id: p.id,
    title: p.title,
    type: p.type,
    city: p.city,
    state: p.state,
    price_usd: p.price_usd,
    rooms: p.rooms,
    bathrooms: p.bathrooms,
    area_m2: p.area_m2,
    amenities: p.amenities,
    cover_url: p.cover_url,
    no_months_upfront: p.no_months_upfront,
    deposit_months: p.deposit_months,
  };
}

function filterDemo(filters: SearchFilters): Property[] {
  const q = filters.query?.toLowerCase().trim();
  let list = [...DEMO_PROPERTIES].filter((p) => p.status === "disponible");
  if (filters.city) list = list.filter((p) => p.city.toLowerCase().includes(filters.city!.toLowerCase()));
  if (filters.state) list = list.filter((p) => p.state.toLowerCase().includes(filters.state!.toLowerCase()));
  if (filters.type) list = list.filter((p) => p.type === filters.type);
  if (filters.price_min !== undefined) list = list.filter((p) => p.price_usd >= filters.price_min!);
  if (filters.price_max !== undefined) list = list.filter((p) => p.price_usd <= filters.price_max!);
  if (filters.rooms_min !== undefined) list = list.filter((p) => p.rooms >= filters.rooms_min!);
  if (filters.bathrooms_min !== undefined) list = list.filter((p) => p.bathrooms >= filters.bathrooms_min!);
  if (filters.amenities?.length) {
    const set = filters.amenities.map((a) => a.toLowerCase());
    list = list.filter((p) =>
      set.every((needle) => p.amenities.some((a) => a.toLowerCase().includes(needle)))
    );
  }
  if (q) {
    list = list.filter((p) => {
      const hay = `${p.title} ${p.description} ${p.city} ${p.state} ${p.amenities.join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }
  if (filters.limit) list = list.slice(0, filters.limit);
  return list;
}

export async function searchProperties(filters: SearchFilters): Promise<PropertySummary[]> {
  const supa = await createSupabaseServerClient();
  if (!supa || !SUPABASE_ENABLED) {
    return filterDemo(filters).map(summarize);
  }
  let q = supa.from("properties").select(PROPERTY_SUMMARY_COLS).eq("status", "disponible");
  if (filters.city) q = q.ilike("city", `%${filters.city}%`);
  if (filters.state) q = q.ilike("state", `%${filters.state}%`);
  if (filters.type) q = q.eq("type", filters.type);
  if (filters.price_min !== undefined) q = q.gte("price_usd", filters.price_min);
  if (filters.price_max !== undefined) q = q.lte("price_usd", filters.price_max);
  if (filters.rooms_min !== undefined) q = q.gte("rooms", filters.rooms_min);
  if (filters.bathrooms_min !== undefined) q = q.gte("bathrooms", filters.bathrooms_min);
  if (filters.amenities?.length) q = q.contains("amenities", filters.amenities);
  if (filters.query) q = q.textSearch("search_tsv", filters.query, { config: "spanish" });
  q = q.order("created_at", { ascending: false }).limit(filters.limit ?? 50);
  const { data, error } = await q;
  if (error || !data) return filterDemo(filters).map(summarize);
  return data as unknown as PropertySummary[];
}

export async function getPropertyById(id: string): Promise<Property | null> {
  const supa = await createSupabaseServerClient();
  if (!supa || !SUPABASE_ENABLED) {
    return DEMO_PROPERTIES.find((p) => p.id === id) ?? null;
  }
  const { data, error } = await supa.from("properties").select("*").eq("id", id).maybeSingle();
  if (error || !data) return DEMO_PROPERTIES.find((p) => p.id === id) ?? null;
  return data as Property;
}

export async function listAllProperties(): Promise<Property[]> {
  const supa = await createSupabaseServerClient();
  if (!supa || !SUPABASE_ENABLED) return [...DEMO_PROPERTIES];
  const { data } = await supa.from("properties").select("*").order("created_at", { ascending: false });
  return (data as Property[]) ?? [...DEMO_PROPERTIES];
}

export async function getOwnerProfile() {
  return DEMO_OWNER;
}

export async function listLeadsForOwner() {
  const supa = await createSupabaseServerClient();
  if (!supa || !SUPABASE_ENABLED) {
    return DEMO_LEADS.map((l) => ({
      ...l,
      property: DEMO_PROPERTIES.find((p) => p.id === l.property_id) ?? null,
    }));
  }
  const { data } = await supa
    .from("leads")
    .select("*, property:properties(*)")
    .order("created_at", { ascending: false })
    .limit(50);
  return data ?? [];
}

export async function createLead(args: {
  property_id: string;
  inquilino_name?: string;
  inquilino_phone?: string;
  inquilino_email?: string;
  preferred_visit_at?: string;
  notes?: string;
  agent_summary?: string;
  source?: "chat" | "directo" | "asesor";
}) {
  const supa = await createSupabaseServerClient();
  if (!supa || !SUPABASE_ENABLED) {
    const lead = {
      id: crypto.randomUUID(),
      property_id: args.property_id,
      inquilino_name: args.inquilino_name ?? null,
      inquilino_phone: args.inquilino_phone ?? null,
      inquilino_email: args.inquilino_email ?? null,
      status: "agendado" as const,
      source: args.source ?? "chat",
      preferred_visit_at: args.preferred_visit_at ?? null,
      notes: args.notes ?? null,
      agent_summary: args.agent_summary ?? null,
      created_at: new Date().toISOString(),
    };
    DEMO_LEADS.unshift(lead);
    return lead;
  }
  const { data, error } = await supa
    .from("leads")
    .insert({
      property_id: args.property_id,
      inquilino_name: args.inquilino_name,
      inquilino_phone: args.inquilino_phone,
      inquilino_email: args.inquilino_email,
      preferred_visit_at: args.preferred_visit_at,
      notes: args.notes,
      agent_summary: args.agent_summary,
      source: args.source ?? "chat",
      status: "agendado",
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function insertProperty(p: Partial<Property> & { owner_id: string; title: string; description: string; city: string; type: Property["type"]; price_usd: number }) {
  const supa = await createSupabaseServerClient();
  if (!supa || !SUPABASE_ENABLED) {
    const created: Property = {
      id: crypto.randomUUID(),
      owner_id: p.owner_id,
      title: p.title,
      description: p.description,
      type: p.type,
      status: "disponible",
      address: p.address ?? "",
      city: p.city,
      state: p.state ?? "",
      country: "Venezuela",
      lat: p.lat ?? null,
      lng: p.lng ?? null,
      price_usd: p.price_usd,
      no_months_upfront: true,
      deposit_months: p.deposit_months ?? 1,
      rooms: p.rooms ?? 0,
      bathrooms: p.bathrooms ?? 0,
      area_m2: p.area_m2 ?? null,
      parking_spots: p.parking_spots ?? 0,
      amenities: p.amenities ?? [],
      rules: p.rules ?? [],
      cover_url: p.cover_url ?? null,
      gallery_urls: p.gallery_urls ?? [],
      spline_scene_url: null,
      tour_3d_url: null,
      splat_url: null,
      created_at: new Date().toISOString(),
    };
    DEMO_PROPERTIES.unshift(created);
    return created;
  }
  const { data, error } = await supa.from("properties").insert(p).select().single();
  if (error) throw error;
  return data as Property;
}

export async function getStatsForOwner() {
  const props = await listAllProperties();
  const leads = await listLeadsForOwner();
  const active = props.filter((p) => p.status === "disponible").length;
  const total = props.length;
  const totalLeads = leads.length;
  const agendados = leads.filter((l: { status: string }) => l.status === "agendado" || l.status === "firmado").length;
  const conversion = totalLeads ? Math.round((agendados / totalLeads) * 100) : 0;
  const projectedIncome = props
    .filter((p) => p.status === "alquilado")
    .reduce((acc, p) => acc + p.price_usd, 0);
  const portfolio = props.reduce((acc, p) => acc + p.price_usd, 0);
  return { active, total, totalLeads, agendados, conversion, projectedIncome, portfolio };
}
