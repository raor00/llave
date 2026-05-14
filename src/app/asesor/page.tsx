import Link from "next/link";
import { listAllProperties, listLeadsForOwner, getStatsForOwner, getOwnerProfile } from "@/lib/db/queries";
import { getViewsByProperty, getViewsTimeSeries } from "@/lib/db/views";
import { formatUSD } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AsesorDashboard() {
  const [props, leads, stats, owner] = await Promise.all([
    listAllProperties(),
    listLeadsForOwner(),
    getStatsForOwner(),
    getOwnerProfile(),
  ]);

  const ids = props.map((p) => p.id);
  const [viewsMap, timeseries] = await Promise.all([
    getViewsByProperty(ids),
    getViewsTimeSeries(ids),
  ]);
  const totalViews = ids.reduce((acc, id) => acc + (viewsMap.get(id) ?? 0), 0);
  const conversionPct = totalViews ? Math.round((leads.length / totalViews) * 100) : 0;

  // Top 5 visited listings for the "demanda" leaderboard.
  const topByViews = [...props]
    .map((p) => ({ p, views: viewsMap.get(p.id) ?? 0 }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  return (
    <div className="container-x py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <span className="chip mb-2">Panel asesor</span>
          <h1 className="font-display text-3xl font-bold">Hola, {owner.full_name?.split(" ")[0]}</h1>
          <p className="text-[color:var(--color-fg-muted)]">Gestioná publicaciones, leads y demanda real desde un solo lugar.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/asesor/leads" className="btn btn-outline">Leads ({leads.length})</Link>
          <Link href="/asesor/publicar" className="btn btn-primary">Publicar con IA</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Inmuebles activos" value={stats.active} hint={`${stats.total} en total`} />
        <StatCard label="Vistas (7 días)" value={totalViews} hint={`${conversionPct}% → lead`} highlight />
        <StatCard label="Leads totales" value={stats.totalLeads} hint={`${stats.conversion}% agendado`} />
        <StatCard label="Portafolio mensual" value={formatUSD(stats.portfolio)} hint={`Vigente ${formatUSD(stats.projectedIncome)}`} />
      </div>

      <section className="grid lg:grid-cols-[1.4fr_1fr] gap-5 mb-10">
        <div className="card p-6">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display text-lg font-semibold">Demanda de cartera</h2>
            <span className="text-xs text-[color:var(--color-fg-soft)]">últimos 7 días</span>
          </div>
          <DemandChart data={timeseries} />
          <p className="text-xs text-[color:var(--color-fg-muted)] mt-3">
            Cada barra es la suma de views únicos por día. Llavero ya está aprendiendo qué tipo de inmueble buscan tus inquilinos.
          </p>
        </div>

        <div className="card p-6">
          <div className="text-xs uppercase tracking-wider text-[color:var(--color-brand-700)] font-semibold mb-3">
            Top inmuebles esta semana
          </div>
          <ul className="space-y-2.5">
            {topByViews.map((row, i) => (
              <li key={row.p.id} className="flex items-center gap-3">
                <span className="size-7 rounded-full bg-[color:var(--color-brand-100)] text-[color:var(--color-brand-700)] text-xs font-bold grid place-items-center">
                  {i + 1}
                </span>
                <Link href={`/inmueble/${row.p.id}`} className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{row.p.title.replace(/^Llave:\s*/, "")}</div>
                  <div className="text-[11px] text-[color:var(--color-fg-soft)]">{row.p.city}</div>
                </Link>
                <div className="text-right">
                  <div className="text-sm font-bold">{row.views}</div>
                  <div className="text-[10px] uppercase tracking-wider text-[color:var(--color-fg-soft)]">views</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <h2 className="font-display text-xl font-semibold mb-4">Tus publicaciones</h2>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[color:var(--color-bg)] text-left text-xs uppercase tracking-wide text-[color:var(--color-fg-soft)]">
            <tr>
              <th className="px-4 py-3">Inmueble</th>
              <th className="px-4 py-3">Ciudad</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Hab/Baño</th>
              <th className="px-4 py-3">Vistas</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {props.slice(0, 12).map((p) => (
              <tr key={p.id} className="border-t border-[color:var(--color-border)]">
                <td className="px-4 py-3 font-medium">{p.title.replace(/^Llave:\s*/, "")}</td>
                <td className="px-4 py-3 text-[color:var(--color-fg-muted)]">{p.city}</td>
                <td className="px-4 py-3">{formatUSD(p.price_usd)}</td>
                <td className="px-4 py-3 text-[color:var(--color-fg-muted)]">{p.rooms}/{p.bathrooms}</td>
                <td className="px-4 py-3 font-semibold">{viewsMap.get(p.id) ?? 0}</td>
                <td className="px-4 py-3"><span className="chip">{p.status}</span></td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/inmueble/${p.id}`} className="text-[color:var(--color-brand-700)] hover:underline text-xs">Ver →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
      className={`card p-5 ${
        highlight
          ? "border-[color:var(--color-brand-300)] bg-gradient-to-br from-[color:var(--color-brand-50)] to-white"
          : ""
      }`}
    >
      <div className="text-xs text-[color:var(--color-fg-soft)] uppercase tracking-wide">{label}</div>
      <div className="font-display text-3xl font-bold mt-1">{value}</div>
      {hint && <div className="text-xs text-[color:var(--color-fg-muted)] mt-1">{hint}</div>}
    </div>
  );
}

function DemandChart({ data }: { data: Array<{ day: string; views: number }> }) {
  const max = Math.max(1, ...data.map((d) => d.views));
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d, i) => {
        const pct = Math.round((d.views / max) * 100);
        return (
          <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
            <div className="w-full rounded-t-md bg-gradient-to-t from-[color:var(--color-brand-700)] to-[color:var(--color-brand-400)]" style={{ height: `${Math.max(6, pct)}%` }} />
            <div className="text-[10px] text-[color:var(--color-fg-soft)]">{d.day}</div>
            <div className="text-[10px] text-[color:var(--color-fg-muted)]">{d.views}</div>
          </div>
        );
      })}
    </div>
  );
}
