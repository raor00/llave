/**
 * /inquilino/contratos — Lista de contratos del inquilino actual.
 *
 * En demo (sin Supabase enlazado a DEMO_TENANTS) tomamos al primer inquilino
 * del seed para que la página nunca aparezca vacía. Cuando exista la tabla
 * `contracts` con `tenant_id` apuntando a `auth.users`, este componente
 * leerá el id real del usuario logueado.
 */

import Link from "next/link";
import {
  DEMO_TENANTS,
  getContractProgress,
  listContractsForTenant,
} from "@/lib/db/contracts";
import { getBalanceForContract } from "@/lib/db/payments";
import { formatUSD } from "@/lib/format";
import { IconDocument, IconFileText } from "@/components/dashboard-icons";

export const dynamic = "force-dynamic";

export default async function InquilinoContratosPage() {
  // Demo: usamos al primer tenant para que la vista esté poblada.
  const tenant = DEMO_TENANTS[0];
  const contracts = listContractsForTenant(tenant.id);

  return (
    <div className="container-x py-8 sm:py-10 space-y-8">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <span className="chip mb-2">Mi Llave · Contratos</span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">
            Tus contratos Llave
          </h1>
          <p className="text-sm text-[color:var(--color-fg-muted)] mt-1 max-w-2xl">
            Cada contrato está respaldado por la LRCAV y el Fondo Garantía 360°. Cero depósito retenido.
          </p>
        </div>
        <Link
          href={`/chat?context=${encodeURIComponent("Quiero generar o renovar un contrato")}`}
          className="btn btn-primary text-sm"
        >
          <IconFileText size={16} /> Generar contrato con Llavero
        </Link>
      </header>

      {contracts.length === 0 ? (
        <section className="card p-10 text-center">
          <div className="size-12 rounded-full bg-[color:var(--color-brand-50)] grid place-items-center mx-auto text-[color:var(--color-brand-700)]">
            <IconDocument size={24} />
          </div>
          <h3 className="font-display text-xl font-semibold mt-4">
            Todavía no tienes contratos activos
          </h3>
          <p className="text-sm text-[color:var(--color-fg-muted)] mt-2 max-w-md mx-auto">
            Cuando firmes tu primer alquiler en Llave, vas a verlo acá con todas las cláusulas LRCAV listas para descargar.
          </p>
          <Link href="/buscar" className="btn btn-outline mt-5 text-sm">
            Ver inmuebles disponibles
          </Link>
        </section>
      ) : (
        <section className="card overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-[color:var(--color-bg)] text-left text-xs uppercase tracking-wider text-[color:var(--color-fg-soft)]">
              <tr>
                <th className="px-4 py-3 font-semibold">Inmueble</th>
                <th className="px-4 py-3 font-semibold">Mensual</th>
                <th className="px-4 py-3 font-semibold">Avance</th>
                <th className="px-4 py-3 font-semibold">Restantes</th>
                <th className="px-4 py-3 font-semibold">Saldo</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c) => {
                const progress = getContractProgress(c);
                const balance = getBalanceForContract(c.id);
                const atDay = balance.pending_usd <= 0;
                return (
                  <tr key={c.id} className="border-t border-[color:var(--color-border)]">
                    <td className="px-4 py-3">
                      <div className="font-medium line-clamp-1">
                        {c.property?.title.replace(/^Llave:\s*/, "") ?? "Inmueble"}
                      </div>
                      <div className="text-[11px] text-[color:var(--color-fg-soft)]">
                        {c.property?.city} · Desde{" "}
                        {new Date(c.started_at).toLocaleDateString("es-VE", {
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {formatUSD(c.monthly_amount)}
                    </td>
                    <td className="px-4 py-3 min-w-[140px]">
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
                    <td className="px-4 py-3">
                      {progress.monthsRemaining} mes
                      {progress.monthsRemaining === 1 ? "" : "es"}
                    </td>
                    <td className={`px-4 py-3 font-semibold ${atDay ? "text-[color:var(--color-brand-700)]" : "text-[color:var(--color-danger)]"}`}>
                      {atDay ? "Al día" : formatUSD(balance.pending_usd)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/contrato/${c.id}`}
                        className="text-[color:var(--color-brand-700)] hover:underline text-xs font-medium"
                      >
                        Ver contrato →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
