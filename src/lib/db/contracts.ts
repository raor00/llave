/**
 * Lease contracts for the inquilino dashboard. When the user has an active
 * lease, `getActiveContractForTenant` returns its start date, total months,
 * months elapsed and monthly amount. With no Supabase we return a seeded
 * demo contract anchored to the most representative property so the
 * "tiempo de contrato restante" UI always has something to show in the demo.
 */

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SUPABASE_ENABLED } from "@/lib/supabase/env";
import { DEMO_OWNER, DEMO_PROPERTIES } from "./seed-data";
import type { Property } from "@/lib/types";
import {
  buildContractDraft,
  type ContractDraft,
  type ContractParty,
} from "@/lib/ai/lrcav";

export type Contract = {
  id: string;
  property_id: string;
  property?: Property | null;
  tenant_id: string;
  owner_id: string;
  asesor_id: string | null;
  started_at: string;
  months_total: number;
  monthly_amount: number;
  status: "activo" | "vencido" | "renegociacion" | "cerrado";
};

export type ContractStatus = {
  contract: Contract;
  monthsElapsed: number;
  monthsRemaining: number;
  nextPaymentDay: number;
  progressPct: number;
};

function seedContract(tenantId: string): Contract {
  const prop = DEMO_PROPERTIES[0]; // Loft Hackathon (Las Mercedes)
  const started = new Date();
  started.setMonth(started.getMonth() - 8);
  return {
    id: `seed-${tenantId.slice(0, 8)}`,
    property_id: prop.id,
    property: prop,
    tenant_id: tenantId,
    owner_id: prop.owner_id,
    asesor_id: prop.owner_id,
    started_at: started.toISOString(),
    months_total: 12,
    monthly_amount: prop.price_usd,
    status: "activo",
  };
}

export async function getActiveContractForTenant(
  tenantId: string
): Promise<ContractStatus | null> {
  let contract: Contract | null = null;

  if (SUPABASE_ENABLED) {
    const supa = await createSupabaseServerClient();
    if (supa) {
      const { data } = await supa
        .from("contracts")
        .select("*, property:properties(*)")
        .eq("tenant_id", tenantId)
        .eq("status", "activo")
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) contract = data as unknown as Contract;
    }
  }

  // Fallback: demo contract anchored to property 0 so the UI is never empty.
  if (!contract) contract = seedContract(tenantId);

  return buildStatus(contract);
}

function buildStatus(contract: Contract): ContractStatus {
  const start = new Date(contract.started_at);
  const now = new Date();
  const months =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());
  const monthsElapsed = Math.max(0, Math.min(contract.months_total, months));
  const monthsRemaining = Math.max(0, contract.months_total - monthsElapsed);
  const progressPct = Math.round((monthsElapsed / contract.months_total) * 100);
  const nextPaymentDay = start.getDate();
  return { contract, monthsElapsed, monthsRemaining, nextPaymentDay, progressPct };
}

// ===========================================================================
// EXTENSIÓN: store en memoria de contratos firmados/generados por Llavero.
// Se mantiene aparte de `getActiveContractForTenant` (que devuelve uno seed)
// para no romper la home del inquilino. Estas funciones alimentan las
// páginas /propietario/contratos, /inquilino/contratos, /contrato/[id] y las
// herramientas IA `listMyContracts` / `generateRentalContract`.
// ===========================================================================

/** Inquilinos demo usados por el seed de contratos firmados. */
export const DEMO_TENANTS: Array<ContractParty & { id: string; trust_score: number }> = [
  {
    id: "tenant-carlos",
    full_name: "Carlos González",
    cedula: "V-18.234.567",
    phone: "+58 412-9876543",
    email: "carlos@example.com",
    trust_score: 780,
  },
  {
    id: "tenant-ana",
    full_name: "Ana López",
    cedula: "V-20.117.882",
    phone: "+58 416-5551234",
    email: "ana@example.com",
    trust_score: 720,
  },
  {
    id: "tenant-maria",
    full_name: "María Pérez",
    cedula: "V-15.456.901",
    phone: "+58 414-1112233",
    email: "maria@example.com",
    trust_score: 860,
  },
  {
    id: "tenant-pedro",
    full_name: "Pedro Reyes",
    cedula: "V-22.998.041",
    phone: "+58 412-7778899",
    email: "pedro@example.com",
    trust_score: 640,
  },
];

/**
 * `FullContract` extiende `Contract` con los datos legales/personales que
 * `/contrato/[id]` necesita para renderizar el documento completo. Los
 * stores listos para Supabase pueden ignorar `draft` y reconstruirlo.
 */
