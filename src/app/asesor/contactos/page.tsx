/**
 * /asesor/contactos — CRM de contactos del asesor.
 *
 * Stats por temperatura, tabla con avatar-iniciales y panel destacado con
 * historial del primer contacto + CTA a Llavero. Data del seed contacts.
 * Cuando Supabase esté listo se reemplaza por una query a `profiles` join
 * con `leads` y `conversations`.
 */

import Link from "next/link";
import {
  listContacts,
  buildContactMetrics,
  type Contact,
  type ContactStatus,
} from "@/lib/db/contacts";
import { getOwnerProfile } from "@/lib/db/queries";
import { SOURCE_LABEL, SOURCE_TINT, type TrafficSource } from "@/lib/db/asesor-analytics";
import { getGreeting } from "@/lib/greeting";
import {
  IconInstagram,
  IconFacebook,
  IconTikTok,
  IconWhatsapp,
  IconX,
} from "@/components/social-icons";
import { IconSparkle } from "@/components/dashboard-icons";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<ContactStatus, string> = {
  frio: "Frío",
  tibio: "Tibio",
  caliente: "Caliente",
  cliente: "Cliente",
};

const STATUS_TONE: Record<ContactStatus, string> = {
  frio: "bg-[color:var(--color-border)] text-[color:var(--color-fg-muted)]",
  tibio: "bg-[color:var(--color-accent)] text-[color:var(--color-brand-900)]",
  caliente: "bg-[color:var(--color-brand-500)] text-white",
  cliente: "bg-[color:var(--color-brand-900)] text-white",
};

const SOURCE_ICON: Record<TrafficSource, (props: { size?: number }) => React.JSX.Element> = {
  instagram: (p) => <IconInstagram size={p.size ?? 12} />,
  facebook: (p) => <IconFacebook size={p.size ?? 12} />,
  whatsapp: (p) => <IconWhatsapp size={p.size ?? 12} />,
  tiktok: (p) => <IconTikTok size={p.size ?? 12} />,
  x: (p) => <IconX size={p.size ?? 10} />,
  google: () => <span className="text-[9px] font-bold">G</span>,
  llavero: () => <span className="text-[9px] font-bold">L</span>,
  direct: () => <span className="text-[9px] font-bold">·</span>,
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const diffDays = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return d.toLocaleDateString("es-VE", { day: "numeric", month: "short" });
}

