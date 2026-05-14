import Link from "next/link";
import Image from "next/image";
import { listAllProperties } from "@/lib/db/queries";
import { PropertyCard } from "@/components/marketplace/property-card";

export const revalidate = 60;

export default async function LandingPage() {
  const all = await listAllProperties();
  const featured = all.slice(0, 6);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-[color:var(--color-brand-50)] via-transparent to-transparent" />
          <div className="absolute -top-32 -right-24 size-[520px] rounded-full bg-[color:var(--color-brand-100)] blur-3xl opacity-50" />
        </div>
        <div className="container-x pt-12 pb-20 md:pt-16 md:pb-28">
          <div className="relative w-full overflow-hidden rounded-[var(--radius-2xl)] shadow-[var(--shadow-pop)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elev)]">
            <Image
              src="/brand/hero.png"
              alt="Llave — Alquilá hoy, sin meses adelantados. Llavero IA te encuentra el inmueble ideal."
              width={1774}
              height={887}
              priority
              className="w-full h-auto"
            />
          </div>

          <div className="mt-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-xl">
              <p className="text-lg md:text-xl text-[color:var(--color-fg-muted)] leading-relaxed">
                Llave conecta a inquilinos con propietarios reales y elimina la fricción del modelo tradicional.
                Pagás un solo mes para entrar, depósito reducido y reembolsable, y tenés a{" "}
                <strong className="text-[color:var(--color-fg)]">Llavero</strong>, un agente IA, ayudándote a encontrar tu próxima casa.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/buscar" className="btn btn-primary px-6 py-3 text-base">
                  Ver Llave
                </Link>
                <Link href="/login" className="btn btn-outline px-6 py-3 text-base">
                  Mi Llave · CRM
                </Link>
                <Link href="/chat" className="btn btn-ghost px-6 py-3 text-base">
                  Hablá con Llavero
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-5 md:max-w-md flex-shrink-0">
              <Stat number="Hoy" label="te mudás" />
              <Stat number="0" label="meses adelantados" />
              <Stat number="1" label="depósito máx." />
              <Stat number="100%" label="reembolsable" />
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEMA */}
      <section id="problema" className="section bg-white border-y">
        <div className="container-x grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="chip chip-muted mb-4">El problema</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">
              Alquilar en Venezuela cuesta más de <span className="text-[color:var(--color-danger)]">$1.000</span> antes de entrar.
            </h2>
            <p className="mt-5 text-lg text-[color:var(--color-fg-muted)] max-w-xl">
              Mes adelantado + depósito + administrativo + comisión. La gente puede pagar $250 al mes pero no tiene los $1.500 para mudarse.
              Eso deja afuera a estudiantes, profesionales jóvenes y familias enteras.
            </p>
            <ul className="mt-7 space-y-3 text-[color:var(--color-fg)]">
              <Bullet>Mes adelantado</Bullet>
              <Bullet>Mes de depósito reembolsable (pero retenido)</Bullet>
              <Bullet>Mes de administrativo no reembolsable</Bullet>
              <Bullet>Mes de comisión al asesor</Bullet>
            </ul>
          </div>
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <CostCard amount="$280" label="Renta mensual" />
              <CostCard amount="$280" label="Mes adelantado" muted />
              <CostCard amount="$280" label="Depósito" muted />
              <CostCard amount="$280" label="Administrativo" muted />
              <CostCard amount="$280" label="Comisión" muted />
              <CostCard amount="$1.400" label="Total fricción" highlight />
            </div>
          </div>
        </div>
      </section>

      {/* MANIFIESTO */}
      <section id="manifiesto" className="section">
        <div className="container-x">
          <div className="max-w-2xl">
            <span className="chip mb-4">Manifiesto Llave</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">
              Volumen sobre fricción. Confianza sobre garantías abusivas.
            </h2>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <PrincipleCard
              title="Sin meses adelantados"
              body="Pagás solo el primer mes. Depósito máximo 1 mes, reembolsable al cumplir el contrato."
            />
            <PrincipleCard
              title="Comisión justa"
              body="Comisiones bajas: el asesor gana por volumen y cliente recurrente, no por exprimir una sola operación."
            />
            <PrincipleCard
              title="Garantía al propietario"
              body="Llave cubre incidentes cubiertos contractualmente. El propietario duerme tranquilo, el inquilino entra sin barreras."
            />
            <PrincipleCard
              title="Reputación que vale"
              body="Cada pago a tiempo construye un perfil de confianza que puede servir incluso para futuras gestiones bancarias."
            />
            <PrincipleCard
              title="Asistente IA real"
              body="Llavero entiende tu situación y conecta con la base real de inmuebles. No es un buscador con esteroides, es un colega."
            />
            <PrincipleCard
              title="CRM para asesores"
              body="Un único lugar para publicar, gestionar leads, ver estadísticas y publicar con ayuda de IA."
            />
          </div>
        </div>
      </section>

      {/* FEATURED INMUEBLES */}
      <section className="section bg-white border-y">
        <div className="container-x">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="chip mb-3">Disponibles ahora</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold">Inmuebles destacados</h2>
            </div>
            <Link href="/buscar" className="btn btn-outline">Ver todos</Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((p) => (
              <PropertyCard key={p.id} property={p} showCompare={false} />
            ))}
          </div>
        </div>
      </section>

      {/* AGENTE */}
      <section id="llavero" className="section">
        <div className="container-x grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="chip mb-4">Llavero IA</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">
              Un agente que <em className="not-italic gradient-text">entiende</em> tu situación.
            </h2>
            <p className="mt-5 text-lg text-[color:var(--color-fg-muted)]">
              Llavero conversa, pregunta lo justo, busca en la base real de Llave y te muestra opciones honestas. Para asesores,
              redacta publicaciones y sugiere precios con comparables.
            </p>
            <ul className="mt-6 space-y-2 text-[color:var(--color-fg)]">
              <Bullet positive>Búsqueda conversacional</Bullet>
              <Bullet positive>Recomendaciones por perfil</Bullet>
              <Bullet positive>Comparación lado a lado</Bullet>
              <Bullet positive>Agenda de visitas</Bullet>
              <Bullet positive>Asistente para asesores</Bullet>
            </ul>
            <div className="mt-7">
              <Link href="/chat" className="btn btn-primary px-6 py-3 text-base">Abrir Llavero</Link>
            </div>
          </div>
          <div className="card p-6 floaty">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 rounded-full bg-[color:var(--color-brand-100)] flex items-center justify-center">
                <span className="text-xl">🗝️</span>
              </div>
              <div>
                <div className="font-semibold">Llavero</div>
                <div className="text-xs text-[color:var(--color-fg-soft)]">Asistente IA · en línea</div>
              </div>
            </div>
            <ChatBubble who="user">
              Busco apto en Caracas máximo $300, 2 ambientes, planta eléctrica.
            </ChatBubble>
            <ChatBubble who="ai">
              Te muestro 3 opciones que encajan. <strong>Estudio amoblado en Chacao ($200)</strong> tiene wifi y planta, ideal si vivís solo o con pareja.
              <strong> Apto en Las Mercedes ($280)</strong> es más amplio (2 hab, 85m²) con seguridad 24/7. <strong>Catia ($150)</strong> si el presupuesto es justo.
              ¿Cuál te ronda?
            </ChatBubble>
          </div>
        </div>
      </section>

      {/* ASESORES */}
      <section id="asesores" className="section bg-[color:var(--color-brand-900)] text-white">
        <div className="container-x grid md:grid-cols-[1.2fr_1fr] gap-12 items-center">
          <div>
            <span className="chip bg-white/10 text-white border-white/20 mb-4">Para asesores y propietarios</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">
              Un CRM que <span className="text-[color:var(--color-accent)]">trabaja con vos</span>, no contra vos.
            </h2>
            <p className="mt-5 text-lg text-white/80 max-w-xl">
              Captás un inmueble desde el teléfono con la cámara, lo publicás con ayuda de Llavero,
              recibís leads pre-calificados y los gestionás desde un solo panel. Cmd+K para volar
              entre secciones.
            </p>
            <ul className="mt-6 space-y-2 text-white/90">
              <li className="flex items-center gap-2"><span className="text-[color:var(--color-accent)]">▣</span> Dashboard con stats reales</li>
              <li className="flex items-center gap-2"><span className="text-[color:var(--color-accent)]">◉</span> Captación con cámara + tour 3D Gaussian Splat</li>
              <li className="flex items-center gap-2"><span className="text-[color:var(--color-accent)]">✦</span> Publicación asistida por IA</li>
              <li className="flex items-center gap-2"><span className="text-[color:var(--color-accent)]">◎</span> Leads con resumen del agente</li>
            </ul>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/login" className="btn btn-primary bg-[color:var(--color-accent)] !text-[color:var(--color-brand-900)] hover:opacity-90 px-6 py-3 text-base">
                Mi Llave · Ingresar
              </Link>
              <Link href="/asesor" className="btn btn-outline border-white/40 text-white hover:bg-white/10 px-6 py-3 text-base">
                Ver demo del CRM
              </Link>
            </div>
          </div>
          <div className="card p-5 bg-white/5 border-white/10 backdrop-blur">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-white/10 p-4">
                <div className="text-white/60 text-xs uppercase tracking-wide">Inmuebles activos</div>
                <div className="font-display text-2xl font-bold text-white mt-1">17</div>
              </div>
              <div className="rounded-lg bg-white/10 p-4">
                <div className="text-white/60 text-xs uppercase tracking-wide">Leads del mes</div>
                <div className="font-display text-2xl font-bold text-white mt-1">2</div>
              </div>
              <div className="rounded-lg bg-white/10 p-4">
                <div className="text-white/60 text-xs uppercase tracking-wide">Tasa agendado</div>
                <div className="font-display text-2xl font-bold text-white mt-1">50%</div>
              </div>
              <div className="rounded-lg bg-white/10 p-4">
                <div className="text-white/60 text-xs uppercase tracking-wide">Portafolio</div>
                <div className="font-display text-2xl font-bold text-white mt-1">$5.6k</div>
              </div>
            </div>
            <div className="mt-4 rounded-lg bg-[color:var(--color-accent)]/10 border border-[color:var(--color-accent)]/30 p-3 text-xs text-white/90">
              Datos en vivo desde el seed. Conectado a Supabase pasa a producción real.
            </div>
          </div>
        </div>
      </section>

      {/* ROADMAP */}
      <section id="roadmap" className="section bg-white border-y">
        <div className="container-x">
          <div className="max-w-2xl">
            <span className="chip chip-muted mb-3">Roadmap visible</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">
              Lo que viene después del MVP.
            </h2>
            <p className="mt-4 text-[color:var(--color-fg-muted)]">
              Lo de hoy ya funciona. Lo que sigue: escaneo 3D con LiDAR, contratos digitales, integración Meta Ads,
              redes sociales unificadas y perfil crediticio emergente para acceso a banca.
            </p>
          </div>
          <div className="mt-10 grid md:grid-cols-4 gap-5">
            <RoadmapStep title="LiDAR 3D tours" body="Escaneo desde iPhone para tours sin visita física" />
            <RoadmapStep title="Contratos digitales" body="Generados, firmados y guardados dentro de Llave" />
            <RoadmapStep title="Redes + Meta Ads" body="Publicar y promocionar desde un solo panel" />
            <RoadmapStep title="Perfil crediticio" body="Reputación de pagos útil para abrir puertas a banca" />
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="font-display text-3xl font-bold text-[color:var(--color-brand-700)]">{number}</div>
      <div className="text-xs text-[color:var(--color-fg-soft)] mt-1 uppercase tracking-wide">{label}</div>
    </div>
  );
}

