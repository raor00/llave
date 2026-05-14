/**
 * /propietario/reportes — hub de reportes del propietario. Resumen ejecutivo,
 * reportes descargables como PDF (enlazan a /reporte/[type]), inmueble más
 * visto con su tabla y estado de cobros. Toda la data sale de los helpers
 * existentes; los PDFs los genera el navegador desde las rutas /reporte.
 */

import Link from "next/link";
import { listAllProperties, listLeadsForOwner, getOwnerProfile } from "@/lib/db/queries";
import { getViewsByProperty } from "@/lib/db/views";
import { formatUSD } from "@/lib/format";
import { getGreeting } from "@/lib/greeting";
import { listContractsForOwner } from "@/lib/db/contracts";
import { getBalanceForOwner } from "@/lib/db/payments";
import { DEMO_OWNER } from "@/lib/db/seed-data";
import type { ReportType } from "@/lib/reports/report-builder";
import { IconDownload, IconDocument } from "@/components/dashboard-icons";
import { resolvePeriod } from "@/lib/reports/period";
import { PeriodPicker } from "@/components/reports/period-picker";

export const dynamic = "force-dynamic";

type DownloadableReport = {
  type: ReportType;
  title: string;
  description: string;
  updated_at: string;
};

const REPORTS: DownloadableReport[] = [
  {
    type: "performance-inmuebles",
    title: "Demanda por inmueble",
    description: "Vistas, leads, conversión y engagement de cada inmueble en tu cartera.",
    updated_at: "Hoy, 09:14",
  },
  {
    type: "ingresos-cobros",
    title: "Ingresos y cobros",
    description: "Ingreso vigente, cobrado del año y montos pendientes por cobrar.",
    updated_at: "Hoy, 09:14",
  },
  {
    type: "ocupacion-cartera",
    title: "Ocupación de cartera",
    description: "Ocupación general y estado individual de cada inmueble.",
    updated_at: "Hoy, 08:30",
  },
  {
    type: "contratos-vigentes",
    title: "Contratos vigentes",
    description: "Contratos activos con canon, inquilino y meses restantes.",
    updated_at: "Ayer, 22:30",
  },
  {
    type: "historial-pagos",
    title: "Historial de pagos",
    description: "Pagos registrados en los últimos 6 meses, por inmueble y método.",
    updated_at: "Hace 2 días",
  },
];

