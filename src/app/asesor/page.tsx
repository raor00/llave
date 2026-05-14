import Link from "next/link";
import { listAllProperties, listLeadsForOwner, getOwnerProfile } from "@/lib/db/queries";
import { getViewsByProperty, getViewsTimeSeries } from "@/lib/db/views";
import {
  buildAsesorAnalytics,
  SOURCE_LABEL,
  SOURCE_TINT,
  type Opportunity,
  type AsesorBadge,
  type PropertyMetrics,
  type TrafficSource,
} from "@/lib/db/asesor-analytics";
import {
  IconInstagram,
  IconFacebook,
  IconTikTok,
  IconWhatsapp,
  IconX,
  IconMeta,
} from "@/components/social-icons";
import { formatUSD } from "@/lib/format";
import { getGreeting } from "@/lib/greeting";

export const dynamic = "force-dynamic";

const SOURCE_ICON: Record<TrafficSource, (props: { size?: number }) => React.JSX.Element> = {
  instagram: (p) => <IconInstagram size={p.size ?? 14} />,
  facebook: (p) => <IconFacebook size={p.size ?? 14} />,
  whatsapp: (p) => <IconWhatsapp size={p.size ?? 14} />,
  tiktok: (p) => <IconTikTok size={p.size ?? 14} />,
  x: (p) => <IconX size={p.size ?? 12} />,
  google: () => <span className="text-[10px] font-bold">G</span>,
  llavero: () => <span className="text-[10px] font-bold">L</span>,
  direct: () => <span className="text-[10px] font-bold">·</span>,
};

