import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SUPABASE_ENABLED } from "@/lib/supabase/env";
import { formatUSD } from "@/lib/format";
import type { Property } from "@/lib/types";
import { listAllProperties, listLeadsForOwner } from "@/lib/db/queries";
import { getViewsByProperty, getViewsTimeSeries } from "@/lib/db/views";
import { getGreeting } from "@/lib/greeting";

export const dynamic = "force-dynamic";

export default async function PropietarioPage() {
  let userEmail: string | null = null;
  let fullName: string | null = null;
  let ownerId: string | null = null;
  let myProps: Property[] = [];

  if (SUPABASE_ENABLED) {
    const supa = await createSupabaseServerClient();
    const { data: { user } } = (await supa?.auth.getUser()) ?? { data: { user: null } };
    if (!user) redirect("/login");
    userEmail = user.email ?? null;
    ownerId = user.id;
    const { data: profile } = await supa!
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile?.role) redirect("/onboarding");
    fullName = profile.full_name;

    const { data: props } = await supa!
      .from("properties")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });
    myProps = (props ?? []) as Property[];
  }

  // Demo fallback: cuando no hay Supabase mostramos las del DEMO_OWNER así el
  // propietario logueado ve un panel ya poblado y puede entender la vista.
  if (myProps.length === 0) {
    const all = await listAllProperties();
    myProps = all.slice(0, 6);
  }

  const ids = myProps.map((p) => p.id);
  const [viewsMap, timeseries, leads] = await Promise.all([
    getViewsByProperty(ids),
    getViewsTimeSeries(ids),
    listLeadsForOwner(),
  ]);

  const totalViews = ids.reduce((acc, id) => acc + (viewsMap.get(id) ?? 0), 0);
  const totalLeads = leads.length;
  const conversionPct = totalViews ? Math.round((totalLeads / totalViews) * 100) : 0;
  const totalIncome = myProps
    .filter((p) => p.status === "alquilado")
    .reduce((acc, p) => acc + Number(p.price_usd ?? 0), 0);
  const monthlyPotential = myProps.reduce((acc, p) => acc + Number(p.price_usd ?? 0), 0);
  const occupancy = myProps.length === 0 ? 0 : Math.round(
    (myProps.filter((p) => p.status === "alquilado").length / myProps.length) * 100
  );

  const top = [...myProps]
    .map((p) => ({ p, views: viewsMap.get(p.id) ?? 0 }))
    .sort((a, b) => b.views - a.views)[0];

  const greeting = getGreeting(fullName);

  return (
    <div className="container-x py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="chip mb-2">Mi Llave · Propietario</span>
          <h1 className="font-display text-3xl md:text-4xl font-bold">{greeting.full}</h1>
          <p className="text-[color:var(--color-fg-muted)] mt-1">
            Tu cartera, demanda real y leads. Llave protege la operación; tú decides.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/asesor/captacion" className="btn btn-primary">Publicar inmueble</Link>
          <Link href="/chat" className="btn btn-outline">Hablar con Llavero</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Mis inmuebles" value={myProps.length} hint="Publicados o activos" />
        <StatCard label="Vistas (7 días)" value={totalViews} hint="Tráfico real al inmueble" highlight />
        <StatCard label="Leads recibidos" value={totalLeads} hint={`${conversionPct}% conversión`} />
        <StatCard label="Ingreso vigente" value={formatUSD(totalIncome)} hint={`Potencial ${formatUSD(monthlyPotential)}`} />
      </div>

      <section className="grid lg:grid-cols-[1.4fr_1fr] gap-5 mb-10">
        <div className="card p-6">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display text-lg font-semibold">Demanda de tu cartera</h2>
            <span className="text-xs text-[color:var(--color-fg-soft)]">últimos 7 días</span>
          </div>
          <DemandChart data={timeseries} />
          <p className="text-xs text-[color:var(--color-fg-muted)] mt-3">
            Cada barra cuenta los views reales en `/inmueble/[id]`. Cuando suba Supabase contás con desglose por ciudad, tipo y horario.
          </p>
        </div>

        <div className="card p-6">
          <div className="text-xs uppercase tracking-wider text-[color:var(--color-brand-700)] font-semibold mb-1">
            Inmueble más visto
          </div>
          {top ? (
            <>
              <div className="font-display text-lg font-semibold leading-tight mt-1">
                {top.p.title.replace(/^Llave:\s*/, "")}
              </div>
              <div className="text-sm text-[color:var(--color-fg-muted)] mt-1">
                {top.p.city} · {top.p.rooms} hab · {formatUSD(top.p.price_usd)}/mes
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <div className="font-display text-3xl font-bold">{top.views}</div>
                <div className="text-sm text-[color:var(--color-fg-muted)]">views esta semana</div>
              </div>
              <p className="text-xs text-[color:var(--color-fg-muted)] mt-3 leading-relaxed">
                Llavero detecta interés sostenido. Considera responder leads en menos de 1h para cerrar 3x más rápido.
              </p>
              <Link href={`/inmueble/${top.p.id}`} className="btn btn-outline w-full mt-4 text-sm">
                Ver inmueble
              </Link>
            </>
          ) : (
            <div className="text-sm text-[color:var(--color-fg-muted)]">Sin datos aún.</div>
          )}
        </div>
      </section>

      <section className="card overflow-hidden mb-10">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[color:var(--color-border)] bg-[color:var(--color-bg)]">
          <h2 className="font-display text-lg font-semibold">Mis inmuebles</h2>
          <Link href="/asesor/captacion" className="text-sm text-[color:var(--color-brand-700)] hover:underline">+ Nuevo</Link>
        </div>
        {myProps.length === 0 ? (
          <div className="p-10 text-center">
            <div className="text-4xl mb-3">🏠</div>
            <h3 className="font-display text-xl font-semibold">Aún no has publicado un inmueble</h3>
            <p className="text-[color:var(--color-fg-muted)] mt-2 max-w-md mx-auto">
              Toma fotos desde el teléfono, sube un tour 3D si tienes (Gaussian Splat) y publica con ayuda de Llavero.
            </p>
            <Link href="/asesor/captacion" className="btn btn-primary mt-5">Publicar el primero</Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[color:var(--color-bg)] text-left text-xs uppercase tracking-wide text-[color:var(--color-fg-soft)]">
              <tr>
                <th className="px-5 py-3">Inmueble</th>
                <th className="px-5 py-3">Ciudad</th>
                <th className="px-5 py-3">Precio</th>
                <th className="px-5 py-3">Vistas</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {myProps.map((p) => {
                const v = viewsMap.get(p.id) ?? 0;
                return (
                  <tr key={p.id} className="border-t border-[color:var(--color-border)]">
                    <td className="px-5 py-3 font-medium">{p.title.replace(/^Llave:\s*/, "")}</td>
                    <td className="px-5 py-3 text-[color:var(--color-fg-muted)]">{p.city}</td>
                    <td className="px-5 py-3">{formatUSD(Number(p.price_usd))}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1.5 text-[color:var(--color-fg)] font-semibold">
                        {v}
                        <span className="text-[10px] text-[color:var(--color-fg-soft)] font-normal uppercase">views</span>
                      </span>
                    </td>
                    <td className="px-5 py-3"><span className="chip">{p.status}</span></td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`/inmueble/${p.id}`} className="text-[color:var(--color-brand-700)] hover:underline text-xs">Ver →</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <section className="grid md:grid-cols-3 gap-5 mb-10">
        <div className="card p-6">
          <div className="text-xs uppercase tracking-wider text-[color:var(--color-fg-soft)] mb-2">Ocupación</div>
          <div className="font-display text-3xl font-bold">{occupancy}%</div>
          <div className="text-xs text-[color:var(--color-fg-muted)] mt-1">Alquilados / total publicados</div>
          <div className="mt-3 h-1.5 rounded-full bg-[color:var(--color-border)] overflow-hidden">
            <div className="h-full bg-[color:var(--color-brand-500)]" style={{ width: `${occupancy}%` }} />
          </div>
        </div>
        <div className="card p-6 bg-[color:var(--color-brand-50)] border-[color:var(--color-brand-100)]">
          <div className="text-xs uppercase tracking-wider text-[color:var(--color-brand-700)] font-semibold mb-2">Garantía Llave</div>
          <p className="text-sm text-[color:var(--color-fg-muted)]">
            Llave cubre daños no estructurales y mora de hasta 1 mes. Tus inquilinos llegan pre-calificados por Llavero.
          </p>
        </div>
        <div className="card p-6 bg-[color:var(--color-brand-900)] text-white">
          <div className="text-xs uppercase tracking-wider text-white/70 font-semibold mb-2">¿Quieres delegar?</div>
          <p className="text-sm text-white/80">
            Asigna un asesor verificado. Maneja visitas, leads y publicación.
          </p>
          <Link
            href="/chat?context=Necesito%20un%20asesor%20Llave%20para%20gestionar%20mi%20inmueble"
            className="btn btn-primary bg-[color:var(--color-accent)] !text-[color:var(--color-brand-900)] mt-4"
          >
            Pedir asesor
          </Link>
        </div>
      </section>

      {userEmail && (
        <div className="text-xs text-[color:var(--color-fg-soft)] mt-10">Sesión: {userEmail}</div>
      )}
      {ownerId && <input type="hidden" value={ownerId} />}
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
  value: string | number;
  hint: string;
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
      <div className="text-xs text-[color:var(--color-fg-muted)] mt-1">{hint}</div>
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
