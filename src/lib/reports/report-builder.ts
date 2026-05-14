/**
 * report-builder — arma documentos de reporte imprimibles (ReportDoc) a partir
 * de los helpers de datos existentes. Centraliza qué reportes existen y cómo se
 * resuelve su data para que las rutas /reporte/[type] solo rendericen.
 */

import { listAllProperties, listLeadsForOwner, getOwnerProfile } from "@/lib/db/queries";
import { getViewsByProperty } from "@/lib/db/views";
import { buildAsesorAnalytics, SOURCE_LABEL } from "@/lib/db/asesor-analytics";
import { listAllContracts, listContractsForOwner, getContractProgress } from "@/lib/db/contracts";
import { listPaymentsForOwner, getBalanceForOwner } from "@/lib/db/payments";
import { formatUSD, formatPropertyType } from "@/lib/format";
import { DEMO_OWNER } from "@/lib/db/seed-data";
import { resolvePeriod, periodScale, type ResolvedPeriod } from "@/lib/reports/period";

export type ReportType =
  | "performance-inmuebles"
  | "embudo-leads"
  | "origen-trafico"
  | "comisiones-mes"
  | "inmuebles-tipo"
  | "ingresos-cobros"
  | "ocupacion-cartera"
  | "contratos-vigentes"
  | "historial-pagos";

export type ReportScope = "asesor" | "propietario";

export type ReportSection = {
  heading: string;
  kind: "kpis" | "table" | "bars";
  kpis?: Array<{ label: string; value: string }>;
  columns?: string[];
  rows?: string[][];
  bars?: Array<{ label: string; value: number }>;
  note?: string;
};

export type ReportDoc = {
  type: ReportType;
  title: string;
  subtitle: string;
  generatedAt: string;
  scope: ReportScope;
  period: { label: string; from: string; to: string };
  sections: ReportSection[];
};

export const REPORT_TYPES: ReportType[] = [
  "performance-inmuebles",
  "embudo-leads",
  "origen-trafico",
  "comisiones-mes",
  "inmuebles-tipo",
  "ingresos-cobros",
  "ocupacion-cartera",
  "contratos-vigentes",
  "historial-pagos",
];

const REPORT_TITLE: Record<ReportType, string> = {
  "performance-inmuebles": "Performance por inmueble",
  "embudo-leads": "Embudo de leads",
  "origen-trafico": "Origen de tráfico",
  "comisiones-mes": "Comisiones por mes",
  "inmuebles-tipo": "Inmuebles por tipo",
  "ingresos-cobros": "Ingresos y cobros",
  "ocupacion-cartera": "Ocupación de cartera",
  "contratos-vigentes": "Contratos vigentes",
  "historial-pagos": "Historial de pagos",
};

export function isReportType(value: string): value is ReportType {
  return (REPORT_TYPES as string[]).includes(value);
}