export default async function AsesorDashboard() {
  const [props, leads, owner] = await Promise.all([
    listAllProperties(),
    listLeadsForOwner(),
    getOwnerProfile(),
  ]);

  const ids = props.map((p) => p.id);
  const [viewsMap, timeseries] = await Promise.all([
    getViewsByProperty(ids),
    getViewsTimeSeries(ids),
  ]);

  const analytics = buildAsesorAnalytics({
    asesorId: owner.id,
    properties: props,
    viewCounts: viewsMap,
    leadCount: leads.length,
  });

  const greeting = getGreeting(owner.full_name);

  return (
    <div className="container-x py-8 sm:py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="chip mb-2">Panel asesor · CRM Llave</span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">{greeting.full}</h1>
          <p className="text-sm text-[color:var(--color-fg-muted)] mt-1 max-w-2xl">
            Métricas reales de tus inmuebles, comisiones acumuladas y oportunidades que el algoritmo Llave preparó para ti.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/asesor/leads" className="btn btn-outline text-sm">Leads ({leads.length})</Link>
          <Link href="/asesor/publicar" className="btn btn-primary text-sm">Publicar con IA</Link>
        </div>
      </div>

      {/* Ingresos + comisiones */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Cobrado este mes"
          value={formatUSD(analytics.commissions.totals.paidThisMonth)}
          hint={`Por cobrar ${formatUSD(analytics.commissions.totals.pendingThisMonth)}`}
          highlight
        />
        <StatCard
          label="Ganado este año"
          value={formatUSD(analytics.commissions.totals.ytd)}
          hint={`Total histórico ${formatUSD(analytics.commissions.totals.lifetime)}`}
        />
        <StatCard
          label="Inmuebles alquilados"
          value={analytics.commissions.items.length}
          hint={`${analytics.commissions.byType.length} tipos · ${analytics.commissions.byCity.length} ciudades`}
        />
        <StatCard
          label="Interés promedio"
          value={`${analytics.totalExposure.engagementScoreAvg}/100`}
          hint={analytics.totalExposure.engagementScoreAvg >= 60 ? "Top 15% de asesores" : "Apunta a 60 o más"}
        />
      </section>

      {/* Exposición global */}
      <section className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
        <div className="card p-5 sm:p-6">
          <div className="flex items-baseline justify-between mb-1">
            <h2 className="font-display text-lg font-semibold">Exposición esta semana</h2>
            <span className="text-xs text-[color:var(--color-fg-soft)]">7 días</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
            <Pill label="Vistas" value={analytics.totalExposure.views} />
            <Pill label="Únicos" value={analytics.totalExposure.uniqueViewers} />
            <Pill label="Clicks" value={analytics.totalExposure.clicks} />
            <Pill label="CTA clicks" value={analytics.totalExposure.ctaClicks} />
          </div>
          <div className="mt-5">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-xs uppercase tracking-wider text-[color:var(--color-fg-soft)]">Tendencia (views/día)</span>
              <span className="text-xs text-[color:var(--color-brand-700)] font-semibold">
                {analytics.totalExposure.conversionPct}% view → lead
              </span>
            </div>
            <DemandChart data={timeseries} />
          </div>
        </div>

        <div className="card p-5 sm:p-6">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-display text-lg font-semibold">Fuentes de tráfico</h2>
            <span className="text-xs text-[color:var(--color-fg-soft)]">de dónde llegan</span>
          </div>
          <ul className="space-y-2.5">
            {analytics.sources.map((s) => {
              const Icon = SOURCE_ICON[s.source];
              return (
                <li key={s.source}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span
                        className="size-6 rounded-md grid place-items-center text-white shrink-0"
                        style={{ background: SOURCE_TINT[s.source] }}
                      >
                        <Icon />
                      </span>
                      <span className="font-medium">{SOURCE_LABEL[s.source]}</span>
                    </span>
                    <span className="text-[color:var(--color-fg)] font-semibold">{s.visits}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[color:var(--color-border)] mt-1.5 overflow-hidden">
                    <div
                      className="h-full"
                      style={{
                        width: `${s.pct}%`,
                        background: SOURCE_TINT[s.source],
                      }}
                    />
                  </div>
                  <div className="text-[10px] text-[color:var(--color-fg-soft)] mt-0.5">{s.pct}% del total</div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Oportunidades del algoritmo Llave */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <h2 className="font-display text-xl font-semibold">Oportunidades del algoritmo Llave</h2>
            <p className="text-xs text-[color:var(--color-fg-soft)] mt-0.5">
              El motor de Llave te empuja a los inmuebles que mueven aguja.
            </p>
          </div>
          <span className="chip">{analytics.opportunities.length} activas</span>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {analytics.opportunities.map((op) => (
            <OpportunityCard key={op.id} op={op} />
          ))}
        </div>
      </section>

      {/* Badges */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-display text-xl font-semibold">Tu progreso · Badges Llave</h2>
          <span className="text-xs text-[color:var(--color-fg-soft)]">desbloquea beneficios</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {analytics.badges.map((b) => (
            <BadgeCard key={b.id} badge={b} />
          ))}
        </div>
      </section>

      {/* Top performers + breakdown */}
      <section className="grid lg:grid-cols-3 gap-5">
        <div className="card p-5">
          <div className="text-xs uppercase tracking-wider text-[color:var(--color-brand-700)] font-semibold mb-3">
            Top por engagement
          </div>
          <ul className="space-y-2.5">
            {analytics.topPerformers.byEngagement.map((row, i) => (
              <li key={row.property.id} className="flex items-center gap-3">
                <span className="size-7 rounded-full bg-[color:var(--color-brand-100)] text-[color:var(--color-brand-700)] text-xs font-bold grid place-items-center">
                  {i + 1}
                </span>
                <Link href={`/inmueble/${row.property.id}`} className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">
                    {row.property.title.replace(/^Llave:\s*/, "")}
                  </div>
                  <div className="text-[11px] text-[color:var(--color-fg-soft)]">
                    {row.property.city} · {row.metrics.views} views · {row.metrics.leads} leads
                  </div>
                </Link>
                <div className="text-right">
                  <div className="text-sm font-bold text-[color:var(--color-brand-700)]">
                    {row.metrics.engagementScore}
                  </div>
                  <div className="text-[9px] uppercase tracking-wider text-[color:var(--color-fg-soft)]">/100</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-5">
          <div className="text-xs uppercase tracking-wider text-[color:var(--color-brand-700)] font-semibold mb-3">
            Tipo que más vende
          </div>
          <ul className="space-y-2.5">
            {analytics.topPerformers.byType.map((row) => (
              <li key={row.type}>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-sm font-semibold capitalize">{row.type}</span>
                  <span className="text-xs text-[color:var(--color-fg-muted)]">
                    {row.rentedCount} alquilado{row.rentedCount === 1 ? "" : "s"} · {row.leads} leads
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[color:var(--color-border)] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[color:var(--color-brand-500)] to-[color:var(--color-accent)]"
                    style={{
                      width: `${(row.views / Math.max(1, analytics.topPerformers.byType[0]?.views ?? 1)) * 100}%`,
                    }}
                  />
                </div>
                <div className="text-[10px] text-[color:var(--color-fg-soft)] mt-0.5">{row.views} views</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-5">
          <div className="text-xs uppercase tracking-wider text-[color:var(--color-brand-700)] font-semibold mb-3">
            Ciudades con más demanda
          </div>
          <ul className="space-y-2.5">
            {analytics.topPerformers.byCity.map((row) => (
              <li key={row.city}>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-sm font-semibold">{row.city}</span>
                  <span className="text-xs text-[color:var(--color-fg-muted)]">{row.rentedCount} rentados</span>
                </div>
                <div className="h-2 rounded-full bg-[color:var(--color-border)] overflow-hidden">
                  <div
                    className="h-full bg-[color:var(--color-brand-700)]"
                    style={{
                      width: `${(row.views / Math.max(1, analytics.topPerformers.byCity[0]?.views ?? 1)) * 100}%`,
                    }}
                  />
                </div>
                <div className="text-[10px] text-[color:var(--color-fg-soft)] mt-0.5">
                  {row.views} views · {row.leads} leads
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Comisiones detalle */}
      <section className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
        <div className="card p-5 sm:p-6">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display text-lg font-semibold">Comisiones · últimos 6 meses</h2>
            <span className="text-xs text-[color:var(--color-fg-soft)]">USD</span>
          </div>
          <CommissionsChart data={analytics.commissions.byMonth} />

          <table className="w-full text-sm mt-5">
            <thead className="text-left text-xs uppercase tracking-wider text-[color:var(--color-fg-soft)]">
              <tr>
                <th className="py-2 font-semibold">Inmueble</th>
                <th className="py-2 font-semibold">Mensual</th>
                <th className="py-2 font-semibold">Comisión</th>
                <th className="py-2 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {analytics.commissions.items.map((c) => (
                <tr key={c.id} className="border-t border-[color:var(--color-border)]">
                  <td className="py-2.5">
                    <div className="font-medium text-[color:var(--color-fg)] line-clamp-1">{c.property_title}</div>
                    <div className="text-[11px] text-[color:var(--color-fg-soft)]">
                      {c.city} · {c.property_type} · {c.contract_months} meses
                    </div>
                  </td>
                  <td className="py-2.5 text-[color:var(--color-fg-muted)]">{formatUSD(c.monthly_amount)}</td>
                  <td className="py-2.5 font-semibold">{formatUSD(c.commission_amount)}</td>
                  <td className="py-2.5">
                    <span className={`chip ${c.status === "pagada" ? "" : "chip-muted"}`}>{c.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card p-5 sm:p-6 bg-[color:var(--color-brand-900)] text-white">
          <div className="text-xs uppercase tracking-wider text-white/70 font-semibold mb-2">
            Llave Algorithm
          </div>
          <h3 className="font-display text-xl font-bold leading-tight">
            Mientras mejor respondes, más inmuebles te toca Llave.
          </h3>
          <p className="text-sm text-white/80 mt-3 leading-relaxed">
            El motor mide tu velocidad de respuesta, conversión y engagement de tus publicaciones. Los asesores en el top 15%
            reciben automáticamente:
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-white/90">
            <li className="flex items-start gap-2">
              <span className="mt-1 size-1.5 rounded-full bg-[color:var(--color-accent)]" />
              Inmuebles premium asignados primero.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 size-1.5 rounded-full bg-[color:var(--color-accent)]" />
              Llave paga 50% de tu primer Meta Ad mensual.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 size-1.5 rounded-full bg-[color:var(--color-accent)]" />
              +2% de comisión adicional en cierres.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 size-1.5 rounded-full bg-[color:var(--color-accent)]" />
              Llavero responde leads fuera de horario en tu nombre.
            </li>
          </ul>
        </div>
      </section>

      {/* Detalle por inmueble */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-display text-xl font-semibold">Métricas por inmueble</h2>
          <span className="text-xs text-[color:var(--color-fg-soft)]">click para ver detalle</span>
        </div>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead className="bg-[color:var(--color-bg)] text-left text-xs uppercase tracking-wider text-[color:var(--color-fg-soft)]">
              <tr>
                <th className="px-4 py-3 font-semibold">Inmueble</th>
                <th className="px-4 py-3 font-semibold">Vistas</th>
                <th className="px-4 py-3 font-semibold">Únicos</th>
                <th className="px-4 py-3 font-semibold">Clicks</th>
                <th className="px-4 py-3 font-semibold">CTA</th>
                <th className="px-4 py-3 font-semibold">Tiempo</th>
                <th className="px-4 py-3 font-semibold">Scroll</th>
                <th className="px-4 py-3 font-semibold">Leads</th>
                <th className="px-4 py-3 font-semibold">Conv.</th>
                <th className="px-4 py-3 font-semibold">Engage</th>
              </tr>
            </thead>
            <tbody>
              {props.slice(0, 12).map((p) => {
                const m = analytics.metricsByProperty.get(p.id);
                if (!m) return null;
                return (
                  <tr key={p.id} className="border-t border-[color:var(--color-border)]">
                    <td className="px-4 py-3">
                      <Link href={`/inmueble/${p.id}`} className="font-medium hover:text-[color:var(--color-brand-700)] line-clamp-1">
                        {p.title.replace(/^Llave:\s*/, "")}
                      </Link>
                      <div className="text-[11px] text-[color:var(--color-fg-soft)]">
                        {p.city} · {p.type}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold">{m.views}</td>
                    <td className="px-4 py-3 text-[color:var(--color-fg-muted)]">{m.uniqueViewers}</td>
                    <td className="px-4 py-3">{m.clicks}</td>
                    <td className="px-4 py-3">{m.ctaClicks}</td>
                    <td className="px-4 py-3 text-[color:var(--color-fg-muted)]">{m.avgTimeOnPageSec}s</td>
                    <td className="px-4 py-3 text-[color:var(--color-fg-muted)]">{m.scrollDepthPct}%</td>
                    <td className="px-4 py-3 font-semibold">{m.leads}</td>
                    <td className="px-4 py-3 text-[color:var(--color-fg-muted)]">{m.conversionViewToLead}%</td>
                    <td className="px-4 py-3">
                      <EngagementPill score={m.engagementScore} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// ---------- subcomponents ----------

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

function Pill({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-[color:var(--color-bg)] border border-[color:var(--color-border)] p-3">
      <div className="text-[10px] uppercase tracking-wider text-[color:var(--color-fg-soft)]">{label}</div>
      <div className="font-display text-xl sm:text-2xl font-bold mt-0.5">{value}</div>
    </div>
  );
}

function EngagementPill({ score }: { score: number }) {
  const tone =
    score >= 75
      ? "bg-[color:var(--color-brand-500)] text-white"
      : score >= 55
        ? "bg-[color:var(--color-accent)] text-[color:var(--color-brand-900)]"
        : "bg-[color:var(--color-border)] text-[color:var(--color-fg)]";
  return (
    <span className={`inline-flex items-center justify-center min-w-9 px-2 py-0.5 rounded-md text-xs font-bold ${tone}`}>
      {score}
    </span>
  );
}

function OpportunityCard({ op }: { op: Opportunity }) {
  const kindMeta: Record<Opportunity["kind"], { tone: string; label: string }> = {
    respond_lead: { tone: "bg-[#fff2e8] border-[color:var(--color-brand-100)]", label: "Acción urgente" },
    price_adjust: { tone: "bg-[color:var(--color-brand-50)] border-[color:var(--color-brand-100)]", label: "Ajuste" },
    boost_ad: { tone: "bg-[#e7f1ff] border-[#bcd7ff]", label: "Meta Ads" },
    add_media: { tone: "bg-[#f5efe6] border-[#e6d9c2]", label: "Contenido" },
    priority_listing: { tone: "bg-[color:var(--color-brand-900)] border-[color:var(--color-brand-900)] text-white", label: "Priority" },
    badge_unlocked: { tone: "bg-[color:var(--color-brand-50)]", label: "Logro" },
  };
  const m = kindMeta[op.kind];
  const dark = op.kind === "priority_listing";
  return (
    <div className={`rounded-[var(--radius-lg)] border p-4 ${m.tone}`}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`text-[10px] uppercase tracking-wider font-bold ${dark ? "text-[color:var(--color-accent)]" : "text-[color:var(--color-brand-700)]"}`}>
          {m.label}
        </span>
        {op.reward && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${dark ? "bg-white/10 text-white" : "bg-white/70 text-[color:var(--color-brand-700)]"}`}>
            {op.reward}
          </span>
        )}
      </div>
      <h3 className={`font-display text-base font-semibold leading-tight ${dark ? "text-white" : ""}`}>{op.title}</h3>
      <p className={`text-sm mt-1.5 leading-relaxed ${dark ? "text-white/80" : "text-[color:var(--color-fg-muted)]"}`}>
        {op.body}
      </p>
      <Link
        href={op.cta_href}
        className={`mt-3 inline-flex items-center gap-1 text-sm font-semibold ${dark ? "text-[color:var(--color-accent)]" : "text-[color:var(--color-brand-700)]"} hover:underline`}
      >
        {op.cta_label} →
      </Link>
    </div>
  );
}

function BadgeCard({ badge }: { badge: AsesorBadge }) {
  return (
    <div
      className={`card p-4 ${
        badge.unlocked
          ? "border-[color:var(--color-brand-300)] bg-gradient-to-br from-[color:var(--color-brand-50)] to-white"
          : "opacity-90"
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span
          className={`size-7 rounded-full grid place-items-center text-xs font-bold ${
            badge.unlocked
              ? "bg-[color:var(--color-brand-500)] text-white"
              : "bg-[color:var(--color-border)] text-[color:var(--color-fg-soft)]"
          }`}
        >
          {badge.unlocked ? "★" : "◐"}
        </span>
        <div className="text-sm font-semibold leading-tight">{badge.label}</div>
      </div>
      <p className="text-xs text-[color:var(--color-fg-muted)] mt-1 leading-relaxed">{badge.description}</p>
      <div className="h-1.5 rounded-full bg-[color:var(--color-border)] mt-2 overflow-hidden">
        <div
          className={`h-full ${badge.unlocked ? "bg-[color:var(--color-brand-500)]" : "bg-[color:var(--color-accent)]"}`}
          style={{ width: `${badge.progress_pct}%` }}
        />
      </div>
      <div className="text-[10px] text-[color:var(--color-fg-soft)] mt-1">
        {badge.unlocked ? "Desbloqueado" : `${badge.progress_pct}% al desbloqueo`} · {badge.reward}
      </div>
    </div>
  );
}

function DemandChart({ data }: { data: Array<{ day: string; views: number }> }) {
  const max = Math.max(1, ...data.map((d) => d.views));
  return (
    <div className="flex items-end gap-2 h-28">
      {data.map((d, i) => {
        const pct = Math.round((d.views / max) * 100);
        return (
          <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-[color:var(--color-brand-700)] to-[color:var(--color-brand-400)]"
              style={{ height: `${Math.max(6, pct)}%` }}
            />
            <div className="text-[10px] text-[color:var(--color-fg-soft)]">{d.day}</div>
            <div className="text-[10px] text-[color:var(--color-fg-muted)]">{d.views}</div>
          </div>
        );
      })}
    </div>
  );
}

function CommissionsChart({ data }: { data: Array<{ month: string; amount: number }> }) {
  const max = Math.max(1, ...data.map((d) => d.amount));
  return (
    <div className="flex items-end gap-2 h-28">
      {data.map((d, i) => {
        const pct = Math.round((d.amount / max) * 100);
        return (
          <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-[color:var(--color-accent)] to-[#f7d9cb]"
              style={{ height: `${Math.max(6, pct)}%` }}
            />
            <div className="text-[10px] text-[color:var(--color-fg-soft)] capitalize">{d.month}</div>
            <div className="text-[10px] text-[color:var(--color-fg-muted)]">${d.amount}</div>
          </div>
        );
      })}
    </div>
  );
}

// IconMeta is imported for completeness via component tree; suppress unused lint warning.
void IconMeta;
