/**
 * /reporte/[type]/print — variante solo documento del reporte. Sin chrome del
 * sitio ni PeriodPicker: resuelve el período desde la URL (?preset&from&to),
 * renderiza el ReportDocument y auto-dispara window.print() al montar.
 */

import { notFound } from "next/navigation";
import { buildReport, isReportType, type ReportScope } from "@/lib/reports/report-builder";
import { resolvePeriod } from "@/lib/reports/period";
import { ReportDocument } from "@/components/reports/report-document";
import { AutoPrint } from "@/components/contrato/auto-print";

export const dynamic = "force-dynamic";

export default async function ReportePrintPage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ scope?: string; preset?: string; from?: string; to?: string }>;
}) {
  const { type } = await params;
  const { scope: scopeParam, preset, from, to } = await searchParams;
  if (!isReportType(type)) return notFound();
  const scope: ReportScope = scopeParam === "propietario" ? "propietario" : "asesor";
  const period = resolvePeriod(preset, from, to);
  const doc = await buildReport(type, scope, period);

  return (
    <div className="bg-white min-h-screen py-8 px-6 print:p-0">
      <AutoPrint />
      <ReportDocument doc={doc} />
    </div>
  );
}
