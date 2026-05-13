"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCompareActions, useCompareIds } from "./compare-store";
import type { Property, PropertySummary } from "@/lib/types";
import { formatUSD } from "@/lib/format";

export function CompareDrawer({ allProperties }: { allProperties: Array<Property | PropertySummary> }) {
  const ids = useCompareIds();
  const { clear } = useCompareActions();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || ids.length === 0) return null;
  const items = ids
    .map((id) => allProperties.find((p) => p.id === id))
    .filter(Boolean) as Array<Property | PropertySummary>;

  if (items.length === 0) return null;

  const titles = items
    .map((p) => `${p.title.replace(/^Llave:\s*/, "")} (${formatUSD(p.price_usd)})`)
    .join(", ");
  const ctxParts = [
    "Quiero que compares estos inmuebles y me digas cuál me conviene:",
    ...items.map((p) => `- id=${p.id} · ${p.title} · ${formatUSD(p.price_usd)} · ${p.city}`),
    "Usá la tool compareProperties con esos ids.",
  ].join("\n");
  const chatHref = `/chat?context=${encodeURIComponent(ctxParts)}`;

  return (
    <div className="fixed bottom-4 inset-x-3 z-50 md:inset-x-auto md:right-6 md:bottom-6 md:max-w-[480px]">
      <div className="card p-4 bg-[color:var(--color-fg)] text-white border-[color:var(--color-fg)] shadow-[var(--shadow-pop)]">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <div className="text-xs uppercase tracking-wide text-white/60">Comparando</div>
            <div className="font-semibold">{items.length} {items.length === 1 ? "inmueble" : "inmuebles"}</div>
          </div>
          <button onClick={clear} className="text-xs text-white/70 hover:text-white">Limpiar</button>
        </div>
        <div className="text-xs text-white/70 line-clamp-2 mb-3">{titles}</div>
        <Link
          href={chatHref}
          className="btn btn-primary w-full bg-[color:var(--color-accent)] !text-[color:var(--color-brand-900)]"
        >
          Comparar con Llavero →
        </Link>
      </div>
    </div>
  );
}