export default async function PropietarioReportesPage({
  searchParams,
}: {
  searchParams: Promise<{ preset?: string; from?: string; to?: string }>;
}) {
  const { preset, from, to } = await searchParams;
  const period = resolvePeriod(preset, from, to);
  // Query string del período para arrastrar la selección a /reporte/[type].
  const periodQuery = new URLSearchParams({ scope: "propietario", preset: period.preset });
  if (period.preset === "personalizado") {
    periodQuery.set("from", period.from);
    periodQuery.set("to", period.to);
  }
  const periodQs = periodQuery.toString();

  const [allProps, leads, owner] = await Promise.all([
    listAllProperties(),
    listLeadsForOwner(),
    getOwnerProfile(),
  ]);

  // Demo: la cartera del propietario son las primeras 6 propiedades.
  const props = allProps.slice(0, 6);
  const viewsMap = await getViewsByProperty(props.map((p) => p.id));
  const greeting = getGreeting(owner.full_name);

  const totalViews = props.reduce((acc, p) => acc + (viewsMap.get(p.id) ?? 0), 0);
  const alquilados = props.filter((p) => p.status === "alquilado").length;
  const occupancy = props.length ? Math.round((alquilados / props.length) * 100) : 0;
  const incomeVigente = props
    .filter((p) => p.status === "alquilado")
    .reduce((acc, p) => acc + Number(p.price_usd ?? 0), 0);

  const ownerContracts = listContractsForOwner(DEMO_OWNER.id);
  const contratosActivos = ownerContracts.filter(
    (c) => c.status === "activo" || c.status === "renegociacion"
  ).length;
  const balance = getBalanceForOwner(DEMO_OWNER.id);

  const ranked = [...props]
    .map((p) => ({ p, views: viewsMap.get(p.id) ?? 0 }))
    .sort((a, b) => b.views - a.views);
  const top = ranked[0];

  return (
    <div className="container-x py-8 sm:py-10 space-y-8">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <span className="chip mb-2">Cuenta · Reportes</span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">{greeting.full}, tus reportes</h1>
          <p className="text-sm text-[color:var(--color-fg-muted)] mt-1 max-w-2xl">
            Toda la información de tu cartera en un solo lugar. Descarga cada reporte en PDF o consúltalo online.
          </p>
        </div>
        <a href="#descargables" className="btn btn-outline text-sm">
          <IconDownload size={16} /> Ir a descargables
        </a>
      </header>

      {/* Resumen ejecutivo */}
      <section>
        <h2 className="font-display text-lg font-semibold mb-3">Resumen ejecutivo</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard label="Vistas (7 días)" value={totalViews} hint="Tráfico real a tu cartera" highlight />
          <StatCard label="Ingreso vigente" value={formatUSD(incomeVigente)} hint="Inmuebles alquilados" />
          <StatCard label="Ocupación" value={`${occupancy}%`} hint={`${alquilados} de ${props.length} alquilados`} />
          <StatCard label="Contratos activos" value={contratosActivos} hint="Vigentes o en renegociación" />
        </div>
      </section>

      {/* Reportes descargables */}
      <section id="descargables">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-display text-lg font-semibold">Reportes descargables</h2>
          <span className="text-xs text-[color:var(--color-fg-soft)]">PDF listos para imprimir o compartir</span>
        </div>
        <div className="mb-4">
          <PeriodPicker />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {REPORTS.map((r) => (
            <article key={r.type} className="card p-5 flex flex-col">
              <div className="flex items-start gap-3">
                <span className="size-9 rounded-md bg-[color:var(--color-brand-100)] text-[color:var(--color-brand-700)] grid place-items-center shrink-0">
                  <IconDocument size={18} />
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-base font-semibold leading-tight">{r.title}</h3>
                  <p className="text-xs text-[color:var(--color-fg-muted)] mt-1 leading-relaxed">{r.description}</p>
                </div>
              </div>
              <div className="text-[11px] text-[color:var(--color-fg-soft)] mt-3">Actualizado {r.updated_at}</div>
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[color:var(--color-border)]">
                <a
                  href={`/reporte/${r.type}/print?${periodQs}`}
                  className="btn btn-primary text-xs"
                >
                  <IconDownload size={14} /> Descargar PDF
                </a>
                <Link
                  href={`/reporte/${r.type}?${periodQs}`}
                  className="text-xs font-medium text-[color:var(--color-brand-700)] hover:underline"
                >
                  Ver online
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Inmueble más visto + tabla */}
      <section className="grid lg:grid-cols-[1fr_1.4fr] gap-5">
        <div className="card p-5 sm:p-6">
          <div className="text-xs uppercase tracking-wider text-[color:var(--color-brand-700)] font-semibold mb-1">
            Inmueble más visto
          </div>
          {top ? (
            <>
              <div className="font-display text-lg font-semibold leading-tight mt-1">
                {top.p.title.replace(/^Llave:\s*/, "")}
              </div>
              <div className="text-sm text-[color:var(--color-fg-muted)] mt-1">
                {top.p.city} · {formatUSD(Number(top.p.price_usd ?? 0))}/mes
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <div className="font-display text-3xl font-bold">{top.views}</div>
                <div className="text-sm text-[color:var(--color-fg-muted)]">vistas esta semana</div>
              </div>
              <Link href={`/inmueble/${top.p.id}`} className="btn btn-outline w-full mt-4 text-sm">
                Ver inmueble
              </Link>
            </>
          ) : (
            <div className="text-sm text-[color:var(--color-fg-muted)]">Sin datos aún.</div>
          )}
        </div>

        <div className="card overflow-x-auto">
          <table className="w-full text-sm min-w-[420px]">
            <thead className="bg-[color:var(--color-bg)] text-left text-xs uppercase tracking-wider text-[color:var(--color-fg-soft)]">
              <tr>
                <th className="px-4 py-3 font-semibold">#</th>
                <th className="px-4 py-3 font-semibold">Inmueble</th>
                <th className="px-4 py-3 font-semibold">Ciudad</th>
                <th className="px-4 py-3 font-semibold">Vistas</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((row, i) => (
                <tr key={row.p.id} className="border-t border-[color:var(--color-border)]">
                  <td className="px-4 py-3 font-bold text-[color:var(--color-brand-700)]">{i + 1}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/inmueble/${row.p.id}`}
                      className="font-medium hover:text-[color:var(--color-brand-700)] line-clamp-1"
                    >
                      {row.p.title.replace(/^Llave:\s*/, "")}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[color:var(--color-fg-muted)]">{row.p.city}</td>
                  <td className="px-4 py-3 font-semibold">{row.views}</td>
                  <td className="px-4 py-3"><span className="chip">{row.p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Estado de cobros */}
      <section>
        <h2 className="font-display text-lg font-semibold mb-3">Estado de cobros</h2>
        <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
          <StatCard label="Cobrado en el año" value={formatUSD(balance.total_paid_ytd_usd)} hint="Pagos registrados YTD" />
          <StatCard
            label="Pendiente por cobrar"
            value={formatUSD(balance.total_pending_usd)}
            hint={balance.total_pending_usd > 0 ? "Hay mora en la cartera" : "Cartera al día"}
          />
          <StatCard label="Total facturado" value={formatUSD(balance.total_due_usd)} hint="Canon acumulado de contratos" />
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
