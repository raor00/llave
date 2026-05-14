/**
 * PeriodPicker — selector de período por chips de preset + rango personalizado
 * opcional (dos inputs date). Refleja la selección en la URL como
 * ?preset=&from=&to= con router.replace para que server components (páginas de
 * reportes) puedan resolver el período sin recarga completa. No es un calendario.
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { PERIOD_PRESETS, resolvePeriod, type PeriodPreset } from "@/lib/reports/period";

export function PeriodPicker() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const presetParam = searchParams.get("preset") ?? undefined;
  const fromParam = searchParams.get("from") ?? undefined;
  const toParam = searchParams.get("to") ?? undefined;
  const resolved = resolvePeriod(presetParam, fromParam, toParam);

  const [customFrom, setCustomFrom] = useState(resolved.from);
  const [customTo, setCustomTo] = useState(resolved.to);

  function pushParams(next: { preset: PeriodPreset; from?: string; to?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("preset", next.preset);
    if (next.preset === "personalizado" && next.from && next.to) {
      params.set("from", next.from);
      params.set("to", next.to);
    } else {
      params.delete("from");
      params.delete("to");
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  function onPreset(value: PeriodPreset) {
    if (value === "personalizado") {
      pushParams({ preset: "personalizado", from: customFrom, to: customTo });
    } else {
      pushParams({ preset: value });
    }
  }

  function onCustomChange(from: string, to: string) {
    setCustomFrom(from);
    setCustomTo(to);
    if (from && to) {
      pushParams({ preset: "personalizado", from, to });
    }
  }

  return (
    <div className="no-print">
      <div className="flex flex-wrap items-center gap-1.5">
        {PERIOD_PRESETS.map((p) => {
          const active = resolved.preset === p.value;
          return (
            <button
              key={p.value}
              type="button"
              onClick={() => onPreset(p.value)}
              aria-pressed={active}
              className={
                active
                  ? "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-[color:var(--color-brand-500)] text-white"
                  : "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-[color:var(--color-brand-50)] text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)] transition-colors"
              }
            >
              {p.label}
            </button>
          );
        })}
        <span className="text-xs text-[color:var(--color-fg-soft)] ml-1">
          {resolved.label}
        </span>
      </div>

      {resolved.preset === "personalizado" && (
        <div className="flex flex-wrap items-end gap-3 mt-3">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wide text-[color:var(--color-fg-soft)]">
              Desde
            </span>
            <input
              type="date"
              value={customFrom}
              max={customTo || undefined}
              onChange={(e) => onCustomChange(e.target.value, customTo)}
              className="input text-xs py-1.5 w-[150px]"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wide text-[color:var(--color-fg-soft)]">
              Hasta
            </span>
            <input
              type="date"
              value={customTo}
              min={customFrom || undefined}
              onChange={(e) => onCustomChange(customFrom, e.target.value)}
              className="input text-xs py-1.5 w-[150px]"
            />
          </label>
        </div>
      )}
    </div>
  );
}
