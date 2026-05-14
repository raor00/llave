import Link from "next/link";
import Image from "next/image";
import { listAllProperties } from "@/lib/db/queries";
import { PropertyCard } from "@/components/marketplace/property-card";
import { FadeIn, FadeInChild, FadeInStagger } from "@/components/landing/fade-in";
import { CrmMockup } from "@/components/landing/crm-mockup";
import { ScrollProgress } from "@/components/landing/scroll-progress";
import { DiasporaMap } from "@/components/landing/diaspora-map";
import {
  IconDashboard,
  IconCapture,
  IconSparkle,
  IconLeads,
} from "@/components/dashboard-icons";
import { IconMeta, IconInstagram } from "@/components/social-icons";

export const revalidate = 60;

export default async function LandingPage() {
  const all = await listAllProperties();
  const featured = all.slice(0, 6);

  return (
    <>
      <ScrollProgress />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-[color:var(--color-brand-50)] via-transparent to-transparent" />
          <div className="absolute -top-32 -right-24 size-[520px] rounded-full bg-[color:var(--color-brand-100)] blur-3xl opacity-50" />
        </div>
        <div className="container-x pt-12 pb-20 md:pt-16 md:pb-28">
          {/* Differentiator strip — directly attacks Quarto's heavy-doc requirement */}
          <FadeIn className="mb-6 flex flex-wrap items-center gap-3 justify-center text-sm" y={12}>
            <span className="chip">
              <span className="size-1.5 rounded-full bg-[color:var(--color-brand-500)]" />
              Sin RIF
            </span>
            <span className="chip">
              <span className="size-1.5 rounded-full bg-[color:var(--color-brand-500)]" />
              Sin constancia de trabajo
            </span>
            <span className="chip">
              <span className="size-1.5 rounded-full bg-[color:var(--color-brand-500)]" />
              Sin esperar 2 semanas
            </span>
            <span className="chip bg-[color:var(--color-fg)] text-white border-transparent">
              Solo cédula + Llavero
            </span>
          </FadeIn>

          <FadeIn y={32}>
            <div className="relative w-full overflow-hidden rounded-[var(--radius-2xl)] shadow-[var(--shadow-pop)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elev)]">
              <Image
                src="/brand/hero.png"
                alt="Llave — Alquila en 24 horas. Sin papeles que no tienes."
                width={1774}
                height={887}
                priority
                className="w-full h-auto"
              />
            </div>
          </FadeIn>

          <FadeIn delay={0.15} y={20}>
            <div className="mt-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-xl">
                <p className="text-lg md:text-xl text-[color:var(--color-fg-muted)] leading-relaxed">
                  Alquila en <strong className="text-[color:var(--color-fg)]">24 horas</strong>, sin RIF ni constancia de trabajo,
                  sin esperar dos semanas. Tu reputación se construye pagando, no presentando papeles que no tienes.
                  Con <strong className="text-[color:var(--color-fg)]">Llavero</strong>, un agente IA que te entiende,
                  no te interroga.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link href="/buscar" className="btn btn-primary px-6 py-3 text-base">
                    Ver Llave
                  </Link>
                  <Link href="/login" className="btn btn-outline px-6 py-3 text-base">
                    Mi Llave · CRM
                  </Link>
                  <Link href="/chat" className="btn btn-ghost px-6 py-3 text-base">
                    Habla con Llavero
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-5 md:max-w-md flex-shrink-0">
                <Stat number="24h" label="te mudas" />
                <Stat number="0" label="meses adelantados" />
                <Stat number="0" label="depósito" />
                <Stat number="100%" label="Llave responde" />
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* COMPARATIVA — Llave vs el método tradicional */}
      <section id="comparativa" className="section bg-white border-y">
        <div className="container-x">
          <FadeIn className="max-w-3xl mb-12">
            <span className="chip chip-muted mb-3">La diferencia</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">
              Otros te <span className="text-[color:var(--color-danger)]">financian la fricción</span>. Llave la <span className="text-[color:var(--color-brand-500)]">elimina</span>.
            </h2>
            <p className="mt-4 text-[color:var(--color-fg-muted)] text-lg">
              Quitar el "mes adelantado" no sirve si te exigen RIF, constancia de trabajo, movimientos bancarios y dos
              semanas de espera. El 60% de Venezuela trabaja informal y queda afuera. Llave los incluye.
            </p>
          </FadeIn>

          <FadeIn>
            <div className="card overflow-hidden">
              <div className="grid grid-cols-[1.4fr_1fr_1fr] text-sm">
                <CompareRow head label="" llave="Llave" other="Modelo tradicional / fintech" />
                <CompareRow label="Documentos para alquilar" llave="Solo cédula" other="Cédula + RIF + constancia + movimientos + redes verificadas" />
                <CompareRow label="Tiempo de aprobación" llave="24 a 48 horas" other="1 a 2 semanas" />
                <CompareRow label="Pago al mudarte" llave="Solo 1 mes de alquiler" other="1 mes + 1 comisión + 1 garantía (no reembolsables)" />
                <CompareRow label="Depósito en garantía" llave="Cero — Llave responde" other="1 mes adicional (a veces 'si se requiere')" />
                <CompareRow label="Comisión al inquilino" llave="Cero" other="1 mes (no reembolsable)" />
                <CompareRow label="Cosignatarios requeridos" llave="Ninguno" other="Hasta 5 con 2.0–2.5x ingreso sumado" />
                <CompareRow label="Trabajo informal / freelance" llave="Aceptado con Trust Score" other="Excluido (sin constancia)" />
                <CompareRow label="Tour 3D antes de visitar" llave="Sí, Gaussian Splat + LiDAR" other="Solo fotos" />
                <CompareRow label="Agente IA conversacional" llave="Llavero (Claude Sonnet)" other="Formularios y validaciones" />
                <CompareRow label="Construye reputación crediticia" llave="Trust Score útil para banca" other="No genera historial" />
                <CompareRow label="Para venezolanos en diáspora" llave="Recorrido virtual + agente remoto" other="Visita presencial obligatoria" />
                <CompareRow label="CRM para asesores" llave="Captación móvil + Meta Ads + IA" other="Marketplace solamente" />
              </div>
            </div>
          </FadeIn>

          {/* Cost reveal — destruye el marketing engañoso de "sin meses adelantados" */}
          <FadeIn delay={0.1} className="mt-8 grid md:grid-cols-2 gap-5">
            <div className="card p-6 border-[color:var(--color-danger)]/30 bg-white">
              <div className="text-xs uppercase tracking-wider text-[color:var(--color-danger)] font-semibold mb-3">
                El truco del "sin meses adelantados"
              </div>
              <p className="text-sm text-[color:var(--color-fg-muted)] leading-relaxed mb-4">
                Otros publican "sin meses, sin depósito" en el banner pero en la letra chica te piden:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between gap-3"><span>1 mes de alquiler</span><strong>$280</strong></li>
                <li className="flex justify-between gap-3"><span>1 mes de comisión a la plataforma</span><strong>$280</strong></li>
                <li className="flex justify-between gap-3"><span>1 mes de garantía (si se requiere)</span><strong>$280</strong></li>
                <li className="border-t border-[color:var(--color-border)] pt-2 mt-2 flex justify-between gap-3">
                  <span className="font-semibold">Total upfront</span>
                  <strong className="text-[color:var(--color-danger)]">$840</strong>
                </li>
                <li className="flex justify-between gap-3 text-xs text-[color:var(--color-fg-soft)]">
                  <span>De los cuales NO se reembolsan</span><strong>$560</strong>
                </li>
              </ul>
            </div>
            <div className="card p-6 border-[color:var(--color-brand-500)] bg-[color:var(--color-brand-50)]">
              <div className="text-xs uppercase tracking-wider text-[color:var(--color-brand-700)] font-semibold mb-3">
                Lo que pagas en Llave
              </div>
              <p className="text-sm text-[color:var(--color-fg-muted)] leading-relaxed mb-4">
                Cero comisiones, cero depósito. Solo 1 mes de alquiler. Llave responde por la propiedad.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between gap-3"><span>1 mes de alquiler</span><strong>$280</strong></li>
                <li className="flex justify-between gap-3 text-[color:var(--color-fg-soft)]"><span>Depósito en garantía</span><strong>$0</strong></li>
                <li className="flex justify-between gap-3 text-[color:var(--color-fg-soft)]"><span>Comisión al inquilino</span><strong>$0</strong></li>
                <li className="border-t border-[color:var(--color-brand-300)] pt-2 mt-2 flex justify-between gap-3">
                  <span className="font-semibold">Total upfront</span>
                  <strong className="text-[color:var(--color-brand-700)]">$280</strong>
                </li>
                <li className="flex justify-between gap-3 text-xs text-[color:var(--color-brand-600)]">
                  <span>Llave responde por daños</span><strong>Incluido</strong>
                </li>
              </ul>
              <div className="mt-4 rounded-lg bg-white border border-[color:var(--color-brand-300)] p-3 text-xs leading-relaxed text-[color:var(--color-brand-700)]">
                <strong>Ahorras $560 al mudarte</strong>{" "}respecto al modelo tradicional con &quot;cero meses adelantados&quot;.
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.1} className="mt-8 grid md:grid-cols-2 gap-4">
            <div className="card p-6 bg-[color:var(--color-brand-50)] border-[color:var(--color-brand-100)]">
              <div className="text-xs uppercase tracking-wider text-[color:var(--color-brand-700)] font-semibold mb-2">El insight</div>
              <p className="text-[color:var(--color-fg)] font-medium leading-relaxed">
                "Sin meses adelantados" sin tocar la lista de requisitos sigue dejando afuera al{" "}
                <strong>60% de la economía informal venezolana</strong>. Llave entra por esa grieta.
              </p>
            </div>
            <div className="card p-6">
              <div className="text-xs uppercase tracking-wider text-[color:var(--color-fg-soft)] font-semibold mb-2">Mercado real</div>
              <p className="text-[color:var(--color-fg-muted)] leading-relaxed">
                Llave sirve a estudiantes universitarios, profesionales jóvenes en USD sin recibo formal,
                trabajadores informales, adultos mayores sin movimientos bancarios, y a la diáspora venezolana
                de 7-8M de personas que necesita alquilar desde el exterior.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* PROBLEMA */}
      <section id="problema" className="section">
        <div className="container-x grid md:grid-cols-2 gap-12 items-center">
          <FadeIn>
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
          </FadeIn>
          <FadeInStagger className="grid grid-cols-2 gap-4" stagger={0.06}>
            <FadeInChild><CostCard amount="$280" label="Renta mensual" /></FadeInChild>
            <FadeInChild><CostCard amount="$280" label="Mes adelantado" muted /></FadeInChild>
            <FadeInChild><CostCard amount="$280" label="Depósito" muted /></FadeInChild>
            <FadeInChild><CostCard amount="$280" label="Administrativo" muted /></FadeInChild>
            <FadeInChild><CostCard amount="$280" label="Comisión" muted /></FadeInChild>
            <FadeInChild><CostCard amount="$1.400" label="Total fricción" highlight /></FadeInChild>
          </FadeInStagger>
        </div>
      </section>

      {/* DIÁSPORA */}
      <section id="diaspora" className="section bg-[color:var(--color-brand-50)] border-y">
        <div className="container-x grid md:grid-cols-[1fr_1.2fr] gap-12 items-center">
          <FadeIn>
            <span className="chip mb-4">Para la diáspora venezolana</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">
              ¿Vives en <span className="gradient-text">Madrid, Bogotá, Buenos Aires o Miami</span>?
              <br />
              Recorre antes de mudarte.
            </h2>
            <p className="mt-5 text-lg text-[color:var(--color-fg-muted)]">
              7 a 8 millones de venezolanos viven fuera. Muchos vuelven, otros alquilan para su familia.
              Con Llave recorres el inmueble en 3D, ves paredes, baños y la vista al Ávila sin tomar un vuelo.
              Llavero negocia, agenda y firma desde la app.
            </p>
            <ul className="mt-6 space-y-2 text-[color:var(--color-fg)]">
              <Bullet positive>Tour 3D Gaussian Splat con recorrido inmersivo</Bullet>
              <Bullet positive>Llavero coordina la visita con un asesor local</Bullet>
              <Bullet positive>Firma de contrato remota</Bullet>
              <Bullet positive>Tu cédula vale igual desde el exterior</Bullet>
            </ul>
            <div className="mt-7">
              <Link href="/buscar" className="btn btn-primary px-6 py-3 text-base">
                Recorrer inmuebles
              </Link>
            </div>
          </FadeIn>
          <FadeIn delay={0.15}>
            <DiasporaMap />
          </FadeIn>
        </div>
      </section>

      {/* MANIFIESTO */}
      <section id="manifiesto" className="section">
        <div className="container-x">
          <FadeIn className="max-w-2xl">
            <span className="chip mb-4">Manifiesto Llave</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">
              Inclusión sobre exclusión. Reputación sobre papeleo.
            </h2>
          </FadeIn>
          <FadeInStagger className="mt-12 grid md:grid-cols-3 gap-6" stagger={0.08}>
            <FadeInChild>
              <PrincipleCard
                title="Sin papeles que no tienes"
                body="Solo cédula. No exigimos RIF, ni constancia de trabajo, ni movimientos bancarios. Tu Trust Score se construye pagando."
              />
            </FadeInChild>
            <FadeInChild>
              <PrincipleCard
                title="Trust Score progresivo"
                body="Cada pago a tiempo sube tu score. En el camino, tu reputación de inquilino vale incluso para gestiones bancarias futuras."
              />
            </FadeInChild>
            <FadeInChild>
              <PrincipleCard
                title="Cero depósito. Llave responde."
                body="No te pedimos depósito. El fondo Llave cubre daños cubiertos por contrato. Pagas solo el primer mes para mudarte."
              />
            </FadeInChild>
            <FadeInChild>
              <PrincipleCard
                title="Tour 3D antes de visitar"
                body="Cada inmueble lleva un recorrido inmersivo Gaussian Splat. Decides antes de tomar el taxi — o el avión."
              />
            </FadeInChild>
            <FadeInChild>
              <PrincipleCard
                title="Llavero te entiende"
                body="Un agente IA real evalúa contexto, no formularios. Si tu situación es atípica, Llavero busca igual."
              />
            </FadeInChild>
            <FadeInChild>
              <PrincipleCard
                title="CRM para asesores"
                body="Captación móvil con cámara, publicación con IA, leads pre-calificados, redes sociales y Meta Ads en un solo panel."
              />
            </FadeInChild>
          </FadeInStagger>
        </div>
      </section>

      {/* GARANTÍA LLAVE 360° */}
      <section id="garantia" className="section bg-white border-y">
        <div className="container-x">
          <FadeIn className="max-w-3xl mb-12">
            <span className="chip mb-3">Garantía Llave 360°</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">
              Cero depósito. <span className="gradient-text">Llave responde</span>.
            </h2>
            <p className="mt-4 text-lg text-[color:var(--color-fg-muted)]">
              El propietario duerme tranquilo, el inquilino entra sin barreras. En lugar de pedir un mes de
              depósito al inquilino, <strong className="text-[color:var(--color-fg)]">Llave asume la garantía</strong> con
              un sistema de 5 capas: verificación previa, protocolo firmado, fondo de respaldo,
              gestión SUNAVI y supervisión periódica.
            </p>
          </FadeIn>

          <FadeInStagger className="grid md:grid-cols-2 lg:grid-cols-5 gap-4" stagger={0.08}>
            <FadeInChild>
              <GuaranteeCard
                step="01"
                title="Verificación previa"
                body="Trust Score, cédula y validación con Llavero IA antes de firmar. Filtramos inquilinos que no puedan cumplir."
              />
            </FadeInChild>
            <FadeInChild>
              <GuaranteeCard
                step="02"
                title="Protocolo firmado"
                body="El inquilino firma digitalmente un protocolo de convivencia: cuidado, ruidos, normas. Vinculante."
              />
            </FadeInChild>
            <FadeInChild>
              <GuaranteeCard
                step="03"
                title="Fondo Llave"
                body="Cubre daños cubiertos por contrato (no estructurales) y hasta 1 mes de mora. Sin papeleo al propietario."
              />
            </FadeInChild>
            <FadeInChild>
              <GuaranteeCard
                step="04"
                title="Gestión SUNAVI"
                body="Si hay incumplimiento, Llave inicia y acompaña el procedimiento conciliatorio. No estás solo."
              />
            </FadeInChild>
            <FadeInChild>
              <GuaranteeCard
                step="05"
                title="Supervisión"
                body="Inspección remota cada 6 meses con fotos georeferenciadas. Anomalías se reportan al propietario al instante."
              />
            </FadeInChild>
          </FadeInStagger>

          <div className="mt-10 grid md:grid-cols-2 gap-5">
            <div className="card p-6">
              <div className="text-xs uppercase tracking-wider text-[color:var(--color-fg-soft)] font-semibold mb-2">Para el propietario</div>
              <h3 className="font-display text-lg font-semibold mb-2">Llave cubre lo que el depósito tradicional cubría — y más.</h3>
              <ul className="space-y-2 text-sm text-[color:var(--color-fg-muted)]">
                <li className="flex gap-2"><span className="text-[color:var(--color-brand-500)]">✓</span> Daños contractuales no estructurales</li>
                <li className="flex gap-2"><span className="text-[color:var(--color-brand-500)]">✓</span> Hasta 1 mes de mora del inquilino</li>
                <li className="flex gap-2"><span className="text-[color:var(--color-brand-500)]">✓</span> Procedimiento SUNAVI gestionado por nosotros</li>
                <li className="flex gap-2"><span className="text-[color:var(--color-brand-500)]">✓</span> Inspección periódica con reporte digital</li>
              </ul>
            </div>
            <div
              className="rounded-[var(--radius-lg)] border border-[color:var(--color-brand-900)] shadow-[var(--shadow-card)] overflow-hidden p-6 text-white"
              style={{ background: "var(--color-brand-900)" }}
            >
              <div className="text-xs uppercase tracking-wider text-[color:var(--color-accent)] font-semibold mb-2">Para el inquilino</div>
              <h3 className="font-display text-lg font-semibold mb-2">Cero depósito retenido. Tu plata se queda contigo.</h3>
              <ul className="space-y-2 text-sm text-white/80">
                <li className="flex gap-2"><span className="text-[color:var(--color-accent)]">✓</span> Te mudas pagando solo el primer mes</li>
                <li className="flex gap-2"><span className="text-[color:var(--color-accent)]">✓</span> Sin trámite de reintegro al final del contrato</li>
                <li className="flex gap-2"><span className="text-[color:var(--color-accent)]">✓</span> Firmas un protocolo claro de convivencia</li>
                <li className="flex gap-2"><span className="text-[color:var(--color-accent)]">✓</span> Tu Trust Score sube con cada pago</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED INMUEBLES */}
      <section className="section bg-white border-y">
        <div className="container-x">
          <FadeIn className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="chip mb-3">Disponibles ahora</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold">Inmuebles destacados</h2>
            </div>
            <Link href="/buscar" className="btn btn-outline">Ver todos</Link>
          </FadeIn>
          <FadeInStagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" stagger={0.07}>
            {featured.map((p) => (
              <FadeInChild key={p.id}>
                <PropertyCard property={p} showCompare={false} />
              </FadeInChild>
            ))}
          </FadeInStagger>
        </div>
      </section>

      {/* AGENTE */}
      <section id="llavero" className="section">
        <div className="container-x grid md:grid-cols-2 gap-10 items-center">
          <FadeIn>
            <span className="chip mb-4">Llavero IA</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">
              Un agente que <em className="not-italic gradient-text">entiende</em>, no que <em className="not-italic">interroga</em>.
            </h2>
            <p className="mt-5 text-lg text-[color:var(--color-fg-muted)]">
              Llavero te pregunta lo justo, busca en la base real de Llave y te muestra opciones honestas. Sin formularios
              de 30 campos. Sin "necesitas demostrar 2.5x tu ingreso". Para asesores: redacta publicaciones, sugiere
              precios y maneja leads.
            </p>
            <ul className="mt-6 space-y-2 text-[color:var(--color-fg)]">
              <Bullet positive>Búsqueda conversacional + voz</Bullet>
              <Bullet positive>Recomendaciones por contexto, no por formulario</Bullet>
              <Bullet positive>Tour 3D y agenda de visita en un mensaje</Bullet>
              <Bullet positive>Onboarding sin papeles</Bullet>
              <Bullet positive>Asistente para asesores</Bullet>
            </ul>
            <div className="mt-7">
              <Link href="/chat" className="btn btn-primary px-6 py-3 text-base">Abrir Llavero</Link>
            </div>
          </FadeIn>
          <FadeIn delay={0.15}>
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
                Soy freelancer, cobro en USD pero no tengo constancia ni RIF. ¿Puedo alquilar?
              </ChatBubble>
              <ChatBubble who="ai">
                Sí, en Llave no te pido RIF ni constancia. Solo tu cédula y empezás con un Trust Score neutral
                que sube con cada pago a tiempo. Te muestro 3 opciones en Caracas hasta $300. ¿Te ronda alguna zona?
              </ChatBubble>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ASESORES — full CRM presentation */}
      <section id="asesores" className="section bg-[color:var(--color-brand-900)] text-white">
        <div className="container-x">
          <FadeIn className="max-w-3xl">
            <span className="chip bg-white/10 text-white border-white/20 mb-4">Para asesores y propietarios</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">
              Un CRM completo que <span className="text-[color:var(--color-accent)]">trabaja contigo</span>.
            </h2>
            <p className="mt-5 text-lg text-white/80">
              Captas un inmueble desde el teléfono con la cámara, lo publicas con ayuda de Llavero,
              recibes leads pre-calificados, chateas con tus clientes, mides el desempeño,
              conectas tus redes sociales y publicas anuncios en Meta Ads — todo desde un solo panel.
            </p>
          </FadeIn>

          <div className="mt-12 grid lg:grid-cols-[1fr_1.3fr] gap-10 items-start">
            <FadeIn delay={0.1}>
              <ul className="space-y-4 text-white/90">
                <Feature icon={<IconDashboard size={18} />} title="Dashboard en vivo" body="Inmuebles activos, leads, conversión y portafolio en tarjetas." />
                <Feature icon={<IconCapture size={18} />} title="Captación con cámara" body="Toma fotos sin salir de Llave, sube tours 3D Gaussian Splat o USDZ." />
                <Feature icon={<IconSparkle size={18} />} title="Publicación con IA" body="Llavero redacta título, descripción y sugiere precio con comparables." />
                <Feature icon={<IconLeads size={18} />} title="Leads + chat integrado" body="Cada lead trae el resumen del agente y un hilo de conversación." />
                <Feature icon={<IconMeta size={18} />} title="Meta Ads desde Llave" body="Promociona tus inmuebles en Facebook e Instagram sin cambiar de pestaña." />
                <Feature icon={<IconInstagram size={18} />} title="Redes conectadas" body="Liga tus cuentas de Instagram, Facebook y TikTok para publicar a todas a la vez." />
              </ul>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/login" className="btn btn-primary bg-[color:var(--color-accent)] !text-[color:var(--color-brand-900)] hover:opacity-90 px-6 py-3 text-base">
                  Mi Llave · Ingresar
                </Link>
                <Link href="/asesor" className="btn btn-outline border-white/40 text-white hover:bg-white/10 px-6 py-3 text-base">
                  Ver demo del CRM
                </Link>
              </div>
            </FadeIn>
            <CrmMockup />
          </div>
        </div>
      </section>

      {/* ROADMAP */}
      <section id="roadmap" className="section bg-white border-y">
        <div className="container-x">
          <FadeIn className="max-w-2xl">
            <span className="chip chip-muted mb-3">Roadmap visible</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">
              Lo que viene después del MVP.
            </h2>
            <p className="mt-4 text-[color:var(--color-fg-muted)]">
              Contratos digitales, perfil crediticio para acceso a banca, integración Meta Ads en vivo y
              expansión a la diáspora con onboarding remoto.
            </p>
          </FadeIn>
          <FadeInStagger className="mt-10 grid md:grid-cols-4 gap-5" stagger={0.07}>
            <FadeInChild><RoadmapStep title="Tours 3D nativos" body="Captura LiDAR + Gaussian Splat directamente desde la app" /></FadeInChild>
            <FadeInChild><RoadmapStep title="Contratos digitales" body="Generados, firmados y guardados dentro de Llave" /></FadeInChild>
            <FadeInChild><RoadmapStep title="Trust Score a banca" body="Tu reputación de pagos exportable como credencial verificable" /></FadeInChild>
            <FadeInChild><RoadmapStep title="Onboarding diáspora" body="Identidad remota + firma desde el exterior + remesas integradas" /></FadeInChild>
          </FadeInStagger>
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
    <div className="card p-6 h-full">
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
    <div className="card p-5 h-full">
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

