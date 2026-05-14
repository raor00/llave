/**
 * /asesor/reportes — Hub de reportes del asesor.
 *
 * Muestra resumen ejecutivo, descargables (CSV / online), top inmuebles por
 * engagement y un embudo Vistas → Clicks → CTA → Leads → Cerrados. Toda la
 * data viene de los helpers existentes (analytics + queries); no toca la
 * DB ni introduce nuevas tablas.
 */

import Link from "next/link";
import { listAllProperties, listLeadsForOwner, getOwnerProfile } from "@/lib/db/queries";
import { getViewsByProperty } from "@/lib/db/views";
import { buildAsesorAnalytics } from "@/lib/db/asesor-analytics";
import { formatUSD } from "@/lib/format";
import { getGreeting } from "@/lib/greeting";
import { IconDownload, IconReport, IconDocument } from "@/components/dashboard-icons";
import type { ReportType } from "@/lib/reports/report-builder";

export const dynamic = "force-dynamic";

type DownloadableReport = {
  id: string;
  type: ReportType;
  title: string;
  description: string;
  updated_at: string;
  rows: number;
};

const REPORTS: DownloadableReport[] = [
  {
    id: "rep-perf",
    type: "performance-inmuebles",
    title: "Performance por inmueble",
    description: "Vistas, leads, conversión y engagement por cada inmueble en cartera.",
    updated_at: "Hoy, 09:14",
    rows: 17,
  },
  {
    id: "rep-funnel",
    type: "embudo-leads",
    title: "Embudo de leads",
    description: "Conversión de cada etapa: vista → click → CTA → lead → cierre.",
    updated_at: "Hoy, 09:14",
    rows: 5,
  },
  {
    id: "rep-sources",
    type: "origen-trafico",
    title: "Origen de tráfico",
    description: "Visitas por canal (Instagram, Facebook, WhatsApp, TikTok, etc.).",
    updated_at: "Hoy, 09:14",
    rows: 8,
  },
  {
    id: "rep-commissions",
    type: "comisiones-mes",
    title: "Comisiones por mes",
    description: "Histórico mensual de comisiones cobradas y pendientes.",
    updated_at: "Ayer, 22:30",
    rows: 6,
  },
  {
    id: "rep-types",
    type: "inmuebles-tipo",
    title: "Inmuebles por tipo",
    description: "Distribución de portafolio: apartamentos, casas, locales, habitaciones.",
    updated_at: "Hace 2 días",
    rows: 4,
  },
  {
    id: "rep-trends",
    type: "performance-inmuebles",
    title: "Tendencias de búsqueda",
    description: "Keywords y filtros que más impacto tienen en tus inmuebles.",
    updated_at: "Hace 2 días",
    rows: 25,
  },
];

