import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SUPABASE_ENABLED } from "@/lib/supabase/env";
import { searchProperties } from "@/lib/db/queries";
import { getActiveContractForTenant } from "@/lib/db/contracts";
import { PropertyCard } from "@/components/marketplace/property-card";
import { formatUSD } from "@/lib/format";
import { getGreeting } from "@/lib/greeting";

export const dynamic = "force-dynamic";

export default async function InquilinoPage() {
  let userEmail: string | null = null;
  let userId: string = "demo-tenant";
  let fullName: string | null = null;
  let trustScore = 0;

  if (SUPABASE_ENABLED) {
    const supa = await createSupabaseServerClient();
    const { data: { user } } = (await supa?.auth.getUser()) ?? { data: { user: null } };
    if (!user) redirect("/login");
    userEmail = user.email ?? null;
    userId = user.id;
    const { data: profile } = await supa!
      .from("profiles")
      .select("full_name, role, trust_score")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile?.role) redirect("/onboarding");
    fullName = profile.full_name;
    trustScore = profile.trust_score ?? 0;
  }

  const contractStatus = await getActiveContractForTenant(userId);
  const suggested = await searchProperties({ price_max: 350, limit: 6 });
  const greeting = getGreeting(fullName);

  return (
    <div className="container-x py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="chip mb-2">Mi Llave · Inquilino</span>
          <h1 className="font-display text-3xl md:text-4xl font-bold">{greeting.full}</h1>
          <p className="text-[color:var(--color-fg-muted)] mt-1">
            Encuentra tu próximo inmueble con Llavero. Sin meses adelantados.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/chat" className="btn btn-primary">Pregúntale a Llavero</Link>
          <Link href="/buscar" className="btn btn-outline">Ver inmuebles</Link>
        </div>
      </div>

      {/* Contrato activo */}
      {contractStatus && (
        <section className="card p-6 mb-10 bg-gradient-to-br from-[color:var(--color-brand-50)] to-white overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="text-xs uppercase tracking-wider text-[color:var(--color-brand-700)] font-semibold mb-1">
                Tu contrato Llave
              </div>
              <h2 className="font-display text-2xl font-bold leading-tight">
                {contractStatus.contract.property?.title.replace(/^Llave:\s*/, "") ?? "Inmueble Llave"}
              </h2>
              <div className="text-sm text-[color:var(--color-fg-muted)] mt-1">
                {contractStatus.contract.property?.address} · {contractStatus.contract.property?.city}
              </div>

              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Mini label="Mes" value={`${contractStatus.monthsElapsed}/${contractStatus.contract.months_total}`} />
                <Mini label="Restantes" value={`${contractStatus.monthsRemaining} mes${contractStatus.monthsRemaining === 1 ? "" : "es"}`} highlight />
                <Mini label="Mensualidad" value={formatUSD(contractStatus.contract.monthly_amount)} />
                <Mini label="Próximo pago" value={`Día ${contractStatus.nextPaymentDay}`} />
              </div>

              <div className="mt-5">
                <div className="flex justify-between text-[11px] uppercase tracking-wider text-[color:var(--color-fg-soft)] mb-1.5">
                  <span>Inicio</span>
                  <span>{contractStatus.progressPct}% recorrido</span>
                  <span>Renovación</span>
                </div>
                <div className="h-2.5 rounded-full bg-[color:var(--color-border)] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[color:var(--color-brand-500)] to-[color:var(--color-accent)]"
                    style={{ width: `${contractStatus.progressPct}%` }}
                  />
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Link href={`/inmueble/${contractStatus.contract.property_id}`} className="btn btn-outline text-xs !py-1.5">
                  Ver mi inmueble
                </Link>
                <Link
                  href={`/chat?context=${encodeURIComponent("Quiero ver mi contrato Llave y mi historial de pagos")}`}
                  className="btn btn-outline text-xs !py-1.5"
                >
                  Hablar con Llavero
                </Link>
                {contractStatus.monthsRemaining <= 3 && (
                  <Link
                    href={`/chat?context=${encodeURIComponent("Quiero renovar mi contrato")}`}
                    className="btn btn-primary text-xs !py-1.5"
                  >
                    Renovar contrato
                  </Link>
                )}
              </div>
            </div>

            <div className="lg:w-72 rounded-[var(--radius-lg)] bg-[color:var(--color-brand-900)] text-white p-5 flex flex-col justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-white/70 font-semibold mb-1">Garantía 360°</div>
                <p className="text-sm text-white/90 leading-relaxed">
                  Llave responde por daños cubiertos y respalda tu contrato. Tu Trust Score sube +15 con cada pago a tiempo.
                </p>
              </div>
              <Link
                href={`/chat?context=${encodeURIComponent("Necesito reportar un incidente cubierto por la Garantía Llave")}`}
                className="btn btn-primary bg-[color:var(--color-accent)] !text-[color:var(--color-brand-900)] mt-4 text-xs !py-1.5"
              >
                Reportar incidente
              </Link>
            </div>
          </div>
        </section>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        <StatCard label="Búsquedas guardadas" value="3" hint="Llavero las usa para predecir tu próximo inmueble" />
        <StatCard label="Favoritos" value="0" hint="Marca corazones para guardar" />
        <StatCard
          label="Próxima visita"
          value={contractStatus && contractStatus.monthsRemaining <= 3 ? "Renovación" : "—"}
          hint="A través de Llavero"
        />
      </div>

      {/* Trust Score */}
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
          <ScoreBlock icon="★" title="+30 al cumplir contrato" body="Cerrás un contrato sin novedades, salto grande." />
          <ScoreBlock icon="↑" title="Útil para banca futura" body="Tu Trust Score se exporta como credencial verificable." />
        </div>

        <p className="text-xs text-[color:var(--color-fg-soft)] mt-5">
          Tu Trust Score reemplaza la constancia de trabajo y el RIF como prueba de capacidad de pago.
          A diferencia de modelos tradicionales, lo construyes mientras alquilas — no antes.
        </p>
      </section>

      <section className="mb-10">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h2 className="font-display text-xl font-semibold">Llavero te sugiere</h2>
            <p className="text-xs text-[color:var(--color-fg-soft)] mt-0.5">
              Predicción basada en tu tráfico, búsquedas y zona del contrato actual.
            </p>
          </div>
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

function Mini({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border p-3 ${highlight ? "bg-[color:var(--color-brand-500)] text-white border-[color:var(--color-brand-500)]" : "bg-white border-[color:var(--color-border)]"}`}>
      <div className={`text-[10px] uppercase tracking-wider ${highlight ? "text-white/80" : "text-[color:var(--color-fg-soft)]"}`}>{label}</div>
      <div className={`font-display text-lg font-bold mt-0.5 ${highlight ? "text-white" : ""}`}>{value}</div>
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