function GuaranteeCard({ step, title, body }: { step: string; title: string; body: string }) {
  return (
    <div className="card p-5 h-full relative overflow-hidden">
      <div className="absolute -top-2 -right-2 size-14 rounded-full bg-[color:var(--color-brand-50)] flex items-center justify-center font-display text-xs font-bold text-[color:var(--color-brand-700)]">
        {step}
      </div>
      <h3 className="font-display text-base font-semibold mt-3 mb-2 max-w-[80%]">{title}</h3>
      <p className="text-sm text-[color:var(--color-fg-muted)] leading-relaxed">{body}</p>
    </div>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="shrink-0 size-9 rounded-lg bg-white/10 flex items-center justify-center text-[color:var(--color-accent)]">
        {icon}
      </span>
      <div>
        <div className="font-semibold text-white">{title}</div>
        <div className="text-sm text-white/70 mt-0.5">{body}</div>
      </div>
    </li>
  );
}

function CompareRow({
  label,
  llave,
  other,
  head,
}: {
  label: string;
  llave: string;
  other: string;
  head?: boolean;
}) {
  return (
    <>
      <div
        className={`px-5 py-4 border-t border-[color:var(--color-border)] ${
          head ? "bg-[color:var(--color-bg)] font-display text-base font-semibold" : "text-sm text-[color:var(--color-fg-muted)]"
        }`}
      >
        {label}
      </div>
      <div
        className={`px-5 py-4 border-t border-[color:var(--color-border)] ${
          head
            ? "bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] font-display text-base font-semibold border-l-2 border-l-[color:var(--color-brand-500)]"
            : "text-sm font-semibold text-[color:var(--color-brand-700)] bg-[color:var(--color-brand-50)]/40 border-l-2 border-l-[color:var(--color-brand-500)]"
        }`}
      >
        {llave}
      </div>
      <div
        className={`px-5 py-4 border-t border-[color:var(--color-border)] ${
          head ? "bg-[color:var(--color-bg)] font-display text-base font-semibold text-[color:var(--color-fg-muted)]" : "text-sm text-[color:var(--color-fg-soft)]"
        }`}
      >
        {other}
      </div>
    </>
  );
}
