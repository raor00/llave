/**
 * /asesor/comisiones — Detalle de comisiones del asesor.
 *
 * Reusa analytics.commissions: stats del mes / pendientes / año / total
 * histórico, gráfico 6 meses, breakdown por tipo y ciudad, tabla por
 * inmueble. Cuando Supabase esté listo se reemplazan los seeds con queries
 * a `contracts` + `commissions`.
 */

import Link from "next/link";
import { listAllProperties, listLeadsForOwner, getOwnerProfile } from "@/lib/db/queries";
import { getViewsByProperty } from "@/lib/db/views";
import { buildAsesorAnalytics } from "@/lib/db/asesor-analytics";
import { formatUSD, formatPropertyType } from "@/lib/format";
import { getGreeting } from "@/lib/greeting";
import { IconCash } from "@/components/dashboard-icons";

export const dynamic = "force-dynamic";

export default async function ComisionesPage() {
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
  const { commissions } = analytics;
  const totalTypeAmount = commissions.byType.reduce((a, b) => a + b.amount, 0) || 1;
  const totalCityAmount = commissions.byCity.reduce((a, b) => a + b.amount, 0) || 1;

  return (
    <div className="container-x py-8 sm:py-10 space-y-8">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <span className="chip mb-2">Crecimiento · Comisiones</span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">{greeting.full}</h1>
          <p className="text-sm text-[color:var(--color-fg-muted)] mt-1 max-w-2xl">
            Todo lo que has cobrado, lo que viene en camino y dónde se concentra tu ingreso.
          </p>
        </div>
        <Link href="/asesor/reportes" className="btn btn-outline text-sm">
          <IconCash size={16} /> Exportar a CSV
        </Link>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Comisiones del mes" value={formatUSD(commissions.totals.paidThisMonth)} hint="ya pagadas" highlight />
        <StatCard label="Pendientes de cobro" value={formatUSD(commissions.totals.pendingThisMonth)} hint={`${commissions.items.filter((c) => c.status === "pendiente").length} contratos`} />
        <StatCard label="Este año" value={formatUSD(commissions.totals.ytd)} hint="acumulado YTD" />
        <StatCard label="Total histórico" value={formatUSD(commissions.totals.lifetime)} hint="desde tu primer cierre" />
      </section>

      {/* Gráfico 6 meses */}
      <section className="card p-5 sm:p-6">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display text-lg font-semibold">Últimos 6 meses</h2>
          <span className="text-xs text-[color:var(--color-fg-soft)]">USD por mes</span>
        </div>
        <CommissionsChart data={commissions.byMonth} />
      </section>

      {/* Por tipo y por ciudad */}
      <section className="grid lg:grid-cols-2 gap-5">
        <div className="card p-5 sm:p-6">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-display text-lg font-semibold">Por tipo de inmueble</h2>
            <span className="text-xs text-[color:var(--color-fg-soft)]">{commissions.byType.length} tipos</span>
          </div>
          <ul className="space-y-3">
            {commissions.byType.map((row) => {
              const pct = Math.round((row.amount / totalTypeAmount) * 100);
              return (
                <li key={row.type}>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-sm font-semibold">{formatPropertyType(row.type)}</span>
                    <span className="text-xs text-[color:var(--color-fg-muted)]">
                      {formatUSD(row.amount)} · {row.rentals} contrato{row.rentals === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[color:var(--color-border)] overflow-hidden">
                    <div
                      className="h-full bg-[color:var(--color-brand-500)]"
                      style={{ width: `${Math.max(4, pct)}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-[color:var(--color-fg-soft)] mt-0.5">{pct}% del total</div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="card p-5 sm:p-6">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-display text-lg font-semibold">Por ciudad</h2>
            <span className="text-xs text-[color:var(--color-fg-soft)]">{commissions.byCity.length} ciudades</span>
          </div>
          <ul className="space-y-3">
            {commissions.byCity.map((row) => {
              const pct = Math.round((row.amount / totalCityAmount) * 100);
              return (
                <li key={row.city}>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-sm font-semibold">{row.city}</span>
                    <span className="text-xs text-[color:var(--color-fg-muted)]">
                      {formatUSD(row.amount)} · {row.rentals} contrato{row.rentals === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[color:var(--color-border)] overflow-hidden">
                    <div
                      className="h-full bg-[color:var(--color-accent)]"
                      style={{ width: `${Math.max(4, pct)}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-[color:var(--color-fg-soft)] mt-0.5">{pct}% del total</div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Tabla por inmueble */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-display text-lg font-semibold">Comisiones por inmueble</h2>
          <span className="text-xs text-[color:var(--color-fg-soft)]">{commissions.items.length} contratos</span>
        </div>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-[color:var(--color-bg)] text-left text-xs uppercase tracking-wider text-[color:var(--color-fg-soft)]">
              <tr>
                <th className="px-4 py-3 font-semibold">Inmueble</th>
                <th className="px-4 py-3 font-semibold hidden md:table-cell">Tipo</th>
                <th className="px-4 py-3 font-semibold">Mensual</th>
                <th className="px-4 py-3 font-semibold hidden md:table-cell">Tasa</th>
                <th className="px-4 py-3 font-semibold">Comisión</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {commissions.items.map((c) => (
                <tr key={c.id} className="border-t border-[color:var(--color-border)]">
                  <td className="px-4 py-3">
                    <Link href={`/inmueble/${c.property_id}`} className="font-medium hover:text-[color:var(--color-brand-700)] line-clamp-1">
                      {c.property_title}
                    </Link>
                    <div className="text-[11px] text-[color:var(--color-fg-soft)]">
                      {c.city} · {c.contract_months} meses
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[color:var(--color-fg-muted)] hidden md:table-cell">{formatPropertyType(c.property_type)}</td>
                  <td className="px-4 py-3 text-[color:var(--color-fg-muted)]">{formatUSD(c.monthly_amount)}</td>
                  <td className="px-4 py-3 text-[color:var(--color-fg-muted)] hidden md:table-cell">{Math.round(c.commission_rate * 100)}%</td>
                  <td className="px-4 py-3 font-semibold">{formatUSD(c.commission_amount)}</td>
                  <td className="px-4 py-3">
                    <span className={`chip ${c.status === "pagada" ? "" : "chip-muted"}`}>{c.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

function CommissionsChart({ data }: { data: Array<{ month: string; amount: number }> }) {
  const max = Math.max(1, ...data.map((d) => d.amount));
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d, i) => {
        const pct = Math.round((d.amount / max) * 100);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full">
            <div className="flex-1 w-full flex items-end">
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-[color:var(--color-accent)] to-[#f7d9cb]"
                style={{ height: `${Math.max(6, pct)}%` }}
              />
            </div>
            <div className="text-[10px] text-[color:var(--color-fg-soft)] capitalize">{d.month}</div>
            <div className="text-[10px] text-[color:var(--color-fg-muted)]">${d.amount}</div>
          </div>
        );
      })}
    </div>
  );
}
