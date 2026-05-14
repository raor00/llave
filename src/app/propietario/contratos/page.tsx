/**
 * /propietario/contratos — Contratos de la cartera del propietario,
 * agrupados por inmueble. Cada fila enlaza al documento completo.
 */

import Link from "next/link";
import { DEMO_OWNER } from "@/lib/db/seed-data";
import {
  getContractProgress,
  listContractsForOwner,
  type FullContract,
} from "@/lib/db/contracts";
import { getBalanceForContract } from "@/lib/db/payments";
import { formatUSD } from "@/lib/format";
import { IconFileText } from "@/components/dashboard-icons";

export const dynamic = "force-dynamic";

export default async function PropietarioContratosPage() {
  const contracts = listContractsForOwner(DEMO_OWNER.id);

  // Agrupa por inmueble (mostramos un bloque por property con sus contratos).
  const byProperty = new Map<string, FullContract[]>();
  for (const c of contracts) {
    const key = c.property_id;
    const list = byProperty.get(key) ?? [];
    list.push(c);
    byProperty.set(key, list);
  }

  return (
    <div className="container-x py-8 sm:py-10 space-y-8">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <span className="chip mb-2">Cartera · Contratos</span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">
            Contratos firmados
          </h1>
          <p className="text-sm text-[color:var(--color-fg-muted)] mt-1 max-w-2xl">
            Cada contrato está bajo LRCAV y respaldado por la Garantía 360° de Llave. Sin papeleo manual.
          </p>
        </div>
        <Link
          href={`/chat?context=${encodeURIComponent("Quiero generar un contrato con un inquilino nuevo")}`}
          className="btn btn-primary text-sm"
        >
          <IconFileText size={16} /> Nuevo contrato
        </Link>
      </header>

      {byProperty.size === 0 ? (
        <div className="card p-10 text-center">
          <h3 className="font-display text-xl font-semibold">Aún no tienes contratos firmados</h3>
          <p className="text-sm text-[color:var(--color-fg-muted)] mt-2 max-w-md mx-auto">
            Cuando un inquilino pase por tu inmueble y firme con Llave, su contrato aparecerá acá automáticamente.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {[...byProperty.entries()].map(([propId, list]) => {
            const first = list[0];
            return (
              <section key={propId} className="card overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 bg-[color:var(--color-bg)] border-b border-[color:var(--color-border)]">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-[color:var(--color-fg-soft)]">
                      Inmueble
                    </div>
                    <div className="font-semibold">
                      {first.property?.title.replace(/^Llave:\s*/, "") ?? "Inmueble"}
                    </div>
                    <div className="text-xs text-[color:var(--color-fg-soft)]">
                      {first.property?.city} · {formatUSD(first.monthly_amount)}/mes
                    </div>
                  </div>
                  <Link
                    href={`/inmueble/${propId}`}
                    className="text-xs text-[color:var(--color-brand-700)] hover:underline"
                  >
                    Ver inmueble →
                  </Link>
                </div>
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase tracking-wider text-[color:var(--color-fg-soft)]">
                    <tr>
                      <th className="px-5 py-2 font-semibold">Inquilino</th>
                      <th className="px-5 py-2 font-semibold">Avance</th>
                      <th className="px-5 py-2 font-semibold">Mensual</th>
                      <th className="px-5 py-2 font-semibold">Saldo</th>
                      <th className="px-5 py-2 font-semibold">Estado</th>
                      <th className="px-5 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((c) => {
                      const progress = getContractProgress(c);
                      const balance = getBalanceForContract(c.id);
                      const atDay = balance.pending_usd <= 0;
                      return (
                        <tr key={c.id} className="border-t border-[color:var(--color-border)]">
                          <td className="px-5 py-3">
                            <div className="font-medium">{c.tenant.full_name}</div>
                            <div className="text-[11px] text-[color:var(--color-fg-soft)] font-mono">
                              CI {c.tenant.cedula}
                            </div>
                          </td>
                          <td className="px-5 py-3 min-w-[140px]">
                            <div className="flex items-baseline justify-between mb-1">
                              <span className="font-semibold">
                                {progress.monthsElapsed}/{c.months_total}
                              </span>
                              <span className="text-[10px] text-[color:var(--color-fg-soft)]">
                                {progress.progressPct}%
                              </span>
                            </div>
                            <div className="h-1.5 rounded-full bg-[color:var(--color-border)] overflow-hidden">
                              <div
                                className="h-full bg-[color:var(--color-brand-500)]"
                                style={{ width: `${progress.progressPct}%` }}
                              />
                            </div>
                          </td>
                          <td className="px-5 py-3 font-semibold">{formatUSD(c.monthly_amount)}</td>
                          <td className={`px-5 py-3 font-semibold ${atDay ? "text-[color:var(--color-brand-700)]" : "text-[color:var(--color-danger)]"}`}>
                            {atDay ? "Al día" : formatUSD(balance.pending_usd)}
                          </td>
                          <td className="px-5 py-3">
                            <span className="chip">{c.status}</span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <Link
                              href={`/contrato/${c.id}`}
                              className="text-[color:var(--color-brand-700)] hover:underline text-xs font-medium"
                            >
                              Abrir →
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
