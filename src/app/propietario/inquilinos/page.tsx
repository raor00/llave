/**
 * /propietario/inquilinos — Listado de inquilinos activos en la cartera.
 *
 * Cada fila resume al inquilino: avatar placeholder con iniciales, nombre,
 * inmueble que ocupa, mensualidad, Trust Score, último pago y estado. CTA
 * "Hablar con Llavero sobre este inquilino" abre el chat con contexto.
 */

import Link from "next/link";
import { DEMO_OWNER } from "@/lib/db/seed-data";
import {
  DEMO_TENANTS,
  listContractsForOwner,
} from "@/lib/db/contracts";
import { getBalanceForContract } from "@/lib/db/payments";
import { formatUSD } from "@/lib/format";

export const dynamic = "force-dynamic";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function PropietarioInquilinosPage() {
  const contracts = listContractsForOwner(DEMO_OWNER.id);

  const tenants = contracts.map((c) => {
    const profile = DEMO_TENANTS.find((t) => t.id === c.tenant_id);
    const balance = getBalanceForContract(c.id);
    return {
      contract: c,
      profile,
      balance,
    };
  });

  return (
    <div className="container-x py-8 sm:py-10 space-y-8">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <span className="chip mb-2">Cartera · Inquilinos</span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">
            Tus inquilinos Llave
          </h1>
          <p className="text-sm text-[color:var(--color-fg-muted)] mt-1 max-w-2xl">
            Cada inquilino tiene su Trust Score validado por Llave. Sin RIF, sin constancia de trabajo — solo cédula y comportamiento real.
          </p>
        </div>
      </header>

      <section className="card overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead className="bg-[color:var(--color-bg)] text-left text-xs uppercase tracking-wider text-[color:var(--color-fg-soft)]">
            <tr>
              <th className="px-4 py-3 font-semibold">Inquilino</th>
              <th className="px-4 py-3 font-semibold">Inmueble</th>
              <th className="px-4 py-3 font-semibold">Mensual</th>
              <th className="px-4 py-3 font-semibold">Trust Score</th>
              <th className="px-4 py-3 font-semibold">Último pago</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {tenants.map(({ contract: c, profile, balance }) => {
              const atDay = balance.pending_usd <= 0;
              const score = profile?.trust_score ?? 700;
              return (
                <tr key={c.id} className="border-t border-[color:var(--color-border)]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-[color:var(--color-brand-100)] text-[color:var(--color-brand-700)] grid place-items-center font-semibold text-xs">
                        {initials(c.tenant.full_name)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium">{c.tenant.full_name}</div>
                        <div className="text-[11px] text-[color:var(--color-fg-soft)] font-mono">
                          CI {c.tenant.cedula}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/inmueble/${c.property_id}`}
                      className="font-medium hover:text-[color:var(--color-brand-700)] line-clamp-1"
                    >
                      {c.property?.title.replace(/^Llave:\s*/, "") ?? "Inmueble"}
                    </Link>
                    <div className="text-[11px] text-[color:var(--color-fg-soft)]">{c.property?.city}</div>
                  </td>
                  <td className="px-4 py-3 font-semibold">{formatUSD(c.monthly_amount)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="font-display text-base font-bold">{score}</div>
                      <div className="h-1.5 w-16 rounded-full bg-[color:var(--color-border)] overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[color:var(--color-brand-500)] to-[color:var(--color-accent)]"
                          style={{ width: `${Math.min(100, (score / 1000) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[color:var(--color-fg-muted)]">
                    {balance.last_payment_at
                      ? new Date(balance.last_payment_at).toLocaleDateString("es-VE", {
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
                      {atDay ? "Al día" : "Atrasado"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link
                      href={`/chat?context=${encodeURIComponent(
                        `Cuéntame sobre el inquilino ${c.tenant.full_name} del inmueble ${c.property?.title ?? ""}`
                      )}`}
                      className="text-[color:var(--color-brand-700)] hover:underline text-xs font-medium"
                    >
                      Hablar con Llavero →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
