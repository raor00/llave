/**
 * /asesor/marketing — Campañas, posts y sugerencias del algoritmo Llavero.
 *
 * Stats de alcance/engagement/leads/CPL, grid de campañas activas, lista de
 * posts recientes y bloque de sugerencias. Data desde seed marketing.
 * Cuando integremos Meta Ads / TikTok Business reemplazamos los seeds por
 * fetch a esos APIs.
 */

import Link from "next/link";
import { listCampaigns, listPosts, listSuggestions } from "@/lib/db/marketing";
import {
  listPosts as listSocialPosts,
  listComments,
  postEngagement,
} from "@/lib/db/social-feed";
import { DEMO_PROPERTIES } from "@/lib/db/seed-data";
import { getOwnerProfile, listAllProperties, listLeadsForOwner } from "@/lib/db/queries";
import { getViewsByProperty } from "@/lib/db/views";
import { buildAsesorAnalytics } from "@/lib/db/asesor-analytics";
import { formatUSD } from "@/lib/format";
import { getGreeting } from "@/lib/greeting";
import {
  IconInstagram,
  IconFacebook,
  IconTikTok,
  IconWhatsapp,
  IconX,
  IconMeta,
} from "@/components/social-icons";
import {
  IconMegaphone,
  IconSparkle,
  IconHeart,
  IconComment,
} from "@/components/dashboard-icons";
import { CreatePostForm } from "@/components/asesor/create-post-form";
import { CommentThread } from "@/components/asesor/comment-thread";

export const dynamic = "force-dynamic";

const PLATFORM_ICON: Record<string, (props: { size?: number }) => React.JSX.Element> = {
  instagram: (p) => <IconInstagram size={p.size ?? 18} />,
  facebook: (p) => <IconFacebook size={p.size ?? 18} />,
  tiktok: (p) => <IconTikTok size={p.size ?? 18} />,
  whatsapp: (p) => <IconWhatsapp size={p.size ?? 18} />,
  x: (p) => <IconX size={p.size ?? 16} />,
  google: () => <span className="text-xs font-bold">G</span>,
  meta: (p) => <IconMeta size={p.size ?? 18} />,
};

const PLATFORM_TINT: Record<string, string> = {
  instagram: "text-[#e1306c]",
  facebook: "text-[#1877f2]",
  tiktok: "text-[#0b1f1c]",
  whatsapp: "text-[#25d366]",
  x: "text-[#0b1f1c]",
  google: "text-[#f4b400]",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  const diffDays = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return d.toLocaleDateString("es-VE", { day: "numeric", month: "short" });
}

function truncate(s: string, n: number): string {
  return s.length <= n ? s : s.slice(0, n).trimEnd() + "…";
}

