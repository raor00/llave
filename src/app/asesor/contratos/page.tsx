/**
 * /asesor/contratos — Lista todos los contratos activos del asesor.
 *
 * Muestra stats (activos, próximos a vencer, vencidos, comisión proyectada),
 * filtros visuales por estado y una tabla con progreso del contrato.
 * La data viene del seed contracts-list (se reemplaza por query Supabase
 * cuando esté la tabla `contracts` con join a `properties` y `profiles`).
 */

import Link from "next/link";
import {
  listContracts,
  buildContractMetrics,
  getContractProgress,
  type ContractRowStatus,
} from "@/lib/db/contracts-list";
import { getOwnerProfile } from "@/lib/db/queries";
import { formatUSD } from "@/lib/format";
import { getGreeting } from "@/lib/greeting";
import { IconDocument } from "@/components/dashboard-icons";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<ContractRowStatus, string> = {
  activo: "Activo",
  proximo_vencer: "Próx. vencer",
  renegociacion: "Renegociación",
  vencido: "Vencido",
  cerrado: "Cerrado",
};

const STATUS_TONE: Record<ContractRowStatus, string> = {
  activo: "bg-[color:var(--color-brand-100)] text-[color:var(--color-brand-700)]",
  proximo_vencer: "bg-[color:var(--color-accent)] text-[color:var(--color-brand-900)]",
  renegociacion: "bg-[#e7f1ff] text-[#1877f2]",
  vencido: "bg-[color:var(--color-border)] text-[color:var(--color-fg-muted)]",
  cerrado: "bg-[color:var(--color-bg)] text-[color:var(--color-fg-soft)]",
};

const FILTERS: Array<{ id: string; label: string }> = [
  { id: "all", label: "Todos" },
  { id: "activo", label: "Activos" },
  { id: "proximo_vencer", label: "Próx. vencer" },
  { id: "renegociacion", label: "Renegociación" },
  { id: "cerrado", label: "Cerrados" },
];

export default async function ContratosPage() {
  const [rows, owner] = await Promise.all([listContracts(), getOwnerProfile()]);
  const metrics = buildContractMetrics(rows);
  const greeting = getGreeting(owner.full_name);

  return (
    <div className="container-x py-8 sm:py-10 space-y-8">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <span className="chip mb-2">Cartera · Contratos</span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">{greeting.full}</h1>
          <p className="text-sm text-[color:var(--color-fg-muted)] mt-1 max-w-2xl">
            Gestiona los contratos vigentes de tu cartera. Revisa cuáles están por vencer y planifica renovaciones.
          </p>
        </div>
        <Link href="/asesor/captacion" className="btn btn-primary text-sm">
          <IconDocument size={16} /> Nuevo contrato
        </Link>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Contratos activos" value={metrics.activos} hint="incluye próximos a vencer" highlight />
        <StatCard label="Próximos a vencer" value={metrics.proximos} hint="< 3 meses" />
        <StatCard label="Vencidos" value={metrics.vencidos} hint="renovar o cerrar" />
        <StatCard label="Comisión proyectada" value={formatUSD(metrics.proyectado)} hint="próxima ronda" />
      </section>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f, i) => (
          <span
            key={f.id}
            className={i === 0 ? "chip" : "chip-muted"}
          >
            {f.label}
          </span>
        ))}
      </div>

      {/* Tabla */}
      <section>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm min-w-[820px]">
            <thead className="bg-[color:var(--color-bg)] text-left text-xs uppercase tracking-wider text-[color:var(--color-fg-soft)]">
              <tr>
                <th className="px-4 py-3 font-semibold">Inquilino</th>
                <th className="px-4 py-3 font-semibold">Inmueble</th>
                <th className="px-4 py-3 font-semibold hidden md:table-cell">Inicio</th>
                <th className="px-4 py-3 font-semibold">Meses restantes</th>
                <th className="px-4 py-3 font-semibold">Mensual</th>
                <th className="px-4 py-3 font-semibold hidden md:table-cell">Comisión</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const progress = getContractProgress(row);
                const started = new Date(row.started_at).toLocaleDateString("es-VE", {
                  year: "numeric",
                  month: "short",
                });
                return (
                  <tr key={row.id} className="border-t border-[color:var(--color-border)]">
                    <td className="px-4 py-3">
                      <div className="font-medium">{row.tenant_name}</div>
                      <div className="text-[11px] text-[color:var(--color-fg-soft)]">{row.tenant_phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/inmueble/${row.property.id}`}
                        className="font-medium hover:text-[color:var(--color-brand-700)] line-clamp-1"
                      >
                        {row.property.title.replace(/^Llave:\s*/, "")}
                      </Link>
                      <div className="text-[11px] text-[color:var(--color-fg-soft)]">
                        {row.property.city} · {row.property.type}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[color:var(--color-fg-muted)] hidden md:table-cell">{started}</td>
                    <td className="px-4 py-3 min-w-[140px]">
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="font-semibold">{progress.monthsRemaining}</span>
                        <span className="text-[10px] text-[color:var(--color-fg-soft)]">
                          de {row.months_total}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[color:var(--color-border)] overflow-hidden">
                        <div
                          className="h-full bg-[color:var(--color-brand-500)]"
                          style={{ width: `${progress.progressPct}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold">{formatUSD(row.monthly_amount)}</td>
                    <td className="px-4 py-3 text-[color:var(--color-fg-muted)] hidden md:table-cell">
                      {formatUSD(row.commission_amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${STATUS_TONE[row.status]}`}>
                        {STATUS_LABEL[row.status]}
                      </span>
                      {row.notes && (
                        <div className="text-[10px] text-[color:var(--color-fg-soft)] mt-1 max-w-[200px] line-clamp-2">
                          {row.notes}
                        </div>
                      )}
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
