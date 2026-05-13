import { tool } from "ai";
import { z } from "zod";
import {
  createLead,
  getPropertyById,
  insertProperty,
  searchProperties,
} from "@/lib/db/queries";
import { DEMO_OWNER } from "@/lib/db/seed-data";
import type { PropertySummary } from "@/lib/types";

const propertyType = z.enum([
  "apartamento",
  "casa",
  "local",
  "edificio",
  "habitacion",
]);

// ------------------------------------------------------------------
// searchProperties — main inquilino-facing search
// ------------------------------------------------------------------
const searchPropertiesTool = tool({
  description:
    "Busca inmuebles disponibles en la base real de Llave. Usalo siempre que el usuario describa lo que quiere alquilar (ciudad, presupuesto, tipo, ambientes, etc). Devuelve un array de PropertySummary que el frontend renderiza como cards.",
  inputSchema: z.object({
    query: z.string().optional().describe("Texto libre, ej: 'cerca metro luminoso'"),
    city: z.string().optional().describe("Ciudad o zona"),
    state: z.string().optional().describe("Estado venezolano"),
    type: propertyType.optional(),
    price_min: z.number().optional(),
    price_max: z.number().optional(),
    rooms_min: z.number().int().optional(),
    bathrooms_min: z.number().int().optional(),
    amenities: z.array(z.string()).optional().describe("Lista de amenities deseados (ej: piscina, planta electrica)"),
    limit: z.number().int().min(1).max(12).optional().default(6),
  }),
  execute: async (args) => {
    const results = await searchProperties(args);
    return {
      count: results.length,
      properties: results,
    };
  },
});

// ------------------------------------------------------------------
// getPropertyDetail — full details of one property
// ------------------------------------------------------------------
const getPropertyDetailTool = tool({
  description:
    "Trae toda la información detallada de un inmueble específico por id. Usalo cuando el usuario pregunta por uno en particular o quiere más detalles.",
  inputSchema: z.object({
    property_id: z.string().describe("UUID del inmueble"),
  }),
  execute: async ({ property_id }) => {
    const p = await getPropertyById(property_id);
    if (!p) return { found: false };
    return { found: true, property: p };
  },
});

