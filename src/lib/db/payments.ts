/**
 * Pagos del modelo Llave — store en memoria mientras Supabase no esté listo.
 *
 * Cada pago está atado a un contrato del `CONTRACTS_STORE`. El balance del
 * propietario se calcula sumando pagos por mes y comparándolo contra el canon
 * mensual. El seed produce un historial de 6 meses para algunos contratos
 * (al día) y otros con un mes pendiente, para que los dashboards demo se
 * vean realistas.
 */

import { CONTRACTS_STORE } from "./contracts";

export type PaymentMethod =
  | "transferencia"
  | "pago_movil"
  | "zelle"
  | "efectivo"
  | "binance";

export type Payment = {
  id: string;
  contract_id: string;
  owner_id: string;
  tenant_id: string;
  amount_usd: number;
  period: string; // YYYY-MM
  method: PaymentMethod;
  paid_at: string; // ISO datetime
  status: "registrado" | "pendiente" | "fallido";
};

function periodFromDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? `pay-${crypto.randomUUID().slice(0, 12)}`
    : `pay-${Math.random().toString(36).slice(2, 14)}`;
}

/**
 * Construye un seed determinista a partir del store de contratos. Cobra los
 * últimos N meses según el patrón: contratos #0 y #4 al día (6 meses), #1 al
 * día 5 meses, #2 con un mes faltante (paga 4 últimos), #3 (renegociacion)
 * con 2 meses faltantes. El total queda entre 12-16 pagos.
 */
function buildSeedPayments(): Payment[] {
  const out: Payment[] = [];
  const now = new Date();
  const recentMonths = (n: number) =>
    Array.from({ length: n }, (_, i) => {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      d.setDate(5);
      return d;
    }).reverse();

  const METHODS: PaymentMethod[] = [
    "transferencia",
    "pago_movil",
    "zelle",
    "binance",
    "transferencia",
    "pago_movil",
  ];

  const PATTERN = [6, 5, 4, 3, 6]; // por índice de CONTRACTS_STORE

  CONTRACTS_STORE.forEach((contract, idx) => {
    const monthsPaid = PATTERN[idx] ?? 0;
    const dates = recentMonths(monthsPaid);
    dates.forEach((d, i) => {
      out.push({
        id: newId(),
        contract_id: contract.id,
        owner_id: contract.owner_id,
        tenant_id: contract.tenant_id,
        amount_usd: contract.monthly_amount,
        period: periodFromDate(d),
        method: METHODS[i % METHODS.length],
        paid_at: d.toISOString(),
        status: "registrado",
      });
    });
  });

  return out;
}

export const PAYMENTS_STORE: Payment[] = buildSeedPayments();

export function listPaymentsForContract(contractId: string): Payment[] {
  return PAYMENTS_STORE
    .filter((p) => p.contract_id === contractId)
    .sort((a, b) => b.paid_at.localeCompare(a.paid_at));
}

export function listPaymentsForTenant(tenantId: string): Payment[] {
  return PAYMENTS_STORE
    .filter((p) => p.tenant_id === tenantId)
    .sort((a, b) => b.paid_at.localeCompare(a.paid_at));
}

export function listPaymentsForOwner(ownerId: string): Payment[] {
  return PAYMENTS_STORE
    .filter((p) => p.owner_id === ownerId)
    .sort((a, b) => b.paid_at.localeCompare(a.paid_at));
}

export function recordPayment(input: {
  contract_id: string;
  amount_usd: number;
  period: string;
  method: PaymentMethod;
}): Payment | null {
  const contract = CONTRACTS_STORE.find((c) => c.id === input.contract_id);
  if (!contract) return null;
  const payment: Payment = {
    id: newId(),
    contract_id: contract.id,
    owner_id: contract.owner_id,
    tenant_id: contract.tenant_id,
    amount_usd: input.amount_usd,
    period: input.period,
    method: input.method,
    paid_at: new Date().toISOString(),
    status: "registrado",
  };
  PAYMENTS_STORE.unshift(payment);
  return payment;
}

/**
 * Balance del contrato: suma de cánones desde el inicio del contrato menos
 * los pagos registrados. Negativo significa que el propietario ha cobrado de
 * más (raro). Positivo significa mora.
 */
export function getBalanceForContract(contractId: string): {
  due_usd: number;
  paid_usd: number;
  pending_usd: number;
  months_due: number;
  months_paid: number;
  last_payment_at: string | null;
} {
  const contract = CONTRACTS_STORE.find((c) => c.id === contractId);
  if (!contract) {
    return {
      due_usd: 0,
      paid_usd: 0,
      pending_usd: 0,
      months_due: 0,
      months_paid: 0,
      last_payment_at: null,
    };
  }
  const start = new Date(contract.started_at);
  const now = new Date();
  const elapsed =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth()) +
    1; // incluye el mes en curso
  const monthsDue = Math.max(0, Math.min(contract.months_total, elapsed));
  const due = monthsDue * contract.monthly_amount;
  const payments = listPaymentsForContract(contractId);
  const paid = payments.reduce((acc, p) => acc + p.amount_usd, 0);
  const lastPaymentAt = payments[0]?.paid_at ?? null;
  return {
    due_usd: due,
    paid_usd: paid,
    pending_usd: Math.max(0, due - paid),
    months_due: monthsDue,
    months_paid: payments.length,
    last_payment_at: lastPaymentAt,
  };
}

export function getBalanceForOwner(ownerId: string): {
  total_pending_usd: number;
  total_paid_ytd_usd: number;
  total_due_usd: number;
} {
  const contracts = CONTRACTS_STORE.filter((c) => c.owner_id === ownerId);
  const year = new Date().getFullYear();
  let pending = 0;
  let paidYtd = 0;
  let due = 0;
  for (const c of contracts) {
    const b = getBalanceForContract(c.id);
    pending += b.pending_usd;
    due += b.due_usd;
  }
  paidYtd = PAYMENTS_STORE
    .filter(
      (p) => p.owner_id === ownerId && new Date(p.paid_at).getFullYear() === year
    )
    .reduce((acc, p) => acc + p.amount_usd, 0);
  return {
    total_pending_usd: pending,
    total_paid_ytd_usd: paidYtd,
    total_due_usd: due,
  };
}

/**
 * Pagos agrupados por mes (últimos N meses) para gráficos del propietario.
 */
export function getOwnerMonthlySeries(
  ownerId: string,
  monthsBack: number = 6
): Array<{ month: string; label: string; total_usd: number }> {
  const now = new Date();
  const series: Array<{ month: string; label: string; total_usd: number }> = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    const month = periodFromDate(d);
    const label = d.toLocaleDateString("es-VE", { month: "short" });
    const total = PAYMENTS_STORE
      .filter((p) => p.owner_id === ownerId && p.period === month)
      .reduce((acc, p) => acc + p.amount_usd, 0);
    series.push({ month, label, total_usd: total });
  }
  return series;
}

export function periodForCurrentMonth(): string {
  return periodFromDate(new Date());
}
