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
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  appendContract,
  CONTRACTS_STORE,
  DEMO_TENANTS,
  getContractProgress,
  listContractsForAsesor,
  listContractsForOwner,
  listContractsForTenant,
  type FullContract,
} from "@/lib/db/contracts";
import {
  buildContractDraft,
  type ContractParty,
} from "@/lib/ai/lrcav";
import {
  getBalanceForContract,
  getBalanceForOwner,
  listPaymentsForContract,
  recordPayment as recordPaymentDb,
  periodForCurrentMonth,
} from "@/lib/db/payments";

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
// setupMyProfile — conversational onboarding alternative to /onboarding form
// ------------------------------------------------------------------
const setupMyProfileTool = tool({
  description:
    "Configura el perfil del usuario logueado durante el onboarding conversacional. Captura su rol (inquilino, asesor o propietario), nombre completo y teléfono. Solo úsala cuando el usuario te haya confirmado claramente esos 3 datos en el chat.",
  inputSchema: z.object({
    role: z.enum(["inquilino", "asesor", "propietario"]),
    full_name: z.string().min(2),
    phone: z.string().optional(),
  }),
  execute: async ({ role, full_name, phone }) => {
    const supa = await createSupabaseServerClient();
    if (!supa) return { ok: false, error: "Supabase no configurado" };
    const { data: { user } } = await supa.auth.getUser();
    if (!user) return { ok: false, error: "Necesitas iniciar sesión primero (magic link a tu correo)." };
    const { error } = await supa
      .from("profiles")
      .upsert(
        {
          id: user.id,
          role,
          full_name,
          phone: phone ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
    if (error) return { ok: false, error: error.message };
    const home: Record<typeof role, string> = {
      inquilino: "/inquilino",
      asesor: "/asesor",
      propietario: "/propietario",
    };
    return { ok: true, role, full_name, redirect: home[role] };
  },
});

// ------------------------------------------------------------------
// generateRentalContract — genera y persiste un contrato LRCAV
// ------------------------------------------------------------------
const generateRentalContractTool = tool({
  description:
    "Genera un contrato de arrendamiento bajo LRCAV venezolana para una propiedad existente, con las cláusulas legales base ya redactadas (sin inventar texto). Lo guarda en el store y devuelve el id + ruta del documento. Pide siempre cédula del inquilino y datos completos antes de llamar.",
  inputSchema: z.object({
    property_id: z.string().describe("UUID del inmueble"),
    tenant_full_name: z.string().min(3).describe("Nombre completo del inquilino"),
    tenant_cedula: z.string().min(5).describe("Cédula del inquilino (ej. V-18.234.567)"),
    monthly_amount_usd: z
      .number()
      .optional()
      .describe("Canon mensual en USD; si no se pasa usa el precio del inmueble"),
    months_total: z.number().int().min(6).max(60).optional().default(12),
    start_date: z
      .string()
      .optional()
      .describe("Fecha de inicio ISO (YYYY-MM-DD). Por defecto hoy."),
  }),
  execute: async (args) => {
    const property = await getPropertyById(args.property_id);
    if (!property) {
      return { ok: false, error: "No encontré ese inmueble en la base." };
    }
    const ownerParty: ContractParty = {
      full_name: DEMO_OWNER.full_name ?? "Rafael Oviedo",
      cedula: "V-12.345.678",
      phone: DEMO_OWNER.phone ?? undefined,
    };
    const tenantParty: ContractParty = {
      full_name: args.tenant_full_name,
      cedula: args.tenant_cedula,
    };
    const monthly = args.monthly_amount_usd ?? property.price_usd;
    const months = args.months_total ?? 12;
    const startISO = args.start_date
      ? new Date(args.start_date).toISOString()
      : new Date().toISOString();

    const draft = buildContractDraft({
      owner: ownerParty,
      tenant: tenantParty,
      property,
      monthlyAmount: monthly,
      monthsTotal: months,
      startDate: startISO,
      depositMonths: 1,
      currency: "USD",
    });

    const tenantId = `tenant-${draft.id.slice(-6)}`;
    const contract: FullContract = {
      id: draft.id,
      property_id: property.id,
      property,
      tenant_id: tenantId,
      owner_id: property.owner_id,
      asesor_id: property.owner_id,
      started_at: startISO,
      months_total: months,
      monthly_amount: monthly,
      status: "activo",
      tenant: tenantParty,
      owner: ownerParty,
      draft,
    };
    appendContract(contract);

    return {
      ok: true,
      contract_id: contract.id,
      parties_summary: `${ownerParty.full_name} → ${tenantParty.full_name}`,
      property_title: property.title.replace(/^Llave:\s*/, ""),
      monthly_amount: monthly,
      months_total: months,
      start_date: startISO,
      end_date: draft.terms.end_date,
      clauses_count: draft.clauses.length,
      pdf_route: `/contrato/${contract.id}`,
    };
  },
});

// ------------------------------------------------------------------
// listMyContracts — contratos visibles para un usuario+rol
// ------------------------------------------------------------------
const listMyContractsTool = tool({
  description:
    "Lista los contratos visibles para el usuario según su rol. El inquilino ve los propios; propietario y asesor ven los de su cartera. Devuelve resumen por contrato (inmueble, contraparte, mensual, estado, meses transcurridos/restantes, saldo).",
  inputSchema: z.object({
    role: z.enum(["tenant", "owner", "asesor"]),
    user_id: z.string().optional().describe("Si no se pasa, usa el primer demo según rol"),
  }),
  execute: async ({ role, user_id }) => {
    let contracts: FullContract[];
    if (role === "tenant") {
      const tid = user_id ?? DEMO_TENANTS[0].id;
      contracts = listContractsForTenant(tid);
      if (contracts.length === 0) contracts = CONTRACTS_STORE.filter((c) => c.tenant_id === DEMO_TENANTS[0].id);
    } else if (role === "owner") {
      const oid = user_id ?? DEMO_OWNER.id;
      contracts = listContractsForOwner(oid);
      if (contracts.length === 0) contracts = listContractsForOwner(DEMO_OWNER.id);
    } else {
      const aid = user_id ?? DEMO_OWNER.id;
      contracts = listContractsForAsesor(aid);
      if (contracts.length === 0) contracts = listContractsForAsesor(DEMO_OWNER.id);
    }

    const rows = contracts.map((c) => {
      const progress = getContractProgress(c);
      const balance = getBalanceForContract(c.id);
      const counterpart =
        role === "tenant" ? c.owner.full_name : c.tenant.full_name;
      return {
        id: c.id,
        property_title: c.property?.title.replace(/^Llave:\s*/, "") ?? "Inmueble",
        counterpart_name: counterpart,
        monthly: c.monthly_amount,
        status: c.status,
        months_elapsed: progress.monthsElapsed,
        months_remaining: progress.monthsRemaining,
        months_total: c.months_total,
        started_at: c.started_at,
        pending_usd: balance.pending_usd,
        pdf_route: `/contrato/${c.id}`,
      };
    });

    return { count: rows.length, contracts: rows };
  },
});

// ------------------------------------------------------------------
// recordPayment — registra un pago en el contrato
// ------------------------------------------------------------------
const recordPaymentTool = tool({
  description:
    "Registra un pago de canon en un contrato. Útil para el inquilino que paga su mensualidad, o para el asesor/propietario que reconcilia un pago recibido por fuera. Devuelve nuevo saldo pendiente.",
  inputSchema: z.object({
    contract_id: z.string(),
    amount_usd: z.number().positive(),
    period: z
      .string()
      .regex(/^\d{4}-\d{2}$/, "Formato YYYY-MM")
      .describe("Mes pagado, ej: 2026-05"),
    method: z.enum([
      "transferencia",
      "pago_movil",
      "zelle",
      "efectivo",
      "binance",
    ]),
  }),
  execute: async (args) => {
    const payment = recordPaymentDb({
      contract_id: args.contract_id,
      amount_usd: args.amount_usd,
      period: args.period,
      method: args.method,
    });
    if (!payment) {
      return { ok: false, error: "No encontré ese contrato." };
    }
    const balance = getBalanceForContract(args.contract_id);
    return {
      ok: true,
      payment_id: payment.id,
      contract_id: args.contract_id,
      status: payment.status,
      method: payment.method,
      period: payment.period,
      new_balance_usd: balance.pending_usd,
      months_paid: balance.months_paid,
    };
  },
});

// ------------------------------------------------------------------
// getOwnerBalance — panel de cobros para propietario
// ------------------------------------------------------------------
const getOwnerBalanceTool = tool({
  description:
    "Trae el balance del propietario: total pendiente, total cobrado este año, y por contrato (inmueble, inquilino, mensual, pagado este mes, último pago, estado). Úsalo cuando el propietario pregunte por sus cobros.",
  inputSchema: z.object({
    owner_id: z.string().optional().describe("Si no se pasa, usa el DEMO_OWNER"),
  }),
  execute: async ({ owner_id }) => {
    const oid = owner_id ?? DEMO_OWNER.id;
    const totals = getBalanceForOwner(oid);
    const contracts = listContractsForOwner(oid).map((c) => {
      const balance = getBalanceForContract(c.id);
      const period = periodForCurrentMonth();
      const paidThisMonth = listPaymentsForContract(c.id)
        .filter((p) => p.period === period)
        .reduce((acc, p) => acc + p.amount_usd, 0);
      return {
        contract_id: c.id,
        property_title: c.property?.title.replace(/^Llave:\s*/, "") ?? "Inmueble",
        tenant_name: c.tenant.full_name,
        monthly: c.monthly_amount,
        paid_this_month: paidThisMonth,
        last_payment_at: balance.last_payment_at,
        pending_usd: balance.pending_usd,
        status: balance.pending_usd > 0 ? "pendiente" : "al_dia",
      };
    });
    return {
      owner_id: oid,
      total_pending_usd: totals.total_pending_usd,
      total_paid_ytd_usd: totals.total_paid_ytd_usd,
      contracts,
    };
  },
});

export const llaveroTools = {
  searchProperties: searchPropertiesTool,
  getPropertyDetail: getPropertyDetailTool,
  recommendByProfile: recommendByProfileTool,
  compareProperties: comparePropertiesTool,
  scheduleVisit: scheduleVisitTool,
  createPropertyDraft: createPropertyDraftTool,
  suggestPrice: suggestPriceTool,
  setupMyProfile: setupMyProfileTool,
  generateRentalContract: generateRentalContractTool,
  listMyContracts: listMyContractsTool,
  recordPayment: recordPaymentTool,
  getOwnerBalance: getOwnerBalanceTool,
};

export type LlaveroToolName = keyof typeof llaveroTools;