export default async function ContactosPage() {
  const owner = await getOwnerProfile();
  const contacts = listContacts();
  const metrics = buildContactMetrics(contacts);
  const greeting = getGreeting(owner.full_name);
  const featured = contacts[0];

  return (
    <div className="container-x py-8 sm:py-10 space-y-8">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <span className="chip mb-2">Operación · Contactos</span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">{greeting.full}</h1>
          <p className="text-sm text-[color:var(--color-fg-muted)] mt-1 max-w-2xl">
            Tu CRM personal de inquilinos potenciales y clientes activos. Llavero los califica por temperatura para que sepas a quién atender primero.
          </p>
        </div>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total contactos" value={metrics.total} hint="en tu CRM" highlight />
        <StatCard label="Calientes" value={metrics.calientes} hint="prioridad alta" />
        <StatCard label="Tibios" value={metrics.tibios} hint="seguimiento activo" />
        <StatCard label="Fríos" value={metrics.frios} hint="reactivar pronto" />
      </section>

      <div className="grid lg:grid-cols-[1.8fr_1fr] gap-5 items-start">
        {/* Tabla */}
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-display text-lg font-semibold">Listado completo</h2>
            <span className="text-xs text-[color:var(--color-fg-soft)]">click para ver detalle</span>
          </div>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead className="bg-[color:var(--color-bg)] text-left text-xs uppercase tracking-wider text-[color:var(--color-fg-soft)]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Contacto</th>
                  <th className="px-4 py-3 font-semibold hidden md:table-cell">Origen</th>
                  <th className="px-4 py-3 font-semibold">Tags</th>
                  <th className="px-4 py-3 font-semibold hidden md:table-cell">Trust</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold hidden md:table-cell">Último contacto</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => {
                  const Icon = SOURCE_ICON[c.source];
                  return (
                    <tr key={c.id} className="border-t border-[color:var(--color-border)]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span
                            className="size-9 rounded-full grid place-items-center font-bold text-xs text-white shrink-0"
                            style={{ background: SOURCE_TINT[c.source] }}
                          >
                            {initials(c.full_name)}
                          </span>
                          <div className="min-w-0">
                            <div className="font-medium leading-tight">{c.full_name}</div>
                            <div className="text-[11px] text-[color:var(--color-fg-soft)]">{c.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="inline-flex items-center gap-1 text-xs">
                          <span
                            className="size-5 rounded grid place-items-center text-white"
                            style={{ background: SOURCE_TINT[c.source] }}
                          >
                            <Icon />
                          </span>
                          {SOURCE_LABEL[c.source]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {c.tags.slice(0, 3).map((t) => (
                            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-[color:var(--color-bg)] border border-[color:var(--color-border)] text-[color:var(--color-fg-muted)]">
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold hidden md:table-cell">{c.trust_score}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${STATUS_TONE[c.status]}`}>
                          {STATUS_LABEL[c.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[color:var(--color-fg-muted)] text-xs hidden md:table-cell">
                        {formatDate(c.last_contact_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Sidebar destacado */}
        <FeaturedContact contact={featured} />
      </div>
    </div>
  );
}

function FeaturedContact({ contact }: { contact: Contact }) {
  return (
    <aside className="card p-5 sm:p-6 lg:sticky lg:top-6 space-y-4">
      <div className="flex items-baseline justify-between">
        <span className="text-xs uppercase tracking-wider text-[color:var(--color-brand-700)] font-semibold">
          Contacto destacado
        </span>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${STATUS_TONE[contact.status]}`}>
          {STATUS_LABEL[contact.status]}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span
          className="size-14 rounded-full grid place-items-center font-bold text-lg text-white shrink-0"
          style={{ background: SOURCE_TINT[contact.source] }}
        >
          {initials(contact.full_name)}
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-lg font-semibold leading-tight">{contact.full_name}</h3>
          <div className="text-[11px] text-[color:var(--color-fg-soft)]">
            {contact.phone} · Trust {contact.trust_score}
          </div>
        </div>
      </div>

      <p className="text-sm text-[color:var(--color-fg-muted)] leading-relaxed">{contact.bio}</p>

      <div>
        <div className="text-[10px] uppercase tracking-wider text-[color:var(--color-fg-soft)] font-semibold mb-1.5">
          Tags
        </div>
        <div className="flex flex-wrap gap-1">
          {contact.tags.map((t) => (
            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-[color:var(--color-bg)] border border-[color:var(--color-border)] text-[color:var(--color-fg-muted)]">
              {t}
            </span>
          ))}
        </div>
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-wider text-[color:var(--color-fg-soft)] font-semibold mb-1.5">
          Historial reciente
        </div>
        <ul className="space-y-2">
          {contact.history.map((h, i) => (
            <li key={i} className="text-xs flex items-start gap-2">
              <span className="size-1.5 rounded-full bg-[color:var(--color-brand-500)] mt-1.5 shrink-0" />
              <div className="min-w-0">
                <span className="font-semibold capitalize">{h.kind}</span>
                <span className="text-[color:var(--color-fg-soft)]"> · {formatDate(h.at)}</span>
                <div className="text-[color:var(--color-fg-muted)] mt-0.5">{h.detail}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Link
        href="/chat"
        className="btn btn-primary w-full justify-center text-sm"
      >
        <IconSparkle size={14} />
        Hablar con Llavero sobre este contacto
      </Link>
    </aside>
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
