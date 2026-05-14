/**
 * Asesor analytics service. Produces deterministic, realistic-looking
 * metrics for the asesor dashboard: per-property exposure, engagement,
 * traffic sources, commissions and algorithm-driven opportunities.
 *
 * When Supabase is configured the underlying tables (`property_views` with
 * `source` column, `contracts`, `notifications`) can fill in the real
 * numbers — for now the demo runs on a seeded engine anchored to each
 * property's id so dashboards never look empty and stay stable between
 * reloads.
 */

import type { Property } from "@/lib/types";

export type TrafficSource =
  | "instagram"
  | "facebook"
  | "whatsapp"
  | "tiktok"
  | "x"
  | "google"
  | "llavero"
  | "direct";

export const SOURCE_ORDER: TrafficSource[] = [
  "instagram",
  "facebook",
  "whatsapp",
  "tiktok",
  "x",
  "google",
  "llavero",
  "direct",
];

export const SOURCE_LABEL: Record<TrafficSource, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  whatsapp: "WhatsApp",
  tiktok: "TikTok",
  x: "X / Twitter",
  google: "Google",
  llavero: "Llavero IA",
  direct: "Tráfico directo",
};

export const SOURCE_TINT: Record<TrafficSource, string> = {
  instagram: "#e1306c",
  facebook: "#1877f2",
  whatsapp: "#25d366",
  tiktok: "#0b1f1c",
  x: "#0b1f1c",
  google: "#f4b400",
  llavero: "#c4513a",
  direct: "#7c8a87",
};

export type PropertyMetrics = {
  property_id: string;
  views: number;
  uniqueViewers: number;
  clicks: number;            // clicks en "Ver" / "Detalle" desde tarjetas o búsqueda
  ctaClicks: number;          // "Agendar" / "Hablar con Llavero" / "Pedir info"
  avgTimeOnPageSec: number;   // segundos promedio
  scrollDepthPct: number;     // % promedio de scroll del detalle
  leads: number;
  conversionViewToLead: number; // pct
  engagementScore: number;    // 0..100 composite
  sources: Record<TrafficSource, number>;
};

export type Commission = {
  id: string;
  property_id: string;
  property_title: string;
  property_type: Property["type"];
  city: string;
  rented_at: string;
  monthly_amount: number;
  contract_months: number;
  commission_rate: number;
  commission_amount: number;
  status: "pagada" | "pendiente";
};

export type Opportunity = {
  id: string;
  kind:
    | "priority_listing"
    | "boost_ad"
    | "respond_lead"
    | "price_adjust"
    | "add_media"
    | "badge_unlocked";
  title: string;
  body: string;
  cta_label: string;
  cta_href: string;
  reward?: string;
  property_id?: string;
};

export type AsesorBadge = {
  id: string;
  label: string;
  description: string;
  unlocked: boolean;
  progress_pct: number; // 0..100
  reward: string;
};

export type AsesorAnalytics = {
  metricsByProperty: Map<string, PropertyMetrics>;
  totalExposure: {
    views: number;
    uniqueViewers: number;
    clicks: number;
    ctaClicks: number;
    leads: number;
    conversionPct: number;
    engagementScoreAvg: number;
  };
  sources: Array<{ source: TrafficSource; visits: number; pct: number }>;
  commissions: {
    items: Commission[];
    totals: {
      paidThisMonth: number;
      pendingThisMonth: number;
      ytd: number;
      lifetime: number;
    };
    byMonth: Array<{ month: string; amount: number }>;
    byType: Array<{ type: Property["type"]; amount: number; rentals: number }>;
    byCity: Array<{ city: string; amount: number; rentals: number }>;
  };
  topPerformers: {
    byEngagement: Array<{ property: Property; metrics: PropertyMetrics }>;
    byType: Array<{ type: Property["type"]; views: number; leads: number; rentedCount: number }>;
    byCity: Array<{ city: string; views: number; leads: number; rentedCount: number }>;
  };
  opportunities: Opportunity[];
  badges: AsesorBadge[];
};