function nowLabel(): string {
  return new Date().toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/** Escala un entero de forma determinística según el período seleccionado. */
function scaleInt(value: number, factor: number): number {
  return Math.round(value * factor);
}

/** Escala y reformatea un monto USD según el período. */
function scaleUSD(value: number, factor: number): string {
  return formatUSD(Math.round(value * factor));
}

function notApplicable(
  type: ReportType,
  scope: ReportScope,
  period: ResolvedPeriod
): ReportDoc {
  return {
    type,
    title: REPORT_TITLE[type],
    subtitle: "Reporte no disponible para este perfil",
    generatedAt: nowLabel(),
    scope,
    period: { label: period.label, from: period.from, to: period.to },
    sections: [
      {
        heading: "Sin datos para este perfil",
        kind: "kpis",
        kpis: [{ label: "Estado", value: "No aplica" }],
        note:
          scope === "propietario"
            ? "Este reporte es exclusivo del panel de asesor. Tu panel de propietario tiene reportes de ingresos, ocupación, contratos y pagos."
            : "Este reporte es exclusivo del panel de propietario. Tu panel de asesor tiene reportes de performance, embudo, origen de tráfico y comisiones.",
      },
    ],
  };
}

/**
 * buildReport resuelve la data real de un reporte y devuelve un ReportDoc
 * renderizable. Reportes que no aplican a un scope devuelven un doc explicando
 * el caso en lugar de romper.
 */
export async function buildReport(
  type: ReportType,
  scope: ReportScope,
  period?: ResolvedPeriod
): Promise<ReportDoc> {
  const generatedAt = nowLabel();
  const title = REPORT_TITLE[type];
  const resolvedPeriod = period ?? resolvePeriod();
  const periodMeta = {
    label: resolvedPeriod.label,
    from: resolvedPeriod.from,
    to: resolvedPeriod.to,
  };
  const factor = periodScale(resolvedPeriod);
  const periodSuffix = ` · ${resolvedPeriod.label}`;

  // Reportes propios del asesor
  if (
    (type === "performance-inmuebles" ||
      type === "embudo-leads" ||
      type === "origen-trafico" ||
      type === "comisiones-mes") &&
    scope === "propietario"
  ) {
    return notApplicable(type, scope, resolvedPeriod);
  }
  // Reportes propios del propietario
  if (
    (type === "ingresos-cobros" ||
      type === "ocupacion-cartera" ||
      type === "contratos-vigentes" ||
      type === "historial-pagos") &&
    scope === "asesor"
  ) {
    return notApplicable(type, scope, resolvedPeriod);
  }

  const [props, leads, owner] = await Promise.all([
    listAllProperties(),
    listLeadsForOwner(),
    getOwnerProfile(),
  ]);

  // El propietario demo ve las primeras 6 propiedades como su cartera.
  const ownerProps = scope === "propietario" ? props.slice(0, 6) : props;
  const viewsMap = await getViewsByProperty(ownerProps.map((p) => p.id));
  const analytics = buildAsesorAnalytics({
    asesorId: owner.id,
    properties: ownerProps,
    viewCounts: viewsMap,
    leadCount: leads.length,
  });

  switch (type) {
    case "performance-inmuebles": {
      const rows = ownerProps.map((p) => {
        const m = analytics.metricsByProperty.get(p.id);
        return [
          p.title.replace(/^Llave:\s*/, ""),
          formatPropertyType(p.type),
          p.city,
          String(scaleInt(m?.views ?? 0, factor)),
          String(scaleInt(m?.leads ?? 0, factor)),
          `${m?.conversionViewToLead ?? 0}%`,
          `${m?.engagementScore ?? 0}/100`,
        ];
      });
      return {
        type,
        title,
        subtitle: `Vistas, leads, conversión y engagement por inmueble en cartera${periodSuffix}`,
        generatedAt,
        scope,
        period: periodMeta,
        sections: [
          {
            heading: "Resumen de cartera",
            kind: "kpis",
            kpis: [
              { label: "Inmuebles", value: String(ownerProps.length) },
              { label: "Vistas", value: String(scaleInt(analytics.totalExposure.views, factor)) },
              { label: "Leads totales", value: String(scaleInt(analytics.totalExposure.leads, factor)) },
              {
                label: "Engagement promedio",
                value: `${analytics.totalExposure.engagementScoreAvg}/100`,
              },
            ],
          },
          {
            heading: "Detalle por inmueble",
            kind: "table",
            columns: ["Inmueble", "Tipo", "Ciudad", "Vistas", "Leads", "Conversión", "Engagement"],
            rows,
          },
        ],
      };
    }

    case "embudo-leads": {
      const cerrados = scaleInt(analytics.commissions.items.length, factor);
      const e = analytics.totalExposure;
      const eViews = scaleInt(e.views, factor);
      const eClicks = scaleInt(e.clicks, factor);
      const eCta = scaleInt(e.ctaClicks, factor);
      const eLeads = scaleInt(e.leads, factor);
      return {
        type,
        title,
        subtitle: `Conversión de cada etapa: vista → click → CTA → lead → cierre${periodSuffix}`,
        generatedAt,
        scope,
        period: periodMeta,
        sections: [
          {
            heading: "Embudo de conversión",
            kind: "bars",
            bars: [
              { label: "Vistas", value: eViews },
              { label: "Clicks", value: eClicks },
              { label: "CTA", value: eCta },
              { label: "Leads", value: eLeads },
              { label: "Cerrados", value: cerrados },
            ],
          },
          {
            heading: "Tasas de conversión",
            kind: "kpis",
            kpis: [
              { label: "Vista → Lead", value: `${e.conversionPct}%` },
              {
                label: "Click → CTA",
                value: eClicks ? `${Math.round((eCta / eClicks) * 100)}%` : "0%",
              },
              {
                label: "CTA → Lead",
                value: eCta ? `${Math.round((eLeads / eCta) * 100)}%` : "0%",
              },
              {
                label: "Lead → Cierre",
                value: eLeads ? `${Math.round((cerrados / eLeads) * 100)}%` : "0%",
              },
            ],
          },
        ],
      };
    }

    case "origen-trafico": {
      return {
        type,
        title,
        subtitle: `Visitas por canal: Instagram, Facebook, WhatsApp, TikTok y más${periodSuffix}`,
        generatedAt,
        scope,
        period: periodMeta,
        sections: [
          {
            heading: "Visitas por canal",
            kind: "bars",
            bars: analytics.sources.map((s) => ({
              label: SOURCE_LABEL[s.source],
              value: scaleInt(s.visits, factor),
            })),
          },
          {
            heading: "Desglose por canal",
            kind: "table",
            columns: ["Canal", "Visitas", "Participación"],
            rows: analytics.sources.map((s) => [
              SOURCE_LABEL[s.source],
              String(scaleInt(s.visits, factor)),
              `${s.pct}%`,
            ]),
          },
        ],
      };
    }

    case "comisiones-mes": {
      const c = analytics.commissions;
      return {
        type,
        title,
        subtitle: `Comisiones cobradas y pendientes por mes, tipo y ciudad${periodSuffix}`,
        generatedAt,
        scope,
        period: periodMeta,
        sections: [
          {
            heading: "Totales de comisiones",
            kind: "kpis",
            kpis: [
              { label: "Cobrado en el período", value: scaleUSD(c.totals.paidThisMonth, factor) },
              { label: "Pendiente en el período", value: scaleUSD(c.totals.pendingThisMonth, factor) },
              { label: "Acumulado del año", value: formatUSD(c.totals.ytd) },
              { label: "Histórico total", value: formatUSD(c.totals.lifetime) },
            ],
          },
          {
            heading: "Comisiones por mes",
            kind: "bars",
            bars: c.byMonth.map((m) => ({ label: m.month, value: m.amount })),
          },
          {
            heading: "Comisiones por tipo de inmueble",
            kind: "table",
            columns: ["Tipo", "Alquileres", "Comisión"],
            rows: c.byType.map((t) => [
              formatPropertyType(t.type),
              String(t.rentals),
              formatUSD(t.amount),
            ]),
          },
          {
            heading: "Comisiones por ciudad",
            kind: "table",
            columns: ["Ciudad", "Alquileres", "Comisión"],
            rows: c.byCity.map((t) => [t.city, String(t.rentals), formatUSD(t.amount)]),
          },
        ],
      };
    }

    case "inmuebles-tipo": {
      const byType = new Map<string, { count: number; value: number; rented: number }>();
      for (const p of ownerProps) {
        const key = formatPropertyType(p.type);
        const cur = byType.get(key) ?? { count: 0, value: 0, rented: 0 };
        cur.count += 1;
        cur.value += Number(p.price_usd ?? 0);
        if (p.status === "alquilado") cur.rented += 1;
        byType.set(key, cur);
      }
      const entries = Array.from(byType.entries()).sort((a, b) => b[1].count - a[1].count);
      return {
        type,
        title,
        subtitle: `Distribución del portafolio: apartamentos, casas, locales, habitaciones${periodSuffix}`,
        generatedAt,
        scope,
        period: periodMeta,
        sections: [
          {
            heading: "Distribución por tipo",
            kind: "bars",
            bars: entries.map(([label, v]) => ({ label, value: v.count })),
          },
          {
            heading: "Detalle por tipo",
            kind: "table",
            columns: ["Tipo", "Inmuebles", "Alquilados", "Portafolio mensual"],
            rows: entries.map(([label, v]) => [
              label,
              String(v.count),
              String(v.rented),
              formatUSD(v.value),
            ]),
          },
        ],
      };
    }

    case "ingresos-cobros": {
      const balance = getBalanceForOwner(DEMO_OWNER.id);
      const ownerContracts = listContractsForOwner(DEMO_OWNER.id);
      const incomeVigente = ownerProps
        .filter((p) => p.status === "alquilado")
        .reduce((acc, p) => acc + Number(p.price_usd ?? 0), 0);
      const potential = ownerProps.reduce((acc, p) => acc + Number(p.price_usd ?? 0), 0);
      return {
        type,
        title,
        subtitle: `Ingresos vigentes, cobros realizados y montos pendientes${periodSuffix}`,
        generatedAt,
        scope,
        period: periodMeta,
        sections: [
          {
            heading: "Resumen de ingresos",
            kind: "kpis",
            kpis: [
              { label: "Ingreso vigente", value: formatUSD(incomeVigente) },
              { label: "Potencial mensual", value: formatUSD(potential) },
              { label: "Cobrado en el período", value: scaleUSD(balance.total_paid_ytd_usd, factor) },
              { label: "Pendiente por cobrar", value: formatUSD(balance.total_pending_usd) },
            ],
          },
          {
            heading: "Estado de cobro por contrato",
            kind: "table",
            columns: ["Contrato", "Canon mensual", "Estado"],
            rows: ownerContracts.map((c) => [
              c.property?.title?.replace(/^Llave:\s*/, "") ?? c.id,
              formatUSD(c.monthly_amount),
              c.status,
            ]),
          },
        ],
      };
    }

    case "ocupacion-cartera": {
      const alquilados = ownerProps.filter((p) => p.status === "alquilado").length;
      const occupancy = ownerProps.length
        ? Math.round((alquilados / ownerProps.length) * 100)
        : 0;
      return {
        type,
        title,
        subtitle: `Ocupación de la cartera y estado individual de cada inmueble${periodSuffix}`,
        generatedAt,
        scope,
        period: periodMeta,
        sections: [
          {
            heading: "Resumen de ocupación",
            kind: "kpis",
            kpis: [
              { label: "Inmuebles", value: String(ownerProps.length) },
              { label: "Alquilados", value: String(alquilados) },
              { label: "Disponibles", value: String(ownerProps.length - alquilados) },
              { label: "Ocupación", value: `${occupancy}%` },
            ],
          },
          {
            heading: "Estado por inmueble",
            kind: "table",
            columns: ["Inmueble", "Tipo", "Ciudad", "Canon mensual", "Estado"],
            rows: ownerProps.map((p) => [
              p.title.replace(/^Llave:\s*/, ""),
              formatPropertyType(p.type),
              p.city,
              formatUSD(Number(p.price_usd ?? 0)),
              p.status,
            ]),
          },
        ],
      };
    }

    case "contratos-vigentes": {
      const ownerContracts = listContractsForOwner(DEMO_OWNER.id).filter(
        (c) => c.status === "activo" || c.status === "renegociacion"
      );
      const totalMensual = ownerContracts.reduce((acc, c) => acc + c.monthly_amount, 0);
      return {
        type,
        title,
        subtitle: `Contratos activos con canon, inquilino y meses restantes${periodSuffix}`,
        generatedAt,
        scope,
        period: periodMeta,
        sections: [
          {
            heading: "Resumen de contratos",
            kind: "kpis",
            kpis: [
              { label: "Contratos vigentes", value: String(ownerContracts.length) },
              { label: "Ingreso mensual contratado", value: formatUSD(totalMensual) },
            ],
          },
          {
            heading: "Contratos vigentes",
            kind: "table",
            columns: ["Inmueble", "Inquilino", "Canon", "Meses restantes", "Estado"],
            rows: ownerContracts.map((c) => {
              const progress = getContractProgress(c);
              return [
                c.property?.title?.replace(/^Llave:\s*/, "") ?? c.id,
                c.tenant.full_name,
                formatUSD(c.monthly_amount),
                String(progress.monthsRemaining),
                c.status,
              ];
            }),
          },
        ],
      };
    }

    case "historial-pagos": {
      const payments = listPaymentsForOwner(DEMO_OWNER.id);
      const contractsById = new Map(listAllContracts().map((c) => [c.id, c]));
      const now = new Date();
      const sixMonthsAgo = new Date(now);
      sixMonthsAgo.setMonth(now.getMonth() - 5);
      const recent = payments.filter(
        (p) => new Date(p.paid_at) >= new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth(), 1)
      );
      const totalCobrado = recent.reduce((acc, p) => acc + p.amount_usd, 0);
      return {
        type,
        title,
        subtitle: `Pagos registrados en el período seleccionado${periodSuffix}`,
        generatedAt,
        scope,
        period: periodMeta,
        sections: [
          {
            heading: "Resumen de pagos",
            kind: "kpis",
            kpis: [
              { label: "Pagos registrados", value: String(recent.length) },
              { label: "Total cobrado", value: formatUSD(totalCobrado) },
            ],
          },
          {
            heading: "Detalle de pagos",
            kind: "table",
            columns: ["Fecha", "Inmueble", "Período", "Método", "Monto"],
            rows: recent.map((p) => {
              const contract = contractsById.get(p.contract_id);
              return [
                new Date(p.paid_at).toLocaleDateString("es-VE"),
                contract?.property?.title?.replace(/^Llave:\s*/, "") ?? p.contract_id,
                p.period,
                p.method.replace(/_/g, " "),
                formatUSD(p.amount_usd),
              ];
            }),
          },
        ],
      };
    }

    default:
      return notApplicable(type, scope, resolvedPeriod);
  }
}
