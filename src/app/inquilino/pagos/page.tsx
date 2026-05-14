/**
 * /inquilino/pagos — Centro de pagos del inquilino.
 *
 * Muestra contrato activo + saldo, historial reciente y un formulario para
 * registrar un nuevo pago. Server action `recordPaymentAction` actualiza el
 * PAYMENTS_STORE y revalida la página. En demo usamos al primer inquilino
 * del seed; con Supabase real, este componente leerá `tenant_id` del user.
 */

import Link from "next/link";
import {
  DEMO_TENANTS,
  getContractProgress,
  listContractsForTenant,
} from "@/lib/db/contracts";
import {
  getBalanceForContract,
  listPaymentsForContract,
  periodForCurrentMonth,
  type Payment,
  type PaymentMethod,
} from "@/lib/db/payments";
import { formatUSD } from "@/lib/format";
import { PaymentForm } from "./payment-form";

export const dynamic = "force-dynamic";

const METHOD_LABEL: Record<PaymentMethod, string> = {
  transferencia: "Transferencia",
  pago_movil: "Pago Móvil",
  zelle: "Zelle",
  efectivo: "Efectivo",
  binance: "Binance",
};

export default async function InquilinoPagosPage() {
  const tenant = DEMO_TENANTS[0];
  const contracts = listContractsForTenant(tenant.id);
  const active = contracts[0];

  if (!active) {
    return (
      <div className="container-x py-10">
        <h1 className="font-display text-2xl font-bold">Pagos</h1>
        <p className="text-[color:var(--color-fg-muted)] mt-2">
          Cuando tengas un contrato activo, vas a poder registrar pagos acá.
        </p>
        <Link href="/buscar" className="btn btn-primary mt-4 text-sm">
          Ver inmuebles
        </Link>
      </div>
    );
  }

  const progress = getContractProgress(active);
  const balance = getBalanceForContract(active.id);
  const payments = listPaymentsForContract(active.id).slice(0, 6);
  const currentPeriod = periodForCurrentMonth();
  const paidThisMonth = payments.find((p) => p.period === currentPeriod);
  const atDay = balance.pending_usd <= 0;

  return (
    <div className="container-x py-8 sm:py-10 space-y-8">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <span className="chip mb-2">Mi Llave · Pagos</span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">
            Tus pagos Llave
          </h1>
          <p className="text-sm text-[color:var(--color-fg-muted)] mt-1 max-w-2xl">
            Registra cada pago con su comprobante y mira tu saldo en tiempo real. Cada pago a tiempo construye tu Trust Score.
          </p>
        </div>
        <Link
          href={`/contrato/${active.id}`}
          className="btn btn-outline text-sm"
        >
          Ver mi contrato
        </Link>
      </header>

      <section className="grid lg:grid-cols-[1.5fr_1fr] gap-5">
        <div className="card p-6 bg-gradient-to-br from-[color:var(--color-brand-50)] to-white">
          <div className="text-xs uppercase tracking-wider text-[color:var(--color-brand-700)] font-semibold">
            Contrato activo
          </div>
          <h2 className="font-display text-xl font-bold mt-1">
            {active.property?.title.replace(/^Llave:\s*/, "") ?? "Inmueble Llave"}
          </h2>
          <div className="text-sm text-[color:var(--color-fg-muted)] mt-1">
            {active.property?.city} · {formatUSD(active.monthly_amount)}/mes
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            <Mini label="Mes" value={`${progress.monthsElapsed}/${active.months_total}`} />
            <Mini
              label="Saldo"
              value={atDay ? "Al día" : formatUSD(balance.pending_usd)}
              highlight={atDay}
            />
            <Mini label="Pagados" value={`${balance.months_paid}`} />
            <Mini
              label="Último pago"
              value={
                balance.last_payment_at
                  ? new Date(balance.last_payment_at).toLocaleDateString("es-VE", {
                      day: "numeric",
                      month: "short",
                    })
                  : "—"
              }
            />
          </div>

          {atDay ? (
            <p className="text-sm mt-5 text-[color:var(--color-brand-700)]">
              Estás al día con tu canon. {paidThisMonth ? "Este mes ya quedó registrado." : "Cuando llegue el próximo, regístralo desde acá."}
            </p>
          ) : (
            <p className="text-sm mt-5 text-[color:var(--color-fg)]">
              Te falta <strong>{formatUSD(balance.pending_usd)}</strong> ({balance.months_due - balance.months_paid} mes
              {balance.months_due - balance.months_paid === 1 ? "" : "es"}). Regístralo abajo para evitar mora.
            </p>
          )}
        </div>

        <PaymentForm
          contractId={active.id}
          monthly={active.monthly_amount}
          currentPeriod={currentPeriod}
        />
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-3">Historial reciente</h2>
        {payments.length === 0 ? (
          <div className="card p-6 text-sm text-[color:var(--color-fg-muted)]">
            Aún no tienes pagos registrados.
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm min-w-[520px]">
              <thead className="bg-[color:var(--color-bg)] text-left text-xs uppercase tracking-wider text-[color:var(--color-fg-soft)]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Mes</th>
                  <th className="px-4 py-3 font-semibold">Monto</th>
                  <th className="px-4 py-3 font-semibold">Método</th>
                  <th className="px-4 py-3 font-semibold">Registrado</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <PaymentRow key={p.id} payment={p} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function PaymentRow({ payment }: { payment: Payment }) {
  const periodFmt = new Date(payment.period + "-15").toLocaleDateString("es-VE", {
    month: "long",
    year: "numeric",
  });
  const paid = new Date(payment.paid_at).toLocaleDateString("es-VE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return (
    <tr className="border-t border-[color:var(--color-border)]">
      <td className="px-4 py-3 capitalize">{periodFmt}</td>
      <td className="px-4 py-3 font-semibold">{formatUSD(payment.amount_usd)}</td>
      <td className="px-4 py-3 text-[color:var(--color-fg-muted)]">
        {METHOD_LABEL[payment.method]}
      </td>
      <td className="px-4 py-3 text-[color:var(--color-fg-soft)]">{paid}</td>
    </tr>
  );
}

function Mini({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-3 ${
        highlight
          ? "bg-[color:var(--color-brand-500)] text-white border-[color:var(--color-brand-500)]"
          : "bg-white border-[color:var(--color-border)]"
      }`}
    >
      <div
        className={`text-[10px] uppercase tracking-wider ${
          highlight ? "text-white/80" : "text-[color:var(--color-fg-soft)]"
        }`}
      >
        {label}
      </div>
      <div
        className={`font-display text-base sm:text-lg font-bold mt-0.5 ${
          highlight ? "text-white" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}
