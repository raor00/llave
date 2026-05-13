import Link from "next/link";
import { listAllProperties, listLeadsForOwner, getStatsForOwner, getOwnerProfile } from "@/lib/db/queries";
import { formatUSD } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AsesorDashboard() {
  const [props, leads, stats, owner] = await Promise.all([
    listAllProperties(),
    listLeadsForOwner(),
    getStatsForOwner(),
    getOwnerProfile(),
  ]);

  return (
    <div className="container-x py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <span className="chip mb-2">Panel asesor</span>
          <h1 className="font-display text-3xl font-bold">Hola, {owner.full_name?.split(" ")[0]}</h1>
          <p className="text-[color:var(--color-fg-muted)]">Gestioná publicaciones, leads y estadísticas desde un solo lugar.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/asesor/leads" className="btn btn-outline">Leads ({leads.length})</Link>
          <Link href="/asesor/publicar" className="btn btn-primary">Publicar con IA</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Inmuebles activos" value={stats.active} />
        <StatCard label="Leads totales" value={stats.totalLeads} />
        <StatCard label="Tasa agendado" value={`${stats.conversion}%`} />
        <StatCard label="Portafolio mensual" value={formatUSD(stats.portfolio)} />
      </div>

      <h2 className="font-display text-xl font-semibold mb-4">Tus publicaciones</h2>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[color:var(--color-bg)] text-left text-xs uppercase tracking-wide text-[color:var(--color-fg-soft)]">
            <tr>
              <th className="px-4 py-3">Inmueble</th>
              <th className="px-4 py-3">Ciudad</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Hab/Baño</th>
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

function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="card p-5">
      <div className="text-xs text-[color:var(--color-fg-soft)] uppercase tracking-wide">{label}</div>
      <div className="font-display text-3xl font-bold mt-1">{value}</div>
    </div>
  );
}
