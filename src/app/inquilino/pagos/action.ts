"use server";

import { revalidatePath } from "next/cache";
import {
  recordPayment,
  type PaymentMethod,
} from "@/lib/db/payments";

const VALID_METHODS: PaymentMethod[] = [
  "transferencia",
  "pago_movil",
  "zelle",
  "efectivo",
  "binance",
];

/**
 * Registra un pago desde el form del inquilino. Validación liviana —
 * monto > 0, método dentro del enum, period con formato YYYY-MM. Revalida
 * `/inquilino/pagos` para que la lista del historial se actualice de
 * inmediato.
 */
export async function recordPaymentAction(formData: FormData) {
  const contractId = String(formData.get("contract_id") ?? "").trim();
  const amount = Number(formData.get("amount_usd") ?? 0);
  const period = String(formData.get("period") ?? "").trim();
  const method = String(formData.get("method") ?? "") as PaymentMethod;

  if (!contractId) return { ok: false, error: "Falta el contrato." };
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "Monto inválido." };
  }
  if (!/^\d{4}-\d{2}$/.test(period)) {
    return { ok: false, error: "Mes inválido (usa YYYY-MM)." };
  }
  if (!VALID_METHODS.includes(method)) {
    return { ok: false, error: "Método de pago no soportado." };
  }

  const payment = recordPayment({
    contract_id: contractId,
    amount_usd: amount,
    period,
    method,
  });

  if (!payment) return { ok: false, error: "Contrato no encontrado." };

  revalidatePath("/inquilino/pagos");
  revalidatePath("/propietario/pagos");

  return { ok: true, payment_id: payment.id };
}
