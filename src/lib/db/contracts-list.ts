/**
 * Listado de contratos del asesor para la página /asesor/contratos.
 *
 * Mantiene contratos seed deterministas anclados a las propiedades demo:
 * varían estado (activo, próximo a vencer, renegociación, cerrado, vencido),
 * duración, mes de inicio e inquilino. Sirven para que el CRM nunca aparezca
 * vacío en la demo. Cuando Supabase esté listo se reemplaza por una query a
 * `contracts` con join a `properties` y `profiles` (inquilino).
 */

import { DEMO_PROPERTIES } from "./seed-data";
import type { Property } from "@/lib/types";

export type ContractRowStatus =
  | "activo"
  | "proximo_vencer"
  | "renegociacion"
  | "vencido"
  | "cerrado";

export type ContractRow = {
  id: string;
  property: Property;
  tenant_name: string;
  tenant_phone: string;
  started_at: string;
  months_total: number;
  monthly_amount: number;
  status: ContractRowStatus;
  commission_amount: number;
  notes: string | null;
};

const TENANTS: Array<{ name: string; phone: string }> = [
  { name: "Carlos González", phone: "+58 412-9876543" },
  { name: "Ana López", phone: "+58 416-5551234" },
  { name: "María Pérez", phone: "+58 414-1112233" },
  { name: "Andrés Rivas", phone: "+58 412-7778899" },
  { name: "Sofía Hernández", phone: "+58 424-3344556" },
  { name: "Luis Mendoza", phone: "+58 416-9988776" },
  { name: "Valentina Suárez", phone: "+58 414-6655443" },
  { name: "Diego Castillo", phone: "+58 412-2211009" },
];

const STATUS_PATTERN: ContractRowStatus[] = [
  "activo",
  "activo",
  "proximo_vencer",
  "renegociacion",
  "activo",
  "vencido",
  "activo",
  "cerrado",
];

const MONTHS_BACK_PATTERN = [3, 7, 11, 9, 1, 13, 5, 18];
const MONTHS_TOTAL_PATTERN = [12, 12, 12, 6, 12, 12, 12, 12];

export function listContracts(): ContractRow[] {
  const props = DEMO_PROPERTIES.slice(0, TENANTS.length);
  return props.map((property, i) => {
    const tenant = TENANTS[i];
    const monthsBack = MONTHS_BACK_PATTERN[i] ?? 6;
    const monthsTotal = MONTHS_TOTAL_PATTERN[i] ?? 12;
    const started = new Date();
    started.setMonth(started.getMonth() - monthsBack);
    const status = STATUS_PATTERN[i] ?? "activo";
    const commission = Math.round(property.price_usd * 0.1);
    return {
      id: `contract-${property.id.slice(0, 8)}`,
      property,
      tenant_name: tenant.name,
      tenant_phone: tenant.phone,
      started_at: started.toISOString(),
      months_total: monthsTotal,
      monthly_amount: property.price_usd,
      status,
      commission_amount: commission,
      notes:
        status === "proximo_vencer"
          ? "Renovación a discutir antes del cierre del mes"
          : status === "renegociacion"
          ? "Inquilino quiere bajar 5% y firmar 24 meses"
          : null,
    };
  });
}

export function buildContractMetrics(rows: ContractRow[]) {
  const activos = rows.filter((r) => r.status === "activo" || r.status === "proximo_vencer").length;
  const proximos = rows.filter((r) => r.status === "proximo_vencer").length;
  const vencidos = rows.filter((r) => r.status === "vencido").length;
  const proyectado = rows
    .filter((r) => r.status === "activo" || r.status === "proximo_vencer")
    .reduce((acc, r) => acc + r.commission_amount, 0);
  return { activos, proximos, vencidos, proyectado };
}

export function getContractProgress(row: ContractRow): {
  monthsElapsed: number;
  monthsRemaining: number;
  progressPct: number;
} {
  const start = new Date(row.started_at);
  const now = new Date();
  const elapsed =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());
  const monthsElapsed = Math.max(0, Math.min(row.months_total, elapsed));
  const monthsRemaining = Math.max(0, row.months_total - monthsElapsed);
  const progressPct = Math.round((monthsElapsed / row.months_total) * 100);
  return { monthsElapsed, monthsRemaining, progressPct };
}