export default async function ReportesPage() {
  const [props, leads, owner] = await Promise.all([
    listAllProperties(),
    listLeadsForOwner(),
    getOwnerProfile(),
  ]);
  const viewsMap = await getViewsByProperty(props.map((p) => p.id));
  const analytics = buildAsesorAnalytics({
    asesorId: owner.id,
    properties: props,
    viewCounts: viewsMap,
    leadCount: leads.length,
  });
  const greeting = getGreeting(owner.full_name);

  const cerrados = analytics.commissions.items.length;
  const funnel = [
    { label: "Vistas", value: analytics.totalExposure.views },
    { label: "Clicks", value: analytics.totalExposure.clicks },
    { label: "CTA", value: analytics.totalExposure.ctaClicks },
    { label: "Leads", value: analytics.totalExposure.leads },
    { label: "Cerrados", value: cerrados },
  ];
  const funnelMax = Math.max(1, ...funnel.map((f) => f.value));

  return (
    <div className="container-x py-8 sm:py-10 space-y-8">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <span className="chip mb-2">Crecimiento · Reportes</span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">{greeting.full}, tus reportes</h1>
          <p className="text-sm text-[color:var(--color-fg-muted)] mt-1 max-w-2xl">
            Toda la información sobre tu desempeño en un solo lugar. Descarga cada reporte en PDF o consúltalo online.
          </p>
        </div>
        <a
          href="#descargables"
          className="btn btn-outline text-sm"
        >
          <IconDownload size={16} /> Ir a descargables
        </a>
      </header>

      {/* Resumen ejecutivo */}
      <section>
        <h2 className="font-display text-lg font-semibold mb-3">Resumen ejecutivo</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            label="Comisiones del mes"
            value={formatUSD(analytics.commissions.totals.paidThisMonth)}
            hint={`Pendiente ${formatUSD(analytics.commissions.totals.pendingThisMonth)}`}
            highlight
          />
          <StatCard
            label="Leads totales"
            value={analytics.totalExposure.leads}
            hint={`${analytics.totalExposure.conversionPct}% conversión global`}
          />
          <StatCard
            label="Conversión vista→lead"
            value={`${analytics.totalExposure.conversionPct}%`}
            hint="Promedio cartera"
          />
          <StatCard
            label="Engagement promedio"
            value={`${analytics.totalExposure.engagementScoreAvg}/100`}
            hint={analytics.totalExposure.engagementScoreAvg >= 60 ? "Top 15% asesores" : "Apunta a 60+"}
          />
        </div>
      </section>

      {/* Reportes descargables */}
      <section id="descargables">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-display text-lg font-semibold">Reportes descargables</h2>
          <span className="text-xs text-[color:var(--color-fg-soft)]">PDF listos para imprimir o compartir</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {REPORTS.map((r) => (
            <article key={r.id} className="card p-5 flex flex-col">
              <div className="flex items-start gap-3">
                <span className="size-9 rounded-md bg-[color:var(--color-brand-100)] text-[color:var(--color-brand-700)] grid place-items-center shrink-0">
                  <IconDocument size={18} />
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-base font-semibold leading-tight">{r.title}</h3>
                  <p className="text-xs text-[color:var(--color-fg-muted)] mt-1 leading-relaxed">{r.description}</p>
                </div>
              </div>
              <div className="text-[11px] text-[color:var(--color-fg-soft)] mt-3">
                Actualizado {r.updated_at} · {r.rows} filas
              </div>
              <div className="flex gap-2 mt-3">
                <a
                  href={`/reporte/${r.type}/print?scope=asesor`}
                  className="btn btn-primary text-xs flex-1 justify-center"
                >
                  <IconDownload size={14} /> Descargar PDF
                </a>
                <a
                  href={`/reporte/${r.type}?scope=asesor`}
                  className="btn btn-outline text-xs flex-1 justify-center"
                >
                  Ver online
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Top inmuebles */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-display text-lg font-semibold">Top inmuebles por engagement</h2>
          <span className="text-xs text-[color:var(--color-fg-soft)]">los que mueven aguja</span>
        </div>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-[color:var(--color-bg)] text-left text-xs uppercase tracking-wider text-[color:var(--color-fg-soft)]">
              <tr>
                <th className="px-4 py-3 font-semibold">#</th>
                <th className="px-4 py-3 font-semibold">Inmueble</th>
                <th className="px-4 py-3 font-semibold">Vistas</th>
                <th className="px-4 py-3 font-semibold">Leads</th>
                <th className="px-4 py-3 font-semibold hidden md:table-cell">Conversión</th>
                <th className="px-4 py-3 font-semibold">Engagement</th>
              </tr>
            </thead>
            <tbody>
              {analytics.topPerformers.byEngagement.map((row, i) => (
                <tr key={row.property.id} className="border-t border-[color:var(--color-border)]">
                  <td className="px-4 py-3 font-bold text-[color:var(--color-brand-700)]">{i + 1}</td>
                  <td className="px-4 py-3">
                    <Link href={`/inmueble/${row.property.id}`} className="font-medium hover:text-[color:var(--color-brand-700)] line-clamp-1">
                      {row.property.title.replace(/^Llave:\s*/, "")}
                    </Link>
                    <div className="text-[11px] text-[color:var(--color-fg-soft)]">
                      {row.property.city} · {row.property.type}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold">{row.metrics.views}</td>
                  <td className="px-4 py-3 font-semibold">{row.metrics.leads}</td>
                  <td className="px-4 py-3 text-[color:var(--color-fg-muted)] hidden md:table-cell">
                    {row.metrics.conversionViewToLead}%
                  </td>
                  <td className="px-4 py-3">
                    <EngagementPill score={row.metrics.engagementScore} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Embudo */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-display text-lg font-semibold">Embudo de conversión</h2>
          <span className="text-xs text-[color:var(--color-fg-soft)]">de la primera vista al cierre</span>
        </div>
        <div className="card p-5 sm:p-6">
          <ul className="space-y-3">
            {funnel.map((step, i) => {
              const width = Math.max(8, Math.round((step.value / funnelMax) * 100));
              const prev = i > 0 ? funnel[i - 1].value : null;
              const dropPct = prev ? Math.max(0, Math.round((1 - step.value / Math.max(1, prev)) * 100)) : 0;
              return (
                <li key={step.label}>
                  <div className="flex items-baseline justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="size-6 rounded-full bg-[color:var(--color-brand-100)] text-[color:var(--color-brand-700)] grid place-items-center text-xs font-bold">
                        <IconReport size={12} />
                      </span>
                      <span className="text-sm font-semibold">{step.label}</span>
                      {i > 0 && dropPct > 0 && (
                        <span className="text-[10px] text-[color:var(--color-fg-soft)]">-{dropPct}% vs anterior</span>
                      )}
                    </div>
                    <span className="font-display text-lg font-bold">{step.value}</span>
                  </div>
                  <div className="h-3 rounded-full bg-[color:var(--color-border)] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[color:var(--color-brand-500)] to-[color:var(--color-accent)]"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-5 text-xs text-[color:var(--color-fg-soft)]">
            Tip: cada caída fuerte en una etapa es una oportunidad. Si pierdes mucha gente entre <strong>CTA</strong> y <strong>Lead</strong>,
            mejora el formulario o agrega Llavero como respaldo fuera de horario.
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  highlight = false,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`card p-4 sm:p-5 ${
        highlight
          ? "border-[color:var(--color-brand-300)] bg-gradient-to-br from-[color:var(--color-brand-50)] to-white"
          : ""
      }`}
    >
      <div className="text-[10px] sm:text-xs text-[color:var(--color-fg-soft)] uppercase tracking-wide">{label}</div>
      <div className="font-display text-2xl sm:text-3xl font-bold mt-1">{value}</div>
      {hint && <div className="text-[10px] sm:text-xs text-[color:var(--color-fg-muted)] mt-1">{hint}</div>}
    </div>
  );
}

function EngagementPill({ score }: { score: number }) {
  const tone =
    score >= 75
      ? "bg-[color:var(--color-brand-500)] text-white"
      : score >= 55
        ? "bg-[color:var(--color-accent)] text-[color:var(--color-brand-900)]"
        : "bg-[color:var(--color-border)] text-[color:var(--color-fg)]";
  return (
    <span className={`inline-flex items-center justify-center min-w-9 px-2 py-0.5 rounded-md text-xs font-bold ${tone}`}>
      {score}
    </span>
  );
}
