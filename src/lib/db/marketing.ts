/**
 * Datos seed para /asesor/marketing.
 *
 * Devuelve campañas activas, posts recientes y recomendaciones del algoritmo
 * Llavero. Cuando integremos Meta Ads / TikTok Business / WhatsApp Business,
 * estos getters consultarán esos providers; por ahora son deterministas para
 * que el dashboard quede sólido en demo.
 */

import { DEMO_PROPERTIES } from "./seed-data";
import type { TrafficSource } from "./asesor-analytics";

export type CampaignStatus = "activa" | "pausada";

export type AdCampaign = {
  id: string;
  name: string;
  platform: Extract<TrafficSource, "instagram" | "facebook" | "tiktok" | "whatsapp" | "google">;
  spend: number;
  clicks: number;
  leads: number;
  cpl: number; // cost per lead
  status: CampaignStatus;
  property_id: string;
  property_title: string;
};

export type SocialPost = {
  id: string;
  platform: Extract<TrafficSource, "instagram" | "facebook" | "tiktok" | "whatsapp" | "x">;
  copy: string;
  likes: number;
  comments: number;
  property_id: string;
  property_title: string;
  posted_at: string;
};

export type MarketingSuggestion = {
  id: string;
  title: string;
  body: string;
  cta_label: string;
  reward: string;
};

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export function listCampaigns(): AdCampaign[] {
  const items: AdCampaign[] = [
    {
      id: "camp-001",
      name: "Penthouse Altamira · Meta Carousel",
      platform: "instagram",
      spend: 120,
      clicks: 412,
      leads: 18,
      cpl: 6.7,
      status: "activa",
      property_id: DEMO_PROPERTIES[6].id,
      property_title: DEMO_PROPERTIES[6].title.replace(/^Llave:\s*/, ""),
    },
    {
      id: "camp-002",
      name: "Casa El Hatillo · Facebook Reels",
      platform: "facebook",
      spend: 85,
      clicks: 287,
      leads: 11,
      cpl: 7.7,
      status: "activa",
      property_id: DEMO_PROPERTIES[1].id,
      property_title: DEMO_PROPERTIES[1].title.replace(/^Llave:\s*/, ""),
    },
    {
      id: "camp-003",
      name: "Estudio Chacao · TikTok Spark",
      platform: "tiktok",
      spend: 45,
      clicks: 198,
      leads: 7,
      cpl: 6.4,
      status: "activa",
      property_id: DEMO_PROPERTIES[2].id,
      property_title: DEMO_PROPERTIES[2].title.replace(/^Llave:\s*/, ""),
    },
    {
      id: "camp-004",
      name: "Casa Lechería · Google Search",
      platform: "google",
      spend: 60,
      clicks: 142,
      leads: 5,
      cpl: 12.0,
      status: "pausada",
      property_id: DEMO_PROPERTIES[8].id,
      property_title: DEMO_PROPERTIES[8].title.replace(/^Llave:\s*/, ""),
    },
    {
      id: "camp-005",
      name: "Apto Las Mercedes · WhatsApp Broadcast",
      platform: "whatsapp",
      spend: 0,
      clicks: 89,
      leads: 9,
      cpl: 0,
      status: "activa",
      property_id: DEMO_PROPERTIES[0].id,
      property_title: DEMO_PROPERTIES[0].title.replace(/^Llave:\s*/, ""),
    },
  ];
  return items;
}

export function listPosts(): SocialPost[] {
  return [
    {
      id: "post-001",
      platform: "instagram",
      copy: "Imaginate desayunar viendo el Ávila desde tu terraza. Penthouse en Altamira disponible.",
      likes: 412,
      comments: 38,
      property_id: DEMO_PROPERTIES[6].id,
      property_title: DEMO_PROPERTIES[6].title.replace(/^Llave:\s*/, ""),
      posted_at: daysAgo(1),
    },
    {
      id: "post-002",
      platform: "tiktok",
      copy: "POV: encontraste tu estudio en Chacao y está amoblado. Llave lo gestiona.",
      likes: 1832,
      comments: 124,
      property_id: DEMO_PROPERTIES[2].id,
      property_title: DEMO_PROPERTIES[2].title.replace(/^Llave:\s*/, ""),
      posted_at: daysAgo(2),
    },
    {
      id: "post-003",
      platform: "facebook",
      copy: "Casa en El Hatillo con jardín y zona BBQ. Para familias que buscan urbanización cerrada.",
      likes: 287,
      comments: 22,
      property_id: DEMO_PROPERTIES[1].id,
      property_title: DEMO_PROPERTIES[1].title.replace(/^Llave:\s*/, ""),
      posted_at: daysAgo(3),
    },
    {
      id: "post-004",
      platform: "x",
      copy: "Local en Sabana Grande disponible. Alto tránsito peatonal, ideal café o tienda.",
      likes: 88,
      comments: 6,
      property_id: DEMO_PROPERTIES[5].id,
      property_title: DEMO_PROPERTIES[5].title.replace(/^Llave:\s*/, ""),
      posted_at: daysAgo(4),
    },
    {
      id: "post-005",
      platform: "instagram",
      copy: "Casa de playa en Lechería · 3 cuadras del mar, piscina propia. Reserva ya.",
      likes: 524,
      comments: 47,
      property_id: DEMO_PROPERTIES[8].id,
      property_title: DEMO_PROPERTIES[8].title.replace(/^Llave:\s*/, ""),
      posted_at: daysAgo(5),
    },
  ];
}

export function listSuggestions(): MarketingSuggestion[] {
  return [
    {
      id: "sug-001",
      title: "Boostea el apto de Las Mercedes en Instagram",
      body: "Tu publicación orgánica tuvo 412 likes. Una pauta de $25 podría triplicar leads esta semana.",
      cta_label: "Crear campaña",
      reward: "Llave cubre el 50% del primer ad",
    },
    {
      id: "sug-002",
      title: "Reactiva la campaña de Google Search",
      body: "La campaña de Casa Lechería está pausada con CPL alto ($12). Llavero sugiere ajustar keywords a 'casa playa Lechería alquiler' antes de reactivar.",
      cta_label: "Revisar keywords",
      reward: "-40% CPL proyectado",
    },
    {
      id: "sug-003",
      title: "Lanza Reel de la casa colonial en Valencia",
      body: "El inmueble tiene engagement alto en orgánico pero no aparece en redes. Genera un Reel con Llavero en 1 click.",
      cta_label: "Generar Reel",
      reward: "+2.4x leads esperados",
    },
  ];
}
