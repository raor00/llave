"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { PropertyCard } from "./property-card";
import { CompareDrawer } from "./compare-drawer";
import type { Property, PropertySummary } from "@/lib/types";

const PropertyMap = dynamic(
  () => import("./property-map").then((m) => m.PropertyMap),
  {
    ssr: false,
    loading: () => (
      <div className="card h-[480px] flex items-center justify-center text-[color:var(--color-fg-soft)]">
        Cargando mapa…
      </div>
    ),
  }
);

export function ResultsView({ properties }: { properties: Array<Property | PropertySummary> }) {
  const [view, setView] = useState<"list" | "map">("list");

  if (properties.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        <div className="inline-flex rounded-full border border-[color:var(--color-border-strong)] p-1 bg-white">
          <button
            type="button"
            onClick={() => setView("list")}
            className={`px-3 py-1.5 text-xs rounded-full ${view === "list" ? "bg-[color:var(--color-brand-500)] text-white" : "text-[color:var(--color-fg-muted)]"}`}
          >
            Lista
          </button>
          <button
            type="button"
            onClick={() => setView("map")}
            className={`px-3 py-1.5 text-xs rounded-full ${view === "map" ? "bg-[color:var(--color-brand-500)] text-white" : "text-[color:var(--color-fg-muted)]"}`}
          >
            Mapa
          </button>
        </div>
      </div>

      {view === "list" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {properties.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      ) : (
        <PropertyMap properties={properties} height={620} />
      )}

      <CompareDrawer allProperties={properties} />
    </div>
  );
}
