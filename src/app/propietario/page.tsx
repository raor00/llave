import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SUPABASE_ENABLED } from "@/lib/supabase/env";
import { formatUSD } from "@/lib/format";
import type { Property } from "@/lib/types";

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

  const totalIncome = myProps
    .filter((p) => p.status === "alquilado")
    .reduce((acc, p) => acc + Number(p.price_usd ?? 0), 0);
  const monthlyPotential = myProps.reduce((acc, p) => acc + Number(p.price_usd ?? 0), 0);
  const occupancy = myProps.length === 0 ? 0 : Math.round(
    (myProps.filter((p) => p.status === "alquilado").length / myProps.length) * 100
  );

  return (
    <div className="container-x py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="chip mb-2">Mi Llave · Propietario</span>
          <h1 className="font-display text-3xl md:text-4xl font-bold">
            Hola{fullName ? `, ${fullName.split(" ")[0]}` : ""}
          </h1>
          <p className="text-[color:var(--color-fg-muted)] mt-1">
            Tus inmuebles, leads y desempeño. Llave protege la operación, tú decides.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/asesor/captacion" className="btn btn-primary">Publicar inmueble</Link>
          <Link href="/chat" className="btn btn-outline">Hablar con Llavero</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Mis inmuebles" value={myProps.length} hint="Publicados o activos" />
        <StatCard label="Ocupación" value={`${occupancy}%`} hint="Alquilados / total" />
        <StatCard label="Ingreso vigente" value={formatUSD(totalIncome)} hint="Solo alquilados" />
        <StatCard label="Potencial mensual" value={formatUSD(monthlyPotential)} hint="Si todo se alquila" />
      </div>

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
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {myProps.map((p) => (
                <tr key={p.id} className="border-t border-[color:var(--color-border)]">
                  <td className="px-5 py-3 font-medium">{p.title.replace(/^Llave:\s*/, "")}</td>
                  <td className="px-5 py-3 text-[color:var(--color-fg-muted)]">{p.city}</td>
                  <td className="px-5 py-3">{formatUSD(Number(p.price_usd))}</td>
                  <td className="px-5 py-3"><span className="chip">{p.status}</span></td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/inmueble/${p.id}`} className="text-[color:var(--color-brand-700)] hover:underline text-xs">Ver →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="grid md:grid-cols-2 gap-5">
        <div className="card p-6">
          <h3 className="font-display text-lg font-semibold mb-2">Garantía Llave</h3>
          <p className="text-sm text-[color:var(--color-fg-muted)]">
            Llave cubre los gastos cubiertos contractualmente (daños no estructurales, mora de hasta 1 mes).
            Inquilinos vienen pre-calificados por Llavero.
          </p>
        </div>
        <div className="card p-6 bg-[color:var(--color-brand-900)] text-white">
          <h3 className="font-display text-lg font-semibold mb-2">¿No quieres administrar?</h3>
          <p className="text-sm text-white/80">
            Asigna un asesor Llave verificado. Maneja captación, visitas y leads por una comisión transparente.
          </p>
          <Link href="/chat?context=Necesito%20un%20asesor%20Llave%20para%20gestionar%20mi%20inmueble" className="btn btn-primary bg-[color:var(--color-accent)] !text-[color:var(--color-brand-900)] mt-4">
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

function StatCard({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return (
    <div className="card p-5">
      <div className="text-xs text-[color:var(--color-fg-soft)] uppercase tracking-wide">{label}</div>
      <div className="font-display text-3xl font-bold mt-1">{value}</div>
      <div className="text-xs text-[color:var(--color-fg-muted)] mt-1">{hint}</div>
    </div>
  );
}
