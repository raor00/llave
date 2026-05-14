/**
 * Time-of-day greeting anchored to America/Caracas (Llave's primary market).
 *
 * Buckets:
 * - 05:00–11:59 → "Buenos días"
 * - 12:00–18:59 → "Buenas tardes"
 * - 19:00–04:59 → "Buenas noches"
 *
 * Always uses `Intl.DateTimeFormat` so it works whether the server runs in
 * UTC (Vercel) or local dev (any tz). Dashboards call this with the
 * profile's `full_name` so the heading reads "Buenas tardes, Rafael".
 */

export type DayPeriod = "morning" | "afternoon" | "night";

export function getDayPeriod(now: Date = new Date()): DayPeriod {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: "America/Caracas",
    }).format(now)
  );
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 19) return "afternoon";
  return "night";
}

const LABEL: Record<DayPeriod, string> = {
  morning: "Buenos días",
  afternoon: "Buenas tardes",
  night: "Buenas noches",
};

export function getGreeting(
  fullName?: string | null,
  now?: Date
): { period: DayPeriod; label: string; full: string } {
  const period = getDayPeriod(now);
  const first = fullName?.split(/\s+/)[0]?.trim();
  const label = LABEL[period];
  const full = first ? `${label}, ${first}` : label;
  return { period, label, full };
}
