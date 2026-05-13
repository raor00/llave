export type PropertyType =
  | "apartamento"
  | "casa"
  | "local"
  | "edificio"
  | "habitacion";

export type PropertyStatus =
  | "disponible"
  | "reservado"
  | "alquilado"
  | "pausado";

export type LeadStatus =
  | "nuevo"
  | "contactado"
  | "agendado"
  | "descartado"
  | "firmado";

export type Property = {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  type: PropertyType;
  status: PropertyStatus;
  address: string;
  city: string;
  state: string;
  country: string;
  lat: number | null;
  lng: number | null;
  price_usd: number;
  no_months_upfront: boolean;
  deposit_months: number;
  rooms: number;
  bathrooms: number;
  area_m2: number | null;
  parking_spots: number;
  amenities: string[];
  rules: string[];
  cover_url: string | null;
  gallery_urls: string[];
  spline_scene_url: string | null;
  tour_3d_url: string | null;
  created_at: string;
};

export type PropertySummary = Pick<
  Property,
  | "id"
  | "title"
  | "type"
  | "city"
  | "state"
  | "price_usd"
  | "rooms"
  | "bathrooms"
  | "area_m2"
  | "amenities"
  | "cover_url"
  | "no_months_upfront"
  | "deposit_months"
>;

export type Lead = {
  id: string;
  property_id: string;
  inquilino_id: string | null;
  inquilino_name: string | null;
  inquilino_phone: string | null;
  inquilino_email: string | null;
  status: LeadStatus;
  source: "chat" | "directo" | "asesor";
  preferred_visit_at: string | null;
  notes: string | null;
  agent_summary: string | null;
  created_at: string;
};

export type Profile = {
  id: string;
  role: "inquilino" | "asesor" | "propietario" | "admin";
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  rating_avg: number;
  rating_count: number;
  trust_score: number;
};
