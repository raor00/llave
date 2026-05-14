/**
 * /contrato/[id]/print — Vista solo documento para impresión. Auto-dispara
 * `window.print()` al montar y oculta toda la cromática del sitio (sin
 * sidebar, sin header global). El archivo `layout.tsx` hermano hace el
 * trabajo: usa solo `<html><body>` mínimo.
 */

import { notFound } from "next/navigation";
import { getContractById } from "@/lib/db/contracts";
import { ContractDocument } from "@/components/contrato/contract-document";
import { AutoPrint } from "@/components/contrato/auto-print";

export const dynamic = "force-dynamic";

export default async function ContractPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contract = getContractById(id);
  if (!contract) return notFound();

  return (
    <div className="bg-white min-h-screen py-8 px-6 print:p-0">
      <AutoPrint />
      <ContractDocument contract={contract} />
    </div>
  );
}