export type FullContract = Contract & {
  tenant: ContractParty;
  owner: ContractParty;
  draft: ContractDraft;
};

function seedFullContract(args: {
  property: Property;
  tenant: (typeof DEMO_TENANTS)[number];
  monthsBack: number;
  monthsTotal: number;
  status?: Contract["status"];
}): FullContract {
  const started = new Date();
  started.setMonth(started.getMonth() - args.monthsBack);
  const ownerParty: ContractParty = {
    full_name: DEMO_OWNER.full_name ?? "Rafael Oviedo",
    cedula: "V-12.345.678",
    phone: DEMO_OWNER.phone ?? undefined,
  };
  const tenantParty: ContractParty = {
    full_name: args.tenant.full_name,
    cedula: args.tenant.cedula,
    phone: args.tenant.phone,
    email: args.tenant.email,
  };
  const draft = buildContractDraft({
    owner: ownerParty,
    tenant: tenantParty,
    property: args.property,
    monthlyAmount: args.property.price_usd,
    monthsTotal: args.monthsTotal,
    startDate: started.toISOString(),
    depositMonths: 1,
    currency: "USD",
  });
  return {
    id: draft.id,
    property_id: args.property.id,
    property: args.property,
    tenant_id: args.tenant.id,
    owner_id: DEMO_OWNER.id,
    asesor_id: DEMO_OWNER.id,
    started_at: started.toISOString(),
    months_total: args.monthsTotal,
    monthly_amount: args.property.price_usd,
    status: args.status ?? "activo",
    tenant: tenantParty,
    owner: ownerParty,
    draft,
  };
}

function getSeedProperty(idx: number): Property {
  return DEMO_PROPERTIES[idx % DEMO_PROPERTIES.length];
}

/**
 * In-memory mutable store. Se construye con los DEMO_PROPERTIES + DEMO_TENANTS
 * para que las páginas tengan datos desde el primer render. `appendContract`
 * permite que `generateRentalContract` agregue nuevos contratos en runtime.
 */
function buildSeedContracts(): FullContract[] {
  return [
    seedFullContract({
      property: getSeedProperty(0),
      tenant: DEMO_TENANTS[0],
      monthsBack: 8,
      monthsTotal: 12,
    }),
    seedFullContract({
      property: getSeedProperty(1),
      tenant: DEMO_TENANTS[2],
      monthsBack: 3,
      monthsTotal: 12,
    }),
    seedFullContract({
      property: getSeedProperty(2),
      tenant: DEMO_TENANTS[1],
      monthsBack: 5,
      monthsTotal: 12,
    }),
    seedFullContract({
      property: getSeedProperty(3),
      tenant: DEMO_TENANTS[3],
      monthsBack: 11,
      monthsTotal: 12,
      status: "renegociacion",
    }),
    seedFullContract({
      property: getSeedProperty(6),
      tenant: DEMO_TENANTS[2],
      monthsBack: 2,
      monthsTotal: 24,
    }),
  ];
}

export const CONTRACTS_STORE: FullContract[] = buildSeedContracts();

export function listAllContracts(): FullContract[] {
  return [...CONTRACTS_STORE];
}

export function getContractById(id: string): FullContract | null {
  return CONTRACTS_STORE.find((c) => c.id === id || c.draft.id === id) ?? null;
}

export function listContractsForOwner(ownerId: string): FullContract[] {
  return CONTRACTS_STORE.filter((c) => c.owner_id === ownerId);
}

export function listContractsForTenant(tenantId: string): FullContract[] {
  return CONTRACTS_STORE.filter((c) => c.tenant_id === tenantId);
}

export function listContractsForAsesor(asesorId: string): FullContract[] {
  return CONTRACTS_STORE.filter((c) => c.asesor_id === asesorId);
}

export function appendContract(c: FullContract): FullContract {
  CONTRACTS_STORE.unshift(c);
  return c;
}

/**
 * Calcula meses transcurridos / restantes de un contrato. No depende de
 * Supabase y sirve a las páginas y a las tools IA. Mantiene la semántica de
 * `buildStatus` pero sin envolver en `ContractStatus`.
 */
export function getContractProgress(c: Contract): {
  monthsElapsed: number;
  monthsRemaining: number;
  progressPct: number;
} {
  const start = new Date(c.started_at);
  const now = new Date();
  const months =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());
  const monthsElapsed = Math.max(0, Math.min(c.months_total, months));
  const monthsRemaining = Math.max(0, c.months_total - monthsElapsed);
  const progressPct = Math.round((monthsElapsed / c.months_total) * 100);
  return { monthsElapsed, monthsRemaining, progressPct };
}
