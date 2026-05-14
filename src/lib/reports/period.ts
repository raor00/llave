/**
 * period — resuelve un rango de fechas (from/to ISO) y su etiqueta legible en
 * español a partir de un preset ("este-mes", "mes-pasado", etc.) o de fechas
 * explícitas para el modo "personalizado". Usado por el PeriodPicker y por
 * buildReport para que el PDF refleje el período seleccionado.
 */

export type PeriodPreset =
  | "este-mes"
  | "mes-pasado"
  | "ultimos-3"
  | "este-anio"
  | "personalizado";

export type ResolvedPeriod = {
  from: string;
  to: string;
  label: string;
  preset: PeriodPreset;
};

export const PERIOD_PRESETS: Array<{ value: PeriodPreset; label: string }> = [
  { value: "este-mes", label: "Este mes" },
  { value: "mes-pasado", label: "Mes pasado" },
  { value: "ultimos-3", label: "Últimos 3 meses" },
  { value: "este-anio", label: "Este año" },
  { value: "personalizado", label: "Personalizado" },
];

const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const MONTHS_SHORT = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseISO(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function isPreset(value: string): value is PeriodPreset {
  return PERIOD_PRESETS.some((p) => p.value === value);
}

/** Etiqueta legible para un rango arbitrario: "1 ene – 14 may 2026". */
function rangeLabel(from: Date, to: Date): string {
  const sameYear = from.getFullYear() === to.getFullYear();
  const left = `${from.getDate()} ${MONTHS_SHORT[from.getMonth()]}${
    sameYear ? "" : ` ${from.getFullYear()}`
  }`;
  const right = `${to.getDate()} ${MONTHS_SHORT[to.getMonth()]} ${to.getFullYear()}`;
  return `${left} – ${right}`;
}

/**
 * resolvePeriod computa from/to ISO y la etiqueta a partir de un preset
 * (default "este-mes") o de fechas explícitas cuando el preset es
 * "personalizado". Siempre devuelve un ResolvedPeriod válido.
 */
export function resolvePeriod(
  preset?: string,
  from?: string,
  to?: string
): ResolvedPeriod {
  const now = new Date();
  const resolved: PeriodPreset =
    preset && isPreset(preset) ? preset : "este-mes";

  if (resolved === "personalizado") {
    const fromDate = (from && parseISO(from)) || startOfMonth(now);
    const toDate = (to && parseISO(to)) || now;
    const [a, b] = fromDate <= toDate ? [fromDate, toDate] : [toDate, fromDate];
    return {
      from: toISO(a),
      to: toISO(b),
      label: rangeLabel(a, b),
      preset: "personalizado",
    };
  }

  if (resolved === "mes-pasado") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return {
      from: toISO(start),
      to: toISO(end),
      label: `${capitalize(MONTHS[start.getMonth()])} ${start.getFullYear()}`,
      preset: "mes-pasado",
    };
  }

  if (resolved === "ultimos-3") {
    const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    return {
      from: toISO(start),
      to: toISO(now),
      label: "Últimos 3 meses",
      preset: "ultimos-3",
    };
  }

  if (resolved === "este-anio") {
    const start = new Date(now.getFullYear(), 0, 1);
    return {
      from: toISO(start),
      to: toISO(now),
      label: `Año ${now.getFullYear()}`,
      preset: "este-anio",
    };
  }

  // este-mes (default)
  const start = startOfMonth(now);
  return {
    from: toISO(start),
    to: toISO(now),
    label: `${capitalize(MONTHS[start.getMonth()])} ${start.getFullYear()}`,
    preset: "este-mes",
  };
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/**
 * periodScale devuelve un factor determinístico (~0.6–1.15) derivado del
 * período resuelto, para variar levemente los números demo entre períodos sin
 * tocar la data semilla. Mismo período → mismo factor siempre.
 */
export function periodScale(period: ResolvedPeriod): number {
  if (period.preset === "ultimos-3") return 2.7;
  if (period.preset === "este-anio") return 9.2;
  // hash simple y estable de from+to para los presets mensuales / custom
  const seed = `${period.from}${period.to}`;
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  const norm = (Math.abs(h) % 1000) / 1000; // 0..1
  return 0.6 + norm * 0.55; // 0.6..1.15
}
