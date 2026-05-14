/**
 * /reporte/[type] — vista online de un reporte. Resuelve el ReportDoc según el
 * type y el scope (?scope=asesor|propietario) y lo renderiza con controles
 * .no-print para volver o descargar el PDF (window.print del navegador).
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { buildReport, isReportType, type ReportScope } from "@/lib/reports/report-builder";
import { ReportDocument } from "@/components/reports/report-document";
import { PrintButton } from "@/components/contrato/print-button";

export const dynamic = "force-dynamic";

export default async function ReportePage({
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

  const backHref = scope === "propietario" ? "/propietario/reportes" : "/asesor/reportes";

  return (
    <div className="bg-white min-h-screen">
      <div className="container-x py-6 flex items-center justify-between gap-3 no-print">
        <Link href={backHref} className="btn btn-ghost text-sm">
          ← Volver a reportes
        </Link>
        <div className="flex items-center gap-2">
          <a
            href={`/reporte/${type}/print?scope=${scope}`}
            className="btn btn-outline text-sm"
          >
            Abrir versión imprimible
          </a>
          <PrintButton variant="primary" label="Descargar PDF" />
        </div>
      </div>
      <div className="container-x pb-12 print:py-0">
        <ReportDocument doc={doc} />
      </div>
    </div>
  );
}
