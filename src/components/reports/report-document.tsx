/**
 * ReportDocument — renderiza un ReportDoc (header de marca + secciones kpis,
 * table o bars). Diseñado para verse bien en pantalla y al imprimir como PDF;
 * los controles interactivos se marcan con .no-print en las páginas que lo usan.
 */

import type { ReportDoc, ReportSection } from "@/lib/reports/report-builder";

export function ReportDocument({ doc }: { doc: ReportDoc }) {
  return (
    <article className="max-w-[900px] mx-auto bg-white text-[color:var(--color-fg)]">
      <header className="flex items-start justify-between gap-4 pb-5 border-b-2 border-[color:var(--color-brand-500)]">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.png" alt="Llave" className="size-10" />
          <div>
            <div className="font-display text-xl font-bold leading-none">Llave</div>
            <div className="text-[11px] uppercase tracking-wider text-[color:var(--color-brand-700)] font-semibold mt-1">
              Reporte {doc.scope === "asesor" ? "de asesor" : "de propietario"}
            </div>
          </div>
        </div>
        <div className="text-right text-[11px] text-[color:var(--color-fg-soft)]">
          Generado el {doc.generatedAt}
        </div>
      </header>

      <div className="mt-6">
        <h1 className="font-display text-2xl sm:text-3xl font-bold">{doc.title}</h1>
        <p className="text-sm text-[color:var(--color-fg-muted)] mt-1">{doc.subtitle}</p>
      </div>

      <div className="mt-8 space-y-8">
        {doc.sections.map((section, i) => (
          <Section key={`${section.heading}-${i}`} section={section} />
        ))}
      </div>

      <footer className="mt-10 pt-4 border-t border-[color:var(--color-border)] text-[10px] text-[color:var(--color-fg-soft)]">
        Llave · Marketplace de alquiler en Venezuela · Datos generados desde el panel.
        Este reporte es informativo y no constituye un documento legal.
      </footer>
    </article>
  );
}

function Section({ section }: { section: ReportSection }) {
  return (
    <section>
      <h2 className="font-display text-lg font-semibold mb-3">{section.heading}</h2>
      {section.kind === "kpis" && section.kpis && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {section.kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-lg border border-[color:var(--color-border)] p-4"
            >
              <div className="text-[10px] uppercase tracking-wide text-[color:var(--color-fg-soft)]">
                {kpi.label}
              </div>
              <div className="font-display text-xl sm:text-2xl font-bold mt-1">
                {kpi.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {section.kind === "table" && section.columns && section.rows && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-[color:var(--color-border)]">
            <thead className="bg-[color:var(--color-bg)] text-left text-xs uppercase tracking-wider text-[color:var(--color-fg-soft)]">
              <tr>
                {section.columns.map((col) => (
                  <th key={col} className="px-3 py-2 font-semibold">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={section.columns.length}
                    className="px-3 py-4 text-center text-[color:var(--color-fg-soft)]"
                  >
                    Sin registros para mostrar.
                  </td>
                </tr>
              ) : (
                section.rows.map((row, ri) => (
                  <tr
                    key={ri}
                    className="border-t border-[color:var(--color-border)]"
                  >
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3 py-2">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {section.kind === "bars" && section.bars && (
        <ul className="space-y-2.5">
          {section.bars.map((bar) => {
            const max = Math.max(1, ...section.bars!.map((b) => b.value));
            const width = Math.max(4, Math.round((bar.value / max) * 100));
            return (
              <li key={bar.label}>
                <div className="flex items-baseline justify-between mb-1 text-sm">
                  <span className="font-medium">{bar.label}</span>
                  <span className="font-display font-bold">{bar.value}</span>
                </div>
                <div className="h-3 rounded-full bg-[color:var(--color-border)] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[color:var(--color-brand-500)] to-[color:var(--color-accent)]"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {section.note && (
        <p className="text-xs text-[color:var(--color-fg-muted)] mt-3 leading-relaxed">
          {section.note}
        </p>
      )}
    </section>
  );
}
