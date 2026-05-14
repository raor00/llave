/**
 * Lease contracts for the inquilino dashboard. When the user has an active
 * lease, `getActiveContractForTenant` returns its start date, total months,
 * months elapsed and monthly amount. With no Supabase we return a seeded
 * demo contract anchored to the most representative property so the
 * "tiempo de contrato restante" UI always has something to show in the demo.
 */

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SUPABASE_ENABLED } from "@/lib/supabase/env";
import { DEMO_PROPERTIES } from "./seed-data";
import type { Property } from "@/lib/types";

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
