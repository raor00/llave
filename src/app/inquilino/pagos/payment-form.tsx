"use client";

import { useState, useTransition } from "react";
import { recordPaymentAction } from "./action";

type Method = "transferencia" | "pago_movil" | "zelle" | "efectivo" | "binance";

const METHOD_LABEL: Record<Method, string> = {
  transferencia: "Transferencia bancaria",
  pago_movil: "Pago Móvil",
  zelle: "Zelle",
  efectivo: "Efectivo",
  binance: "Binance Pay",
};

/**
 * Form para registrar un pago. Llama al server action `recordPaymentAction`
 * y muestra feedback inline. Los selects + input están pre-llenados con el
 * monto sugerido (canon mensual) y el período actual para que el inquilino
 * solo confirme.
 */
export function PaymentForm({
  contractId,
  monthly,
  currentPeriod,
}: {
  contractId: string;
  monthly: number;
  currentPeriod: string;
}) {
  const [amount, setAmount] = useState(String(monthly));
  const [method, setMethod] = useState<Method>("transferencia");
  const [period, setPeriod] = useState(currentPeriod);
  const [feedback, setFeedback] = useState<
    { ok: boolean; msg: string } | null
  >(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("contract_id", contractId);
    fd.set("amount_usd", amount);
    fd.set("period", period);
    fd.set("method", method);
    startTransition(async () => {
      const res = await recordPaymentAction(fd);
      if (res.ok) {
        setFeedback({ ok: true, msg: "Pago registrado. Tu Trust Score sube." });
      } else {
        setFeedback({ ok: false, msg: res.error ?? "Error inesperado." });
      }
    });
  }

  return (
    <form onSubmit={submit} className="card p-5 space-y-4">
      <div>
        <div className="text-xs uppercase tracking-wider text-[color:var(--color-brand-700)] font-semibold">
          Registrar pago
        </div>
        <div className="text-sm text-[color:var(--color-fg-muted)] mt-1">
          Llave acepta múltiples métodos. Sube tu comprobante en Documentos para que el asesor lo valide.
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="amount">Monto (USD)</label>
          <input
            id="amount"
            type="number"
            className="input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={1}
            step={1}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="period">Mes pagado</label>
          <input
            id="period"
            type="month"
            className="input"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="method">Método de pago</label>
        <select
          id="method"
          className="input"
          value={method}
          onChange={(e) => setMethod(e.target.value as Method)}
        >
          {(Object.keys(METHOD_LABEL) as Method[]).map((m) => (
            <option key={m} value={m}>
              {METHOD_LABEL[m]}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary w-full"
      >
        {pending ? "Registrando…" : "Registrar pago"}
      </button>

      {feedback && (
        <div
          className={`rounded-md px-3 py-2 text-sm ${
            feedback.ok
              ? "bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] border border-[color:var(--color-brand-300)]"
              : "bg-amber-50 text-amber-800 border border-amber-200"
          }`}
        >
          {feedback.msg}
        </div>
      )}
    </form>
  );
}