function Bullet({ children, positive }: { children: React.ReactNode; positive?: boolean }) {
  return (
    <li className="flex items-start gap-2">
      <span
        className={`mt-1.5 size-1.5 rounded-full ${positive ? "bg-[color:var(--color-brand-500)]" : "bg-[color:var(--color-danger)]"}`}
      />
      <span>{children}</span>
    </li>
  );
}

function CostCard({
  amount,
  label,
  muted,
  highlight,
}: {
  amount: string;
  label: string;
  muted?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`card p-5 ${highlight ? "bg-[color:var(--color-brand-900)] text-white border-[color:var(--color-brand-900)]" : ""}`}
    >
      <div className={`text-2xl font-display font-bold ${muted && !highlight ? "line-through opacity-50" : ""}`}>
        {amount}
      </div>
      <div className={`text-xs mt-1 ${highlight ? "text-white/70" : "text-[color:var(--color-fg-soft)]"}`}>{label}</div>
    </div>
  );
}

function PrincipleCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="card p-6">
      <div className="size-9 rounded-full bg-[color:var(--color-brand-100)] mb-4 flex items-center justify-center text-lg">
        ✓
      </div>
      <h3 className="font-display text-xl font-semibold mb-2">{title}</h3>
      <p className="text-sm text-[color:var(--color-fg-muted)] leading-relaxed">{body}</p>
    </div>
  );
}

function RoadmapStep({ title, body }: { title: string; body: string }) {
  return (
    <div className="card p-5">
      <div className="text-xs font-bold text-[color:var(--color-brand-500)] uppercase tracking-wide">Pronto</div>
      <div className="font-display font-semibold mt-1">{title}</div>
      <p className="text-sm text-[color:var(--color-fg-muted)] mt-2">{body}</p>
    </div>
  );
}

function ChatBubble({ who, children }: { who: "user" | "ai"; children: React.ReactNode }) {
  const isAi = who === "ai";
  return (
    <div
      className={`mb-3 max-w-[90%] rounded-2xl px-4 py-3 text-sm ${
        isAi
          ? "bg-[color:var(--color-brand-50)] text-[color:var(--color-fg)] mr-auto"
          : "bg-[color:var(--color-fg)] text-white ml-auto"
      }`}
    >
      {children}
    </div>
  );
}
