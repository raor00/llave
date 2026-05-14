import Link from "next/link";
import { listAllProperties, listLeadsForOwner, getOwnerProfile } from "@/lib/db/queries";
import { getViewsByProperty } from "@/lib/db/views";
import { buildAsesorAnalytics } from "@/lib/db/asesor-analytics";
import { formatUSD, formatPropertyType } from "@/lib/format";

export const dynamic = "force-dynamic";

/**
 * /asesor/inmuebles — cartera completa del asesor. Cada inmueble con sus
 * métricas (vistas, leads, conversión, engagement) para decidir dónde
 * invertir esfuerzo. La fila enlaza al detalle público del inmueble.
 */
export default async function AsesorInmueblesPage() {
  const [props, leads, owner] = await Promise.all([
    listAllProperties(),
    listLeadsForOwner(),
    getOwnerProfile(),
  ]);

  const ids = props.map((p) => p.id);
  const viewsMap = await getViewsByProperty(ids);
  const analytics = buildAsesorAnalytics({
    asesorId: owner.id,
    properties: props,
    viewCounts: viewsMap,
    leadCount: leads.length,
  });

  const disponibles = props.filter((p) => p.status === "disponible").length;
  const alquilados = props.filter((p) => p.status === "alquilado").length;
  const portfolioMensual = props.reduce((acc, p) => acc + p.price_usd, 0);

  return (
    <div className="container-x py-8 sm:py-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <span className="chip mb-2">Cartera · Inmuebles</span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Tus inmuebles</h1>
          <p className="text-sm text-[color:var(--color-fg-muted)] mt-1 max-w-2xl">
            Toda tu cartera con métricas reales por inmueble. Prioriza los de mayor interés y atiende los que no convierten.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/asesor/captacion" className="btn btn-outline text-sm">Captar nuevo</Link>
          <Link href="/asesor/publicar" className="btn btn-primary text-sm">Publicar con IA</Link>
        </div>
      </div>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total en cartera" value={props.length} hint={`${disponibles} disponibles`} />
        <StatCard label="Alquilados" value={alquilados} hint={`${props.length ? Math.round((alquilados / props.length) * 100) : 0}% ocupación`} />
        <StatCard label="Vistas (7 días)" value={analytics.totalExposure.views} hint={`${analytics.totalExposure.leads} leads`} highlight />
        <StatCard label="Portafolio mensual" value={formatUSD(portfolioMensual)} hint="Si todo se alquila" />
      </section>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm min-w-[820px]">
          <thead className="bg-[color:var(--color-bg)] text-left text-xs uppercase tracking-wider text-[color:var(--color-fg-soft)]">
            <tr>
              <th className="px-4 py-3 font-semibold">Inmueble</th>
              <th className="px-4 py-3 font-semibold">Tipo</th>
              <th className="px-4 py-3 font-semibold">Ciudad</th>
              <th className="px-4 py-3 font-semibold">Precio</th>
              <th className="px-4 py-3 font-semibold">Hab/Baño</th>
              <th className="px-4 py-3 font-semibold">Vistas</th>
              <th className="px-4 py-3 font-semibold">Leads</th>
              <th className="px-4 py-3 font-semibold">Conv.</th>
              <th className="px-4 py-3 font-semibold">Interés</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {props.map((p) => {
              const m = analytics.metricsByProperty.get(p.id);
              return (
                <tr key={p.id} className="border-t border-[color:var(--color-border)]">
                  <td className="px-4 py-3">
                    <Link href={`/inmueble/${p.id}`} className="font-medium hover:text-[color:var(--color-brand-700)] line-clamp-1">
                      {p.title.replace(/^Llave:\s*/, "")}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[color:var(--color-fg-muted)]">{formatPropertyType(p.type)}</td>
                  <td className="px-4 py-3 text-[color:var(--color-fg-muted)]">{p.city}</td>
                  <td className="px-4 py-3 font-semibold">{formatUSD(p.price_usd)}</td>
                  <td className="px-4 py-3 text-[color:var(--color-fg-muted)]">{p.rooms}/{p.bathrooms}</td>
                  <td className="px-4 py-3 font-semibold">{m?.views ?? 0}</td>
                  <td className="px-4 py-3">{m?.leads ?? 0}</td>
                  <td className="px-4 py-3 text-[color:var(--color-fg-muted)]">{m?.conversionViewToLead ?? 0}%</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center justify-center min-w-9 px-2 py-0.5 rounded-md text-xs font-bold ${
                        (m?.engagementScore ?? 0) >= 75
                          ? "bg-[color:var(--color-brand-500)] text-white"
                          : (m?.engagementScore ?? 0) >= 55
                            ? "bg-[color:var(--color-accent)] text-[color:var(--color-brand-900)]"
                            : "bg-[color:var(--color-border)] text-[color:var(--color-fg)]"
                      }`}
                    >
                      {m?.engagementScore ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3"><span className="chip">{p.status}</span></td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/inmueble/${p.id}`} className="text-[color:var(--color-brand-700)] hover:underline text-xs whitespace-nowrap">
                      Ver →
                    </Link>
                  </td>
                </tr>
              );
            })}
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
