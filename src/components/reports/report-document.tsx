/**
 * ReportDocument — renderiza un ReportDoc como un one-pager ejecutivo compacto
 * y minimalista (header fino, KPIs en pills, tablas de filas delgadas, barras
 * cortas). Pensado para imprimirse como PDF denso; los controles interactivos
 * se marcan con .no-print en las páginas que lo usan.
 */

import type { ReportDoc, ReportSection } from "@/lib/reports/report-builder";

export function ReportDocument({ doc }: { doc: ReportDoc }) {
  return (
    <article className="max-w-[820px] mx-auto bg-white text-[color:var(--color-fg)] text-sm leading-snug">
      <header className="pb-3 border-b border-[color:var(--color-border)]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo.png" alt="Llave" className="size-6" />
            <span className="font-display text-base font-bold leading-none">Llave</span>
            <span className="text-[10px] uppercase tracking-wider text-[color:var(--color-brand-700)] font-semibold">
              Reporte {doc.scope === "asesor" ? "de asesor" : "de propietario"}
            </span>
          </div>
          <div className="text-[10px] text-[color:var(--color-fg-soft)] text-right">
            {doc.period.label} · Generado {doc.generatedAt}
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between gap-3">
          <h1 className="font-display text-lg sm:text-xl font-bold leading-tight">
            {doc.title}
          </h1>
        </div>
        <p className="text-xs text-[color:var(--color-fg-muted)] mt-0.5">
          {doc.subtitle}
        </p>
      </header>

      <div className="mt-4 space-y-5">
        {doc.sections.map((section, i) => (
          <Section key={`${section.heading}-${i}`} section={section} />
        ))}
      </div>

      <footer className="mt-6 pt-2 border-t border-[color:var(--color-border)] text-[9px] text-[color:var(--color-fg-soft)]">
        Llave · Marketplace de alquiler en Venezuela · Período {doc.period.label}.
        Reporte informativo, no constituye un documento legal.
      </footer>
    </article>
  );
}

function Section({ section }: { section: ReportSection }) {
  return (
    <section>
      <h2 className="font-display text-xs font-semibold uppercase tracking-wide text-[color:var(--color-fg-muted)] mb-2">
        {section.heading}
      </h2>

      {section.kind === "kpis" && section.kpis && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {section.kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-md border border-[color:var(--color-border)] px-2.5 py-1.5"
            >
              <div className="text-[9px] uppercase tracking-wide text-[color:var(--color-fg-soft)] leading-tight">
                {kpi.label}
              </div>
              <div className="font-display text-base font-bold text-[color:var(--color-brand-700)] mt-0.5 leading-none">
                {kpi.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {section.kind === "table" && section.columns && section.rows && (
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="text-left text-[9px] uppercase tracking-wide text-[color:var(--color-fg-soft)] border-b border-[color:var(--color-border)]">
              {section.columns.map((col) => (
                <th key={col} className="px-2 py-1 font-semibold">
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
                  className="px-2 py-2 text-center text-[color:var(--color-fg-soft)]"
                >
                  Sin registros para mostrar.
                </td>
              </tr>
            ) : (
              section.rows.map((row, ri) => (
                <tr
                  key={ri}
                  className="border-b border-[color:var(--color-border)] last:border-b-0 odd:bg-[color:var(--color-brand-50)]/40"
                >
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className={`px-2 py-1 ${
                        ci === 0
                          ? "font-medium text-[color:var(--color-fg)]"
                          : "text-[color:var(--color-fg-muted)]"
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {section.kind === "bars" && section.bars && (
        <ul className="space-y-1.5">
          {section.bars.map((bar) => {
            const max = Math.max(1, ...section.bars!.map((b) => b.value));
            const width = Math.max(3, Math.round((bar.value / max) * 100));
            return (
              <li key={bar.label} className="flex items-center gap-2">
                <span className="w-20 shrink-0 text-xs text-[color:var(--color-fg-muted)] truncate">
                  {bar.label}
                </span>
                <span className="flex-1 h-2 rounded-full bg-[color:var(--color-border)] overflow-hidden">
                  <span
                    className="block h-full bg-[color:var(--color-brand-500)]"
                    style={{ width: `${width}%` }}
                  />
                </span>
                <span className="w-12 shrink-0 text-right font-display text-xs font-bold text-[color:var(--color-brand-700)]">
                  {bar.value}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {section.note && (
        <p className="text-[11px] text-[color:var(--color-fg-muted)] mt-2 leading-relaxed">
          {section.note}
        </p>
      )}
    </section>
  );
}
