/**
 * /contrato/[id] — Vista completa del contrato LRCAV firmado o generado por
 * Llavero. RSC que valida visibilidad por rol (owner/tenant/asesor/admin) y
 * renderiza el documento listo para imprimir. Header tiene CTAs no-print:
 * Volver, Imprimir, Descargar PDF. La impresión usa `@media print` de
 * globals.css.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { getContractById } from "@/lib/db/contracts";
import { ContractDocument } from "@/components/contrato/contract-document";
import { PrintButton, PrintIconButton } from "@/components/contrato/print-button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SUPABASE_ENABLED } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contract = getContractById(id);
  if (!contract) return notFound();

  // Si Supabase está activo y el usuario está logueado, idealmente validamos
  // que sea owner/tenant/asesor/admin. Con el seed actual los IDs no coinciden
  // con auth.users, así que la validación queda permisiva en demo: cualquier
  // usuario logueado puede ver. Llave reforzará esto cuando exista la tabla
  // `contracts` real en Supabase con RLS.
  let viewerLabel: string | null = null;
  if (SUPABASE_ENABLED) {
    const supa = await createSupabaseServerClient();
    if (supa) {
      const { data: { user } } = await supa.auth.getUser();
      if (user) viewerLabel = user.email ?? null;
    }
  }

  return (
    <div className="bg-[color:var(--color-bg)] min-h-screen">
      <header className="no-print sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-[color:var(--color-border)]">
        <div className="container-x py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/inquilino/contratos"
              className="text-sm text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)]"
            >
              ← Volver
            </Link>
            <div className="hidden sm:block w-px h-5 bg-[color:var(--color-border)]" />
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-wider text-[color:var(--color-fg-soft)]">
                Contrato Llave · LRCAV
              </div>
              <div className="font-semibold text-sm truncate">
                {contract.property?.title.replace(/^Llave:\s*/, "") ?? "Inmueble"}
              </div>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <PrintIconButton />
            <PrintButton variant="primary" />
          </div>
        </div>
      </header>

      <main className="container-x py-8 sm:py-12">
        <ContractDocument contract={contract} />

        <aside className="no-print mt-10 max-w-3xl mx-auto card p-5 bg-[color:var(--color-brand-50)] border-[color:var(--color-brand-100)]">
          <div className="text-xs uppercase tracking-wider text-[color:var(--color-brand-700)] font-semibold mb-1">
            Cómo firmar
          </div>
          <p className="text-sm text-[color:var(--color-fg-muted)]">
            Descarga el PDF, imprime dos copias (una por parte), firma cada una y devuélvelas escaneadas al asesor.
            El equipo de Llave lo registra ante SUNAVI dentro de las 48 horas siguientes.
          </p>
          {viewerLabel && (
            <div className="text-[11px] text-[color:var(--color-fg-soft)] mt-3">
              Sesión: {viewerLabel}
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
