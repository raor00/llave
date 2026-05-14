"use client";

import { useState } from "react";

/**
 * Branded stepper para inputs numéricos: muestra el valor central con dos
 * botones (− / +) que respetan los límites min/max y emiten un hidden
 * `<input type="number" name>` para que el form serialize el valor sin
 * necesidad de manejarlo desde React en el padre.
 */
export function NumberStepper({
  name,
  defaultValue = 0,
  min = 0,
  max = 99,
  step = 1,
  required,
  ariaLabel,
}: {
  name: string;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  ariaLabel?: string;
}) {
  const [value, setValue] = useState<number>(defaultValue);

  function clamp(v: number) {
    if (Number.isNaN(v)) return min;
    return Math.max(min, Math.min(max, v));
  }

  return (
    <div
      className="input flex items-center justify-between gap-2 !py-1 !px-1.5"
      role="group"
      aria-label={ariaLabel ?? name}
    >
      <button
        type="button"
        onClick={() => setValue((v) => clamp(v - step))}
        disabled={value <= min}
        aria-label="Disminuir"
        className="size-7 rounded-md grid place-items-center text-[color:var(--color-brand-700)] hover:bg-[color:var(--color-brand-50)] disabled:opacity-30 disabled:cursor-not-allowed transition"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M5 12h14" />
        </svg>
      </button>

      <input
        type="number"
        name={name}
        value={value}
        onChange={(e) => setValue(clamp(Number(e.target.value)))}
        min={min}
        max={max}
        step={step}
        required={required}
        className="w-full text-center text-base font-display font-semibold bg-transparent outline-none border-0 p-0 focus:ring-0"
        inputMode="numeric"
      />

      <button
        type="button"
        onClick={() => setValue((v) => clamp(v + step))}
        disabled={value >= max}
        aria-label="Aumentar"
        className="size-7 rounded-md grid place-items-center text-[color:var(--color-brand-700)] hover:bg-[color:var(--color-brand-50)] disabled:opacity-30 disabled:cursor-not-allowed transition"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      </button>
    </div>
  );
}