// ------------------------------------------------------------------
// recommendByProfile — contextual recommendation
// ------------------------------------------------------------------
const recommendByProfileTool = tool({
  description:
    "Recomienda inmuebles basados en el perfil completo del usuario: presupuesto, estilo de vida, ciudad y necesidades. Más inteligente que una búsqueda simple — pondera amenities y prioridades.",
  inputSchema: z.object({
    budget_usd: z.number().describe("Presupuesto mensual aproximado en USD"),
    city: z.string().describe("Ciudad o zona donde quiere vivir"),
    lifestyle: z
      .string()
      .describe(
        "Descripción del lifestyle, ej: 'profesional joven, trabajo en Chacao, gym, sin mascotas'"
      ),
    needs: z.array(z.string()).optional().describe("Lista de necesidades (ej: planta electrica, cerca metro, amoblado)"),
    rooms_min: z.number().int().optional(),
  }),
  execute: async (args) => {
    const tolerance = 0.2;
    const results = await searchProperties({
      city: args.city,
      price_max: Math.round(args.budget_usd * (1 + tolerance)),
      price_min: Math.round(args.budget_usd * (1 - tolerance * 2)),
      rooms_min: args.rooms_min,
      amenities: args.needs,
      limit: 8,
    });

    const ranked = results
      .map((p) => {
        let score = 0;
        const reasons: string[] = [];
        const diff = Math.abs(p.price_usd - args.budget_usd);
        const priceFit = 1 - diff / args.budget_usd;
        score += priceFit * 40;
        if (p.price_usd <= args.budget_usd) reasons.push(`encaja en tu presupuesto ($${p.price_usd}/mes)`);
        if (args.needs) {
          for (const need of args.needs) {
            if (p.amenities.some((a) => a.toLowerCase().includes(need.toLowerCase()))) {
              score += 10;
              reasons.push(`tiene ${need}`);
            }
          }
        }
        if (p.no_months_upfront) reasons.push("sin meses adelantados");
        return { property: p, score, reasons };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return { count: ranked.length, recommendations: ranked };
  },
});

// ------------------------------------------------------------------
// compareProperties — side-by-side comparison
// ------------------------------------------------------------------
const comparePropertiesTool = tool({
  description:
    "Compara 2-4 inmuebles lado a lado. Devolvé el resultado para que el frontend muestre una tabla comparativa.",
  inputSchema: z.object({
    property_ids: z.array(z.string()).min(2).max(4),
  }),
  execute: async ({ property_ids }) => {
    const all = await Promise.all(property_ids.map((id) => getPropertyById(id)));
    const found = all.filter((p): p is NonNullable<typeof p> => p !== null);
    const summaries: PropertySummary[] = found.map((p) => ({
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
    }));
    const cheapest = found.reduce((a, b) => (a.price_usd < b.price_usd ? a : b));
    const largest = found.reduce((a, b) => ((a.area_m2 ?? 0) > (b.area_m2 ?? 0) ? a : b));
    return {
      count: found.length,
      properties: summaries,
      insights: {
        cheapest_id: cheapest.id,
        largest_id: largest.id,
      },
    };
  },
});

// ------------------------------------------------------------------
// scheduleVisit — book a visit (creates a lead)
// ------------------------------------------------------------------
const scheduleVisitTool = tool({
  description:
    "Agenda una visita para un inmueble. Crea un lead en estado agendado. Pedí siempre nombre y un canal de contacto (teléfono o email) antes de llamar a esta tool.",
  inputSchema: z.object({
    property_id: z.string(),
    inquilino_name: z.string().describe("Nombre del inquilino"),
    inquilino_phone: z.string().optional(),
    inquilino_email: z.string().email().optional(),
    preferred_visit_at: z
      .string()
      .optional()
      .describe("ISO 8601 fecha+hora preferida, ej: 2026-05-15T15:00:00-04:00"),
    notes: z.string().optional(),
  }),
  execute: async (args) => {
    if (!args.inquilino_phone && !args.inquilino_email) {
      return {
        ok: false,
        error: "Necesitamos al menos un teléfono o email para agendar la visita.",
      };
    }
    const lead = await createLead({
      ...args,
      agent_summary: `Visita agendada por Llavero. ${args.notes ?? ""}`.trim(),
      source: "chat",
    });
    return { ok: true, lead };
  },
});

// ------------------------------------------------------------------
// createPropertyDraft — asesor-only, asisted publishing
// ------------------------------------------------------------------
const createPropertyDraftTool = tool({
  description:
    "Para asesores: genera y publica un borrador de inmueble a partir de datos sueltos. Llavero redacta título y descripción atractivos. El asesor puede editar luego.",
  inputSchema: z.object({
    raw_notes: z.string().describe("Notas sueltas del asesor sobre el inmueble"),
    type: propertyType,
    city: z.string(),
    state: z.string(),
    address: z.string(),
    price_usd: z.number(),
    rooms: z.number().int(),
    bathrooms: z.number().int(),
    area_m2: z.number().int().optional(),
    amenities: z.array(z.string()).optional(),
    cover_url: z.string().url().optional(),
  }),
  execute: async (args) => {
    const title = `Llave: ${args.type === "casa" ? "Casa" : args.type === "local" ? "Local" : args.type === "habitacion" ? "Habitación" : args.type === "edificio" ? "Edificio" : "Apartamento"} en ${args.city}`;
    const description = [
      args.raw_notes,
      `${args.rooms} ${args.rooms === 1 ? "habitación" : "habitaciones"}, ${args.bathrooms} ${args.bathrooms === 1 ? "baño" : "baños"}${args.area_m2 ? `, ${args.area_m2}m²` : ""}.`,
      args.amenities?.length
        ? `Incluye: ${args.amenities.join(", ")}.`
        : "",
      "Publicado bajo el modelo Llave: sin meses adelantados, depósito reducido y reembolsable.",
    ]
      .filter(Boolean)
      .join(" ");

    const property = await insertProperty({
      owner_id: DEMO_OWNER.id,
      title,
      description,
      type: args.type,
      address: args.address,
      city: args.city,
      state: args.state,
      price_usd: args.price_usd,
      rooms: args.rooms,
      bathrooms: args.bathrooms,
      area_m2: args.area_m2,
      amenities: args.amenities ?? [],
      cover_url:
        args.cover_url ??
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200",
    });
    return { ok: true, property };
  },
});

// ------------------------------------------------------------------
// suggestPrice — comparable-based price suggestion for asesores
// ------------------------------------------------------------------
const suggestPriceTool = tool({
  description:
    "Para asesores: sugiere un rango de precio basado en comparables de la misma ciudad y tipo en la base de Llave.",
  inputSchema: z.object({
    city: z.string(),
    type: propertyType,
    rooms: z.number().int().optional(),
    area_m2: z.number().int().optional(),
  }),
  execute: async (args) => {
    const comps = await searchProperties({
      city: args.city,
      type: args.type,
      rooms_min: args.rooms ? Math.max(0, args.rooms - 1) : undefined,
      limit: 10,
    });
    if (comps.length === 0) {
      return {
        ok: false,
        message: "No hay comparables en la base para esa zona/tipo todavía.",
      };
    }
    const prices = comps.map((c) => c.price_usd).sort((a, b) => a - b);
    const min = prices[0];
    const max = prices[prices.length - 1];
    const median = prices[Math.floor(prices.length / 2)];
    return {
      ok: true,
      count: comps.length,
      suggested_range: { min, median, max },
      comparables: comps.slice(0, 5),
    };
  },
});

// ------------------------------------------------------------------
export const llaveroTools = {
  searchProperties: searchPropertiesTool,
  getPropertyDetail: getPropertyDetailTool,
  recommendByProfile: recommendByProfileTool,
  compareProperties: comparePropertiesTool,
  scheduleVisit: scheduleVisitTool,
  createPropertyDraft: createPropertyDraftTool,
  suggestPrice: suggestPriceTool,
};

export type LlaveroToolName = keyof typeof llaveroTools;
