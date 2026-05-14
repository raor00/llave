/**
 * /propietario/pagos — Vista de cobros del dueño.
 *
 * Total cobrado YTD, saldo pendiente, lista por inmueble con su inquilino,
 * monto mensual, último pago, próximo pago, estado (al día / atrasado X
 * meses) y CTA "Recordar a inquilino" (no-op por ahora). Bottom: gráfico
 * de cobros de los últimos 6 meses, hecho con barras CSS (sin libs).
 */

import Link from "next/link";
import { DEMO_OWNER } from "@/lib/db/seed-data";
import {
  getContractProgress,
  listContractsForOwner,
} from "@/lib/db/contracts";
import {
  getBalanceForContract,
  getBalanceForOwner,
  getOwnerMonthlySeries,
  listPaymentsForContract,
  periodForCurrentMonth,
} from "@/lib/db/payments";
import { formatUSD } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PropietarioPagosPage() {
  const ownerId = DEMO_OWNER.id;
  const totals = getBalanceForOwner(ownerId);
  const contracts = listContractsForOwner(ownerId);
  const series = getOwnerMonthlySeries(ownerId, 6);
  const period = periodForCurrentMonth();

  const rows = contracts.map((c) => {
    const balance = getBalanceForContract(c.id);
    const progress = getContractProgress(c);
    const payments = listPaymentsForContract(c.id);
    const paidThisMonth = payments
      .filter((p) => p.period === period)
      .reduce((acc, p) => acc + p.amount_usd, 0);
    const monthsLate = balance.months_due - balance.months_paid;
    return {
      contract: c,
      balance,
      progress,
      lastPaymentAt: balance.last_payment_at,
      paidThisMonth,
      monthsLate,
    };
  });

  const maxSeries = Math.max(1, ...series.map((s) => s.total_usd));

  return (
    <div className="container-x py-8 sm:py-10 space-y-8">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <span className="chip mb-2">Cartera · Pagos</span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">
            Cobros de tu cartera
          </h1>
          <p className="text-sm text-[color:var(--color-fg-muted)] mt-1 max-w-2xl">
            Llave concilia tus pagos por inmueble y te avisa cuando alguien atrasa. La Garantía 360° cubre hasta un mes de mora.
          </p>
        </div>
        <Link
          href={`/chat?context=${encodeURIComponent("¿Cómo está mi cobro este mes?")}`}
          className="btn btn-primary text-sm"
        >
          Pregunta a Llavero
        </Link>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Pendiente por cobrar" value={formatUSD(totals.total_pending_usd)} hint="incluye atrasos" highlight />
        <StatCard label="Cobrado este año" value={formatUSD(totals.total_paid_ytd_usd)} hint="suma 12 meses" />
        <StatCard label="Inmuebles con contrato" value={contracts.length} hint="cartera Llave" />
        <StatCard label="Mora cubierta" value="1 mes" hint="Garantía 360°" />
      </section>

      <section className="card p-6">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display text-lg font-semibold">Cobros últimos 6 meses</h2>
          <span className="text-xs text-[color:var(--color-fg-soft)]">total mensual</span>
        </div>
        <div className="flex items-end gap-2 h-36">
          {series.map((s, i) => {
            const pct = Math.round((s.total_usd / maxSeries) * 100);
            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-[color:var(--color-brand-700)] to-[color:var(--color-brand-400)]"
                  style={{ height: `${Math.max(6, pct)}%` }}
                  title={formatUSD(s.total_usd)}
                />
                <div className="text-[10px] text-[color:var(--color-fg-soft)] capitalize">{s.label}</div>
                <div className="text-[10px] text-[color:var(--color-fg-muted)]">
                  {formatUSD(s.total_usd)}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-3">Por inmueble</h2>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm min-w-[820px]">
            <thead className="bg-[color:var(--color-bg)] text-left text-xs uppercase tracking-wider text-[color:var(--color-fg-soft)]">
              <tr>
                <th className="px-4 py-3 font-semibold">Inmueble</th>
                <th className="px-4 py-3 font-semibold">Inquilino</th>
                <th className="px-4 py-3 font-semibold">Mensual</th>
                <th className="px-4 py-3 font-semibold">Cobrado este mes</th>
                <th className="px-4 py-3 font-semibold">Último pago</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ contract: c, balance, lastPaymentAt, paidThisMonth, monthsLate }) => {
                const atDay = balance.pending_usd <= 0;
                return (
                  <tr key={c.id} className="border-t border-[color:var(--color-border)]">
                    <td className="px-4 py-3">
                      <div className="font-medium line-clamp-1">
                        {c.property?.title.replace(/^Llave:\s*/, "") ?? "Inmueble"}
                      </div>
                      <div className="text-[11px] text-[color:var(--color-fg-soft)]">{c.property?.city}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{c.tenant.full_name}</div>
                      <div className="text-[11px] text-[color:var(--color-fg-soft)] font-mono">
                        CI {c.tenant.cedula}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold">{formatUSD(c.monthly_amount)}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{formatUSD(paidThisMonth)}</div>
                      {paidThisMonth >= c.monthly_amount ? (
                        <div className="text-[11px] text-[color:var(--color-brand-700)]">Recibido</div>
                      ) : paidThisMonth > 0 ? (
                        <div className="text-[11px] text-[color:var(--color-fg-soft)]">Parcial</div>
                      ) : (
                        <div className="text-[11px] text-[color:var(--color-fg-soft)]">Pendiente</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[color:var(--color-fg-muted)]">
                      {lastPaymentAt
                        ? new Date(lastPaymentAt).toLocaleDateString("es-VE", {
                            day: "numeric",
                            month: "short",
                          })
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${
                          atDay
                            ? "bg-[color:var(--color-brand-100)] text-[color:var(--color-brand-700)]"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {atDay ? "Al día" : `Atrasado ${monthsLate} mes${monthsLate === 1 ? "" : "es"}`}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        disabled={atDay}
                        className={`text-xs font-medium ${
                          atDay
                            ? "text-[color:var(--color-fg-soft)] cursor-not-allowed"
                            : "text-[color:var(--color-brand-700)] hover:underline"
                        }`}
                      >
                        Recordar →
                      </button>
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
      <div className="text-[10px] sm:text-xs text-[color:var(--color-fg-soft)] uppercase tracking-wide">
        {label}
      </div>
      <div className="font-display text-2xl sm:text-3xl font-bold mt-1">{value}</div>
      {hint && <div className="text-[10px] sm:text-xs text-[color:var(--color-fg-muted)] mt-1">{hint}</div>}
    </div>
  );
}