export default async function MarketingPage() {
  const [owner, props, leads] = await Promise.all([
    getOwnerProfile(),
    listAllProperties(),
    listLeadsForOwner(),
  ]);
  const viewsMap = await getViewsByProperty(props.map((p) => p.id));
  const analytics = buildAsesorAnalytics({
    asesorId: owner.id,
    properties: props,
    viewCounts: viewsMap,
    leadCount: leads.length,
  });
  const campaigns = listCampaigns();
  const posts = listPosts();
  const suggestions = listSuggestions();
  const socialPosts = listSocialPosts();
  const commentsByPost = new Map(
    socialPosts.map((p) => [p.id, listComments(p.id)] as const)
  );
  const engagementByPost = new Map(
    socialPosts.map((p) => [p.id, postEngagement(p.id)] as const)
  );
  const propertyOptions = DEMO_PROPERTIES.map((p) => ({
    id: p.id,
    title: p.title.replace(/^Llave:\s*/, ""),
  }));
  const greeting = getGreeting(owner.full_name);

  const totalSpend = campaigns.reduce((a, c) => a + c.spend, 0);
  const totalLeadsRedes = campaigns.reduce((a, c) => a + c.leads, 0);
  const cplPromedio = totalLeadsRedes > 0 ? totalSpend / totalLeadsRedes : 0;
  const alcance = analytics.totalExposure.views + posts.reduce((a, p) => a + p.likes * 3 + p.comments * 5, 0);

  return (
    <div className="container-x py-8 sm:py-10 space-y-8">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <span className="chip mb-2">Crecimiento · Marketing & Ads</span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">{greeting.full}</h1>
          <p className="text-sm text-[color:var(--color-fg-muted)] mt-1 max-w-2xl">
            Tus campañas activas, posts orgánicos y lo que Llavero recomienda hacer esta semana para mover aguja.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <CreatePostForm properties={propertyOptions} />
          <Link href="/asesor/publicar" className="btn btn-outline text-sm">
            <IconMegaphone size={16} /> Crear campaña
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Alcance este mes" value={alcance.toLocaleString("es-VE")} hint="vistas + interacciones" highlight />
        <StatCard label="Engagement promedio" value={`${analytics.totalExposure.engagementScoreAvg}/100`} hint="del portafolio" />
        <StatCard label="Leads desde redes" value={totalLeadsRedes} hint={`${campaigns.length} campañas`} />
        <StatCard label="Costo por lead" value={cplPromedio > 0 ? formatUSD(Math.round(cplPromedio)) : "—"} hint="promedio ponderado" />
      </section>

      {/* Campañas activas */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-display text-lg font-semibold">Campañas activas</h2>
          <span className="text-xs text-[color:var(--color-fg-soft)]">{campaigns.length} campañas</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {campaigns.map((c) => {
            const Icon = PLATFORM_ICON[c.platform];
            const tint = PLATFORM_TINT[c.platform] ?? "text-[color:var(--color-fg)]";
            return (
              <article key={c.id} className="card p-5 flex flex-col">
                <div className="flex items-start gap-3 mb-3">
                  <span className={`size-9 rounded-md bg-[color:var(--color-bg)] border border-[color:var(--color-border)] grid place-items-center ${tint}`}>
                    <Icon />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-sm font-semibold leading-tight">{c.name}</h3>
                    <Link href={`/inmueble/${c.property_id}`} className="text-[11px] text-[color:var(--color-fg-soft)] hover:text-[color:var(--color-brand-700)] line-clamp-1 block">
                      {c.property_title}
                    </Link>
                  </div>
                  <span className={`chip text-[10px] ${c.status === "activa" ? "" : "chip-muted"}`}>
                    {c.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <Mini label="Gasto" value={formatUSD(c.spend)} />
                  <Mini label="Clicks" value={c.clicks.toLocaleString("es-VE")} />
                  <Mini label="Leads" value={c.leads} />
                </div>
                <div className="mt-3 text-[11px] text-[color:var(--color-fg-soft)]">
                  CPL: <strong>{c.cpl > 0 ? formatUSD(Math.round(c.cpl)) : "$0 (orgánico)"}</strong>
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    className="btn btn-outline text-xs flex-1 justify-center"
                  >
                    {c.status === "activa" ? "Pausar" : "Reanudar"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost text-xs flex-1 justify-center"
                  >
                    Ver detalle
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Posts recientes + Llavero recomienda */}
      <section className="grid lg:grid-cols-[1.4fr_1fr] gap-5 items-start">
        <div className="card p-5 sm:p-6">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-display text-lg font-semibold">Posts recientes</h2>
            <span className="text-xs text-[color:var(--color-fg-soft)]">orgánico</span>
          </div>
          <ul className="space-y-3">
            {posts.map((p) => {
              const Icon = PLATFORM_ICON[p.platform];
              const tint = PLATFORM_TINT[p.platform] ?? "text-[color:var(--color-fg)]";
              return (
                <li key={p.id} className="flex items-start gap-3 pb-3 border-b border-[color:var(--color-border)] last:border-0 last:pb-0">
                  <span className={`size-8 rounded-md bg-[color:var(--color-bg)] border border-[color:var(--color-border)] grid place-items-center shrink-0 ${tint}`}>
                    <Icon size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium leading-snug">{truncate(p.copy, 40)}</div>
                    <Link
                      href={`/inmueble/${p.property_id}`}
                      className="text-[11px] text-[color:var(--color-brand-700)] hover:underline line-clamp-1 block mt-0.5"
                    >
                      → {p.property_title}
                    </Link>
                    <div className="text-[11px] text-[color:var(--color-fg-soft)] mt-1">
                      {p.likes.toLocaleString("es-VE")} likes · {p.comments} coment · {formatDate(p.posted_at)}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="card p-5 sm:p-6 bg-[color:var(--color-brand-900)] text-white space-y-4">
          <div className="flex items-center gap-2">
            <IconSparkle size={16} />
            <span className="text-xs uppercase tracking-wider font-semibold">Llavero recomienda</span>
          </div>
          <h2 className="font-display text-xl font-bold leading-tight">Movidas para esta semana</h2>
          <ul className="space-y-3">
            {suggestions.map((s) => (
              <li key={s.id} className="rounded-md bg-white/5 p-3 border border-white/10">
                <h3 className="text-sm font-semibold text-white">{s.title}</h3>
                <p className="text-xs text-white/80 mt-1 leading-relaxed">{s.body}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-[color:var(--color-accent)] font-semibold">{s.reward}</span>
                  <button
                    type="button"
                    className="text-xs text-[color:var(--color-accent)] hover:underline font-semibold"
                  >
                    {s.cta_label} →
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Tus publicaciones y comentarios */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-display text-lg font-semibold">
            Tus publicaciones y comentarios
          </h2>
          <span className="text-xs text-[color:var(--color-fg-soft)]">
            {socialPosts.length} publicaciones
          </span>
        </div>
        <div className="space-y-4">
          {socialPosts.map((p) => {
            const Icon = PLATFORM_ICON[p.platform];
            const tint = PLATFORM_TINT[p.platform] ?? "text-[color:var(--color-fg)]";
            const comments = commentsByPost.get(p.id) ?? [];
            return (
              <article key={p.id} className="card p-5">
                <div className="flex items-start gap-3">
                  <span
                    className={`size-9 rounded-md bg-[color:var(--color-bg)] border border-[color:var(--color-border)] grid place-items-center shrink-0 ${tint}`}
                  >
                    <Icon size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug">{p.copy}</p>
                    {p.property_id && p.property_title && (
                      <Link
                        href={`/inmueble/${p.property_id}`}
                        className="text-[11px] text-[color:var(--color-brand-700)] hover:underline line-clamp-1 block mt-1"
                      >
                        → {p.property_title}
                      </Link>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-[11px] text-[color:var(--color-fg-soft)]">
                      <span className="flex items-center gap-1">
                        <IconHeart size={13} /> {p.likes.toLocaleString("es-VE")}
                      </span>
                      <span className="flex items-center gap-1">
                        <IconMegaphone size={13} /> {p.shares.toLocaleString("es-VE")}
                      </span>
                      <span className="flex items-center gap-1">
                        <IconComment size={13} /> {comments.length}
                      </span>
                      <span className="chip-muted text-[10px]">{formatDate(p.created_at)}</span>
                    </div>
                  </div>
                </div>

                <details className="mt-3 group">
                  <summary className="cursor-pointer text-xs font-semibold text-[color:var(--color-brand-700)] hover:underline list-none">
                    Ver comentarios ({comments.length})
                  </summary>
                  <div className="mt-2 border-t border-[color:var(--color-border)] pt-1">
                    <CommentThread comments={comments} engagement={engagementByPost.get(p.id)} />
                  </div>
                </details>
              </article>
            );
          })}
        </div>
      </section>
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

function Mini({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md bg-[color:var(--color-bg)] border border-[color:var(--color-border)] p-2">
      <div className="text-[9px] uppercase tracking-wider text-[color:var(--color-fg-soft)]">{label}</div>
      <div className="text-sm font-bold">{value}</div>
    </div>
  );
}
