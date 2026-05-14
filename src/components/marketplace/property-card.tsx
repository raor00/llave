"use client";

import Link from "next/link";
import type { Property, PropertySummary } from "@/lib/types";
import { formatPropertyType, formatUSD } from "@/lib/format";
import { useCompareActions, useCompareIds } from "./compare-store";

export function PropertyCard({
  property,
  showCompare = true,
}: {
  property: Property | PropertySummary;
  showCompare?: boolean;
}) {
  const ids = useCompareIds();
  const { toggle } = useCompareActions();
  const pinned = ids.includes(property.id);

  return (
    <div className="card group block transition hover:-translate-y-1 hover:shadow-[var(--shadow-pop)] overflow-hidden">
      <Link href={`/inmueble/${property.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-[color:var(--color-border)]">
          {property.cover_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={property.cover_url}
              alt={property.title}
              className="size-full object-cover group-hover:scale-105 transition duration-500"
            />
          )}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span className="chip">{formatPropertyType(property.type)}</span>
            <span className="chip bg-[color:var(--color-accent)]/90 text-[color:var(--color-brand-900)] border-transparent">
              Cero depósito · Llave responde
            </span>
          </div>
        </div>
      </Link>
      <div className="p-5">
        <div className="flex items-baseline justify-between gap-2">
          <Link href={`/inmueble/${property.id}`} className="flex-1">
            <div className="font-display text-2xl font-bold">{formatUSD(property.price_usd)}</div>
          </Link>
          <div className="text-xs text-[color:var(--color-fg-soft)]">/ mes</div>
        </div>
        <Link href={`/inmueble/${property.id}`}>
          <h3 className="font-semibold mt-1 leading-snug line-clamp-2">{property.title.replace(/^Llave:\s*/, "")}</h3>
          <div className="text-sm text-[color:var(--color-fg-muted)] mt-1">
            {property.city}{property.state ? `, ${property.state}` : ""}
          </div>
          <div className="mt-4 flex items-center gap-3 text-xs text-[color:var(--color-fg-muted)]">
            <span>🛏 {property.rooms} {property.rooms === 1 ? "hab" : "habs"}</span>
            <span>🚿 {property.bathrooms}</span>
            {property.area_m2 ? <span>📐 {property.area_m2} m²</span> : null}
          </div>
        </Link>
        {showCompare && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggle(property.id);
            }}
            className={`mt-4 w-full btn ${pinned ? "btn-primary" : "btn-outline"} text-xs`}
          >
            {pinned ? "✓ En la comparación" : "Agregar a comparar"}
          </button>
        )}
      </div>
    </div>
  );
}
