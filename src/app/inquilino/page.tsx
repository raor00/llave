import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SUPABASE_ENABLED } from "@/lib/supabase/env";
import { searchProperties } from "@/lib/db/queries";
import { PropertyCard } from "@/components/marketplace/property-card";

export const dynamic = "force-dynamic";

export default async function InquilinoPage() {
  let userEmail: string | null = null;
  let fullName: string | null = null;
  let trustScore = 0;

  if (SUPABASE_ENABLED) {
    const supa = await createSupabaseServerClient();
    const { data: { user } } = (await supa?.auth.getUser()) ?? { data: { user: null } };
    if (!user) redirect("/login");
    userEmail = user.email ?? null;
    const { data: profile } = await supa!
      .from("profiles")
      .select("full_name, role, trust_score")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile?.role) redirect("/onboarding");
    fullName = profile.full_name;
    trustScore = profile.trust_score ?? 0;
  }

  // Suggested properties — using a default budget profile until favorites land
  const suggested = await searchProperties({ price_max: 350, limit: 6 });

  return (
    <div className="container-x py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="chip mb-2">Mi Llave · Inquilino</span>
          <h1 className="font-display text-3xl md:text-4xl font-bold">
            Hola{fullName ? `, ${fullName.split(" ")[0]}` : ""}
          </h1>
          <p className="text-[color:var(--color-fg-muted)] mt-1">
            Encuentra tu próximo inmueble con Llavero. Sin meses adelantados.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/chat" className="btn btn-primary">Pregúntale a Llavero</Link>
          <Link href="/buscar" className="btn btn-outline">Ver inmuebles</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        <StatCard label="Búsquedas guardadas" value="0" hint="Próximamente" />
        <StatCard label="Favoritos" value="0" hint="Marca corazones para guardar" />
        <StatCard label="Visitas agendadas" value="0" hint="A través de Llavero" />
      </div>

      {/* Trust Score — diferenciador único vs Quarto/financieras */}
      <section className="card p-6 mb-10 bg-gradient-to-br from-[color:var(--color-brand-50)] to-white">
        <div className="flex items-baseline justify-between gap-4 mb-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-[color:var(--color-brand-700)] font-semibold mb-1">Llave Trust Score</div>
            <h2 className="font-display text-2xl font-bold">
              {trustScore || 720}
              <span className="text-base font-normal text-[color:var(--color-fg-soft)]"> / 1000</span>
            </h2>
          </div>
          <div className="text-right">
            <div className="text-xs text-[color:var(--color-fg-soft)] uppercase tracking-wide">Nivel</div>
            <div className="font-display text-lg font-semibold text-[color:var(--color-brand-700)]">
              {scoreLevel(trustScore || 720)}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative h-3 rounded-full bg-[color:var(--color-border)] overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[color:var(--color-brand-500)] to-[color:var(--color-accent)]"
            style={{ width: `${Math.min(100, ((trustScore || 720) / 1000) * 100)}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[10px] uppercase tracking-wider text-[color:var(--color-fg-soft)]">
          <span>0 · Inicial</span>
          <span>500 · Confiable</span>
          <span>800 · Premium</span>
          <span>1000</span>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mt-6">
          <ScoreBlock icon="✓" title="+15 cada pago a tiempo" body="Sube tu score con cada renta puntual." />
          <ScoreBlock icon="★" title="+30 al cumplir contrato" body="Cierras un contrato sin novedades, salto grande." />
          <ScoreBlock icon="↑" title="Útil para banca futura" body="Tu Trust Score se exporta como credencial verificable." />
        </div>

        <p className="text-xs text-[color:var(--color-fg-soft)] mt-5">
          Tu Trust Score reemplaza la constancia de trabajo y el RIF como prueba de capacidad de pago.
          A diferencia de modelos tradicionales, lo construyes mientras alquilas — no antes.
        </p>
      </section>

      <section className="mb-10">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display text-xl font-semibold">Para ti</h2>
          <Link href="/buscar" className="text-sm text-[color:var(--color-brand-700)] hover:underline">Ver todos →</Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {suggested.map((p) => (
            <PropertyCard key={p.id} property={p} showCompare={false} />
          ))}
        </div>
      </section>

      <section className="card p-6 bg-[color:var(--color-brand-50)] border-[color:var(--color-brand-100)]">
        <h3 className="font-display text-lg font-semibold">Tu compromiso Llave</h3>
        <p className="text-sm text-[color:var(--color-fg-muted)] mt-2 max-w-2xl">
          Al alquilar con Llave aceptas pagar a tiempo y cuidar el inmueble. Cada pago puntual sube tu Trust Score
          y te abre acceso a mejores inmuebles. {userEmail && <span className="block mt-2 text-xs text-[color:var(--color-fg-soft)]">Sesión: {userEmail}</span>}
        </p>
      </section>
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

function ScoreBlock({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="rounded-lg bg-white border border-[color:var(--color-border)] p-4">
      <div className="size-7 rounded-full bg-[color:var(--color-brand-100)] text-[color:var(--color-brand-700)] grid place-items-center text-sm font-semibold mb-2">
        {icon}
      </div>
      <div className="font-semibold text-sm">{title}</div>
      <div className="text-xs text-[color:var(--color-fg-muted)] mt-1 leading-relaxed">{body}</div>
    </div>
  );
}

function scoreLevel(score: number): string {
  if (score >= 900) return "Élite";
  if (score >= 800) return "Premium";
  if (score >= 600) return "Confiable";
  if (score >= 400) return "En construcción";
  return "Inicial";
}
