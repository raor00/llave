/**
 * /reporte/[type]/print — variante solo documento del reporte. Sin chrome del
 * sitio: renderiza el ReportDocument y auto-dispara window.print() al montar
 * reutilizando AutoPrint, igual que /contrato/[id]/print.
 */

import { notFound } from "next/navigation";
import { buildReport, isReportType, type ReportScope } from "@/lib/reports/report-builder";
import { ReportDocument } from "@/components/reports/report-document";
import { AutoPrint } from "@/components/contrato/auto-print";

export const dynamic = "force-dynamic";

export default async function ReportePrintPage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ scope?: string }>;
}) {
  const { type } = await params;
  const { scope: scopeParam } = await searchParams;
  if (!isReportType(type)) return notFound();
  const scope: ReportScope = scopeParam === "propietario" ? "propietario" : "asesor";
  const doc = await buildReport(type, scope);

  return (
    <div className="bg-white min-h-screen py-8 px-6 print:p-0">
      <AutoPrint />
      <ReportDocument doc={doc} />
    </div>
  );
}
