/**
 * /reporte/[type] — vista online de un reporte. Resuelve el ReportDoc según el
 * type, el scope (?scope=asesor|propietario) y el período (?preset&from&to), y
 * lo renderiza con un header minimalista .no-print (volver + PeriodPicker +
 * un solo botón "Descargar PDF" vía window.print).
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { buildReport, isReportType, type ReportScope } from "@/lib/reports/report-builder";
import { resolvePeriod } from "@/lib/reports/period";
import { ReportDocument } from "@/components/reports/report-document";
import { PeriodPicker } from "@/components/reports/period-picker";
import { PrintButton } from "@/components/contrato/print-button";

export const dynamic = "force-dynamic";

export default async function ReportePage({
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

  const backHref = scope === "propietario" ? "/propietario/reportes" : "/asesor/reportes";

  return (
    <div className="bg-white min-h-screen">
      <div className="container-x py-4 no-print border-b border-[color:var(--color-border)]">
        <div className="flex items-center justify-between gap-3">
          <Link href={backHref} className="btn btn-ghost text-sm">
            ← Volver a reportes
          </Link>
          <PrintButton variant="primary" label="Descargar PDF" />
        </div>
        <div className="mt-3">
          <PeriodPicker />
        </div>
      </div>
      <div className="container-x py-6 print:py-0">
        <ReportDocument doc={doc} />
      </div>
    </div>
  );
}
