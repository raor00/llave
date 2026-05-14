/**
 * /asesor/visitas — Calendario semanal de visitas y lista detallada.
 *
 * Muestra grid de 7 días con visitas, tabla con próximas 10 y stats arriba.
 * Data del seed visits (próxima semana, hora, estado, inquilino). Cuando
 * Supabase esté listo se reemplaza por una query a `leads` con
 * `preferred_visit_at` join al inmueble.
 */

import Link from "next/link";
import {
  listVisits,
  buildVisitMetrics,
  groupVisitsByDay,
  type VisitStatus,
} from "@/lib/db/visits";
import { getOwnerProfile } from "@/lib/db/queries";
import { getGreeting } from "@/lib/greeting";
import { IconCalendar, IconContacts } from "@/components/dashboard-icons";
import { IconWhatsapp } from "@/components/social-icons";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<VisitStatus, string> = {
  confirmada: "Confirmada",
  pendiente: "Pendiente",
  cancelada: "Cancelada",
};

const STATUS_TONE: Record<VisitStatus, string> = {
  confirmada: "bg-[color:var(--color-brand-100)] text-[color:var(--color-brand-700)]",
  pendiente: "bg-[color:var(--color-accent)] text-[color:var(--color-brand-900)]",
  cancelada: "bg-[color:var(--color-border)] text-[color:var(--color-fg-muted)] line-through",
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export default async function VisitasPage() {
  const owner = await getOwnerProfile();
  const visits = listVisits();
  const metrics = buildVisitMetrics(visits);
  const week = groupVisitsByDay(visits);
  const greeting = getGreeting(owner.full_name);
  const upcoming = [...visits]
    .filter((v) => new Date(v.scheduled_at).getTime() >= Date.now())
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
    .slice(0, 10);

  return (
    <div className="container-x py-8 sm:py-10 space-y-8">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <span className="chip mb-2">Operación · Visitas</span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">{greeting.full}</h1>
          <p className="text-sm text-[color:var(--color-fg-muted)] mt-1 max-w-2xl">
            Tu agenda de los próximos 7 días. Confirma asistencias y envía recordatorios para reducir cancelaciones.
          </p>
        </div>
        <Link href="/asesor/leads" className="btn btn-primary text-sm">
          <IconCalendar size={16} /> Agendar nueva visita
        </Link>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Visitas hoy" value={metrics.hoy} hint="agenda del día" highlight />
        <StatCard label="Esta semana" value={metrics.semana} hint="próximos 7 días" />
        <StatCard label="Confirmadas" value={metrics.confirmadas} hint="inquilinos respondieron" />
        <StatCard label="Canceladas" value={metrics.canceladas} hint="reagendar pronto" />
      </section>

      {/* Calendario semanal */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-display text-lg font-semibold">Semana</h2>
          <span className="text-xs text-[color:var(--color-fg-soft)]">scroll horizontal en mobile</span>
        </div>
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="grid grid-cols-7 gap-2 sm:gap-3 min-w-[760px]">
            {week.map((d) => {
              const isToday = d.date.toDateString() === new Date().toDateString();
              return (
                <div
                  key={d.date.toISOString()}
                  className={`card p-3 sm:p-4 ${isToday ? "border-[color:var(--color-brand-500)] bg-[color:var(--color-brand-50)]" : ""}`}
                >
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-xs uppercase tracking-wider text-[color:var(--color-fg-soft)] font-semibold">
                      {d.label}
                    </span>
                    <span className={`font-display text-xl font-bold ${isToday ? "text-[color:var(--color-brand-700)]" : ""}`}>
                      {d.dayNum}
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {d.visits.length === 0 ? (
                      <li className="text-[10px] text-[color:var(--color-fg-soft)] italic">Sin visitas</li>
                    ) : (
                      d.visits.map((v) => (
                        <li
                          key={v.id}
                          className={`rounded-md px-2 py-1.5 text-[11px] leading-tight ${STATUS_TONE[v.status]}`}
                        >
                          <div className="font-semibold">{formatTime(v.scheduled_at)}</div>
                          <div className="truncate">{v.tenant_name.split(" ")[0]}</div>
                          <div className="truncate opacity-80">{v.property.city}</div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tabla próximas */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-display text-lg font-semibold">Próximas visitas</h2>
          <span className="text-xs text-[color:var(--color-fg-soft)]">orden cronológico</span>
        </div>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead className="bg-[color:var(--color-bg)] text-left text-xs uppercase tracking-wider text-[color:var(--color-fg-soft)]">
              <tr>
                <th className="px-4 py-3 font-semibold">Cuándo</th>
                <th className="px-4 py-3 font-semibold">Inquilino</th>
                <th className="px-4 py-3 font-semibold">Inmueble</th>
                <th className="px-4 py-3 font-semibold hidden md:table-cell">Nota</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody>
              {upcoming.map((v) => {
                const date = new Date(v.scheduled_at);
                const dateLabel = date.toLocaleDateString("es-VE", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                });
                return (
                  <tr key={v.id} className="border-t border-[color:var(--color-border)]">
                    <td className="px-4 py-3">
                      <div className="font-medium">{formatTime(v.scheduled_at)}</div>
                      <div className="text-[11px] text-[color:var(--color-fg-soft)] capitalize">{dateLabel}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium flex items-center gap-1">
                        <IconContacts size={14} />
                        {v.tenant_name}
                      </div>
                      <div className="text-[11px] text-[color:var(--color-fg-soft)]">{v.tenant_phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/inmueble/${v.property.id}`} className="font-medium hover:text-[color:var(--color-brand-700)] line-clamp-1">
                        {v.property.title.replace(/^Llave:\s*/, "")}
                      </Link>
                      <div className="text-[11px] text-[color:var(--color-fg-soft)]">{v.property.city}</div>
                    </td>
                    <td className="px-4 py-3 text-[color:var(--color-fg-muted)] text-xs hidden md:table-cell max-w-[200px]">
                      {v.note ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${STATUS_TONE[v.status]}`}>
                        {STATUS_LABEL[v.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`https://wa.me/${v.tenant_phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[color:var(--color-brand-700)] hover:underline"
                      >
                        <IconWhatsapp size={14} />
                        Recordatorio
                      </a>
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