// ---------- deterministic seeding ----------

function hash(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pseudoRandom(seed: number, salt: string): number {
  const x = Math.sin(seed + hash(salt)) * 10000;
  return x - Math.floor(x);
}

function pseudoInt(seed: number, salt: string, min: number, max: number): number {
  const r = pseudoRandom(seed, salt);
  return Math.floor(min + r * (max - min));
}

function seedSources(propertyId: string, total: number): Record<TrafficSource, number> {
  const seed = hash(propertyId);
  const weights: Record<TrafficSource, number> = {
    instagram: 4 + (seed % 4),
    facebook: 3 + ((seed >> 3) % 3),
    whatsapp: 2 + ((seed >> 5) % 3),
    tiktok: 1 + ((seed >> 7) % 3),
    x: 1,
    google: 2 + ((seed >> 9) % 3),
    llavero: 3 + ((seed >> 11) % 4),
    direct: 1 + ((seed >> 13) % 2),
  };
  const wSum = Object.values(weights).reduce((a, b) => a + b, 0);
  const out: Record<TrafficSource, number> = {
    instagram: 0,
    facebook: 0,
    whatsapp: 0,
    tiktok: 0,
    x: 0,
    google: 0,
    llavero: 0,
    direct: 0,
  };
  let assigned = 0;
  for (const k of SOURCE_ORDER) {
    const share = Math.round((weights[k] / wSum) * total);
    out[k] = share;
    assigned += share;
  }
  // adjust rounding so the sources add up to total
  if (assigned !== total) {
    out.direct = Math.max(0, out.direct + (total - assigned));
  }
  return out;
}

function buildMetrics(property: Property, base: number): PropertyMetrics {
  const seed = hash(property.id);
  const views = base;
  const uniqueViewers = Math.round(views * (0.62 + pseudoRandom(seed, "u") * 0.18));
  const clicks = Math.round(views * (0.35 + pseudoRandom(seed, "c") * 0.18));
  const ctaClicks = Math.round(clicks * (0.18 + pseudoRandom(seed, "cta") * 0.18));
  const leads = Math.max(0, Math.round(ctaClicks * (0.35 + pseudoRandom(seed, "l") * 0.25)));
  const conversion = views ? (leads / views) * 100 : 0;
  const avgTimeOnPageSec = pseudoInt(seed, "t", 45, 220);
  const scrollDepthPct = pseudoInt(seed, "s", 55, 95);
  const engagementScore = Math.min(
    100,
    Math.round(
      0.25 * Math.min(100, (views / 100) * 100) +
        0.25 * Math.min(100, scrollDepthPct) +
        0.20 * Math.min(100, (avgTimeOnPageSec / 180) * 100) +
        0.30 * Math.min(100, conversion * 8)
    )
  );
  const sources = seedSources(property.id, views);

  return {
    property_id: property.id,
    views,
    uniqueViewers,
    clicks,
    ctaClicks,
    avgTimeOnPageSec,
    scrollDepthPct,
    leads,
    conversionViewToLead: Math.round(conversion * 10) / 10,
    engagementScore,
    sources,
  };
}

// ---------- main entrypoint ----------

export function buildAsesorAnalytics(args: {
  asesorId: string;
  properties: Property[];
  viewCounts: Map<string, number>;
  leadCount: number;
  monthsPaid?: number;
}): AsesorAnalytics {
  const { properties, viewCounts, leadCount, monthsPaid = 8 } = args;

  // 1) metrics per property
  const metricsByProperty = new Map<string, PropertyMetrics>();
  let totalViews = 0;
  let totalUnique = 0;
  let totalClicks = 0;
  let totalCtaClicks = 0;
  let totalLeads = 0;
  let engagementSum = 0;
  for (const p of properties) {
    const baseViews = viewCounts.get(p.id) ?? 0;
    const m = buildMetrics(p, baseViews);
    metricsByProperty.set(p.id, m);
    totalViews += m.views;
    totalUnique += m.uniqueViewers;
    totalClicks += m.clicks;
    totalCtaClicks += m.ctaClicks;
    totalLeads += m.leads;
    engagementSum += m.engagementScore;
  }
  // scale total leads with actual lead count from DB if reasonable
  if (leadCount > totalLeads) totalLeads = leadCount;

  const totalExposure = {
    views: totalViews,
    uniqueViewers: totalUnique,
    clicks: totalClicks,
    ctaClicks: totalCtaClicks,
    leads: totalLeads,
    conversionPct: totalViews ? Math.round((totalLeads / totalViews) * 1000) / 10 : 0,
    engagementScoreAvg: properties.length ? Math.round(engagementSum / properties.length) : 0,
  };

  // 2) sources aggregate
  const sourcesAgg: Record<TrafficSource, number> = {
    instagram: 0,
    facebook: 0,
    whatsapp: 0,
    tiktok: 0,
    x: 0,
    google: 0,
    llavero: 0,
    direct: 0,
  };
  for (const m of metricsByProperty.values()) {
    for (const k of SOURCE_ORDER) sourcesAgg[k] += m.sources[k];
  }
  const sources = SOURCE_ORDER.map((source) => ({
    source,
    visits: sourcesAgg[source],
    pct: totalViews ? Math.round((sourcesAgg[source] / totalViews) * 1000) / 10 : 0,
  })).sort((a, b) => b.visits - a.visits);

  // 3) commissions: pick the top 4 properties as "alquilados", build a history
  const sortedByPrice = [...properties].sort((a, b) => b.price_usd - a.price_usd);
  const rented = sortedByPrice.slice(0, Math.min(4, properties.length));
  const items: Commission[] = rented.map((p, i) => {
    const monthsAgo = (i + 1) * 1.4;
    const rentedAt = new Date();
    rentedAt.setMonth(rentedAt.getMonth() - Math.floor(monthsAgo));
    const rate = 0.10; // 10% del alquiler mensual
    const commission = Math.round(p.price_usd * rate);
    return {
      id: `comm-${p.id.slice(0, 8)}`,
      property_id: p.id,
      property_title: p.title.replace(/^Llave:\s*/, ""),
      property_type: p.type,
      city: p.city,
      rented_at: rentedAt.toISOString(),
      monthly_amount: p.price_usd,
      contract_months: 12,
      commission_rate: rate,
      commission_amount: commission,
      status: i < 2 ? "pagada" : "pendiente",
    };
  });

  const now = new Date();
  const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  const thisMonth = monthKey(now);
  const paidThisMonth = items
    .filter((c) => c.status === "pagada" && monthKey(new Date(c.rented_at)) === thisMonth)
    .reduce((a, c) => a + c.commission_amount, 0)
    || items.filter((c) => c.status === "pagada").reduce((a, c) => a + c.commission_amount, 0);
  const pendingThisMonth = items
    .filter((c) => c.status === "pendiente")
    .reduce((a, c) => a + c.commission_amount, 0);
  const ytd = items.reduce((a, c) => a + c.commission_amount, 0) * (monthsPaid / 12) + paidThisMonth;
  const lifetime = ytd + items.reduce((a, c) => a + c.commission_amount, 0) * 0.6;

  const byMonth: Array<{ month: string; amount: number }> = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(now.getMonth() - i);
    const base = items.reduce((a, c) => a + c.commission_amount, 0) / 4;
    const variance = pseudoRandom(hash("month" + i), "m") * 60;
    byMonth.push({
      month: d.toLocaleDateString("es-VE", { month: "short" }),
      amount: Math.round(base + variance),
    });
  }

  const byTypeMap = new Map<Property["type"], { amount: number; rentals: number }>();
  for (const c of items) {
    const cur = byTypeMap.get(c.property_type) ?? { amount: 0, rentals: 0 };
    cur.amount += c.commission_amount;
    cur.rentals += 1;
    byTypeMap.set(c.property_type, cur);
  }
  const byType = Array.from(byTypeMap.entries())
    .map(([type, v]) => ({ type, ...v }))
    .sort((a, b) => b.amount - a.amount);

  const byCityMap = new Map<string, { amount: number; rentals: number }>();
  for (const c of items) {
    const cur = byCityMap.get(c.city) ?? { amount: 0, rentals: 0 };
    cur.amount += c.commission_amount;
    cur.rentals += 1;
    byCityMap.set(c.city, cur);
  }
  const byCity = Array.from(byCityMap.entries())
    .map(([city, v]) => ({ city, ...v }))
    .sort((a, b) => b.amount - a.amount);

  // 4) top performers
  const propIndex = new Map(properties.map((p) => [p.id, p]));
  const byEngagement = [...metricsByProperty.values()]
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .slice(0, 5)
    .map((m) => ({ property: propIndex.get(m.property_id)!, metrics: m }))
    .filter((r) => r.property);

  const typeAgg = new Map<Property["type"], { views: number; leads: number; rentedCount: number }>();
  for (const p of properties) {
    const m = metricsByProperty.get(p.id);
    const cur = typeAgg.get(p.type) ?? { views: 0, leads: 0, rentedCount: 0 };
    cur.views += m?.views ?? 0;
    cur.leads += m?.leads ?? 0;
    if (items.find((c) => c.property_id === p.id)) cur.rentedCount += 1;
    typeAgg.set(p.type, cur);
  }
  const topByType = Array.from(typeAgg.entries())
    .map(([type, v]) => ({ type, ...v }))
    .sort((a, b) => b.views - a.views);

  const cityAgg = new Map<string, { views: number; leads: number; rentedCount: number }>();
  for (const p of properties) {
    const m = metricsByProperty.get(p.id);
    const cur = cityAgg.get(p.city) ?? { views: 0, leads: 0, rentedCount: 0 };
    cur.views += m?.views ?? 0;
    cur.leads += m?.leads ?? 0;
    if (items.find((c) => c.property_id === p.id)) cur.rentedCount += 1;
    cityAgg.set(p.city, cur);
  }
  const topByCity = Array.from(cityAgg.entries())
    .map(([city, v]) => ({ city, ...v }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  // 5) opportunities — el algoritmo Llave que recomienda al asesor
  const opportunities: Opportunity[] = [];

  // a) lead nuevo sin responder
  if (totalLeads > 0) {
    opportunities.push({
      id: "op-respond",
      kind: "respond_lead",
      title: "Tienes 2 leads sin responder de hace más de 4 horas",
      body: "El algoritmo Llave premia respuestas en <1h con prioridad en el ranking. Cada hora que pasa baja la conversión 8%.",
      cta_label: "Ir a leads",
      cta_href: "/asesor/leads",
      reward: "+12% conversión + boost en ranking",
    });
  }

  // b) inmueble con alto engagement pero sin leads → bajar precio o ajustar copy
  const stale = [...metricsByProperty.values()]
    .filter((m) => m.engagementScore > 65 && m.leads === 0)
    .sort((a, b) => b.engagementScore - a.engagementScore)[0];
  if (stale) {
    const sp = propIndex.get(stale.property_id);
    if (sp) {
      opportunities.push({
        id: "op-price",
        kind: "price_adjust",
        title: `Tu ${sp.type} en ${sp.city} tiene engagement alto pero nadie agenda`,
        body: `Engagement ${stale.engagementScore}/100, ${stale.views} vistas, 0 leads. Llavero sugiere bajar 7% el precio (de ${formatPriceShort(sp.price_usd)} a ${formatPriceShort(sp.price_usd * 0.93)}) para destrabar.`,
        cta_label: "Ajustar precio",
        cta_href: `/inmueble/${sp.id}`,
        reward: "+30% leads proyectados",
        property_id: sp.id,
      });
    }
  }

  // c) inmueble más visto → recomendar boost de Meta Ads
  const champion = byEngagement[0];
  if (champion) {
    opportunities.push({
      id: "op-boost",
      kind: "boost_ad",
      title: `Boostea "${champion.property.title.replace(/^Llave:\s*/, "")}" en Meta Ads`,
      body: `Es tu inmueble #1 en engagement (${champion.metrics.engagementScore}/100). Una campaña de $20 puede triplicar leads esta semana.`,
      cta_label: "Crear campaña",
      cta_href: "/asesor",
      reward: "Llave paga el 50% del primer Ad",
      property_id: champion.property.id,
    });
  }

  // d) propiedad sin tour 3D
  const noTour = properties.find((p) => !p.splat_url && !p.tour_3d_url);
  if (noTour) {
    opportunities.push({
      id: "op-media",
      kind: "add_media",
      title: `Agrega tour 3D a "${noTour.title.replace(/^Llave:\s*/, "")}"`,
      body: "Los inmuebles con tour 3D promedian 2.4x más leads. Si tienes iPhone Pro escanea con Polycam y súbelo en captación.",
      cta_label: "Ver workflow",
      cta_href: "/asesor/captacion",
      reward: "+140% leads promedio",
      property_id: noTour.id,
    });
  }

  // e) priority listing porque vas bien
  if (totalExposure.engagementScoreAvg >= 60) {
    opportunities.push({
      id: "op-priority",
      kind: "priority_listing",
      title: "Llave activó priority listing en 3 de tus inmuebles",
      body: `Tu engagement promedio (${totalExposure.engagementScoreAvg}/100) te ubica en el top 15% de asesores. Llave los muestra primero en /buscar durante 7 días.`,
      cta_label: "Ver inmuebles boost",
      cta_href: "/asesor",
      reward: "Exposición premium gratis",
    });
  }

  // 6) badges — gamification para premiar al asesor
  const rentedCount = items.length;
  const earnedYtd = ytd;
  const badges: AsesorBadge[] = [
    {
      id: "badge-respondedor",
      label: "Respondedor relámpago",
      description: "Responde el 80% de tus leads en <1h durante 7 días seguidos.",
      unlocked: true,
      progress_pct: 100,
      reward: "Prioridad en ranking",
    },
    {
      id: "badge-cerrador",
      label: "Cerrador del mes",
      description: "5 contratos firmados en el mes.",
      unlocked: rentedCount >= 5,
      progress_pct: Math.min(100, (rentedCount / 5) * 100),
      reward: "+5% comisión adicional",
    },
    {
      id: "badge-platinum",
      label: "Asesor Platinum",
      description: "Acumula $5,000 en comisiones YTD.",
      unlocked: earnedYtd >= 5000,
      progress_pct: Math.min(100, (earnedYtd / 5000) * 100),
      reward: "Acceso a inmuebles premium + dashboard avanzado",
    },
    {
      id: "badge-tour",
      label: "Embajador 3D",
      description: "10 inmuebles publicados con tour 3D.",
      unlocked: false,
      progress_pct: 30,
      reward: "Llave cubre el procesado de tus splats",
    },
  ];

  return {
    metricsByProperty,
    totalExposure,
    sources,
    commissions: {
      items,
      totals: {
        paidThisMonth: Math.round(paidThisMonth),
        pendingThisMonth: Math.round(pendingThisMonth),
        ytd: Math.round(ytd),
        lifetime: Math.round(lifetime),
      },
      byMonth,
      byType,
      byCity,
    },
    topPerformers: {
      byEngagement,
      byType: topByType,
      byCity: topByCity,
    },
    opportunities,
    badges,
  };
}

function formatPriceShort(n: number): string {
  return `$${Math.round(n)}`;
}
