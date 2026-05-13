"use client";

import Link from "next/link";
import { PropertyCard } from "@/components/marketplace/property-card";
import { formatUSD } from "@/lib/format";
import type { Property, PropertySummary } from "@/lib/types";

type AnyPart = {
  type: string;
  state?: "input-streaming" | "input-available" | "output-available" | "output-error";
  input?: unknown;
  output?: unknown;
  errorText?: string;
  [key: string]: unknown;
};

const TOOL_LABEL: Record<string, string> = {
  searchProperties: "Buscando inmuebles",
  getPropertyDetail: "Cargando detalle",
  recommendByProfile: "Generando recomendaciones",
  compareProperties: "Comparando inmuebles",
  scheduleVisit: "Agendando visita",
  createPropertyDraft: "Publicando borrador",
  suggestPrice: "Buscando comparables",
};

export function ToolResult({ toolName, part }: { toolName: string; part: AnyPart }) {
  const label = TOOL_LABEL[toolName] ?? toolName;
  const state = part.state ?? "input-streaming";

  if (state === "input-streaming" || state === "input-available") {
    return (
      <div className="rounded-xl border border-dashed border-[color:var(--color-border-strong)] bg-white px-4 py-3 text-xs text-[color:var(--color-fg-muted)] flex items-center gap-2">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
        {label}…
      </div>
    );
  }

  if (state === "output-error") {
    return (
      <div className="rounded-xl border border-[color:var(--color-danger)]/40 bg-white px-4 py-3 text-xs text-[color:var(--color-danger)]">
        Falló la tool {toolName}: {part.errorText ?? "error desconocido"}
      </div>
    );
  }

  const output = part.output as Record<string, unknown> | undefined;
  if (!output) return null;

  if (toolName === "searchProperties" || toolName === "compareProperties") {
    const properties = (output.properties as PropertySummary[] | undefined) ?? [];
    if (!properties.length) {
      return <Hint>No encontré inmuebles que coincidan. Ajustá filtros.</Hint>;
    }
    const insights = output.insights as { cheapest_id?: string; largest_id?: string } | undefined;
    return (
      <div>
        <div className="text-xs text-[color:var(--color-fg-soft)] mb-2">
          {toolName === "compareProperties" ? "Comparativa" : "Resultados"} ({properties.length})
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {properties.map((p) => (
            <div key={p.id} className="relative">
              <PropertyCard property={p} showCompare={false} />
              {insights?.cheapest_id === p.id && (
                <span className="absolute top-3 right-3 chip bg-[color:var(--color-accent)] border-transparent text-[color:var(--color-brand-900)]">
                  Más económico
                </span>
              )}
              {insights?.largest_id === p.id && (
                <span className="absolute top-12 right-3 chip">Más amplio</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (toolName === "recommendByProfile") {
    type Reco = { property: PropertySummary; reasons: string[]; score: number };
    const recos = (output.recommendations as Reco[] | undefined) ?? [];
    if (!recos.length) return <Hint>No tengo recomendaciones para ese perfil aún.</Hint>;
    return (
      <div className="space-y-3">
        {recos.map((r) => (
          <div key={r.property.id} className="card p-4 grid grid-cols-[120px_1fr] gap-4">
            {r.property.cover_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={r.property.cover_url}
                alt={r.property.title}
                className="aspect-[4/3] object-cover rounded-md size-full"
              />
            )}
            <div>
              <Link href={`/inmueble/${r.property.id}`} className="font-semibold hover:underline">
                {r.property.title.replace(/^Llave:\s*/, "")}
              </Link>
              <div className="text-sm text-[color:var(--color-fg-muted)]">
                {r.property.city} · {formatUSD(r.property.price_usd)}/mes ·
                {" "}{r.property.rooms} hab · {r.property.bathrooms} baños
              </div>
              <ul className="mt-2 text-xs text-[color:var(--color-brand-700)] space-y-1">
                {r.reasons.map((reason) => (
                  <li key={reason}>· {reason}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (toolName === "getPropertyDetail") {
    const property = output.property as Property | undefined;
    if (!property) return <Hint>No encontré ese inmueble.</Hint>;
    return (
      <div className="card p-4">
        <Link href={`/inmueble/${property.id}`} className="font-semibold hover:underline">
          {property.title.replace(/^Llave:\s*/, "")}
        </Link>
        <div className="text-sm text-[color:var(--color-fg-muted)] mt-1">
          {formatUSD(property.price_usd)}/mes · {property.rooms} hab · {property.bathrooms} baños
          {property.area_m2 ? ` · ${property.area_m2}m²` : ""}
        </div>
        <p className="text-sm mt-2 line-clamp-3">{property.description}</p>
        <Link href={`/inmueble/${property.id}`} className="btn btn-outline mt-3 text-xs">
          Ver inmueble completo
        </Link>
      </div>
    );
  }

  if (toolName === "scheduleVisit") {
    if (output.ok === false) {
      return <Hint type="warn">{String(output.error ?? "Faltan datos para agendar")}</Hint>;
    }
    const lead = output.lead as { id: string; property_id: string; preferred_visit_at: string | null; inquilino_name: string | null };
    return (
      <div className="card p-4 bg-[color:var(--color-brand-50)] border-[color:var(--color-brand-300)]">
        <div className="font-semibold text-[color:var(--color-brand-700)]">✓ Visita agendada</div>
        <div className="text-sm mt-1 text-[color:var(--color-fg)]">
          {lead.inquilino_name ? `${lead.inquilino_name}, ` : ""}te confirmamos por contacto cuando el asesor revise.
        </div>
        <Link href={`/inmueble/${lead.property_id}`} className="text-xs text-[color:var(--color-brand-700)] underline mt-2 inline-block">
          Ver inmueble
        </Link>
      </div>
    );
  }

  if (toolName === "createPropertyDraft") {
    const property = output.property as Property | undefined;
    if (!property) return <Hint>No pude publicar el borrador.</Hint>;
    return (
      <div className="card p-4 bg-[color:var(--color-brand-50)] border-[color:var(--color-brand-300)]">
        <div className="font-semibold">✓ Publicado: {property.title.replace(/^Llave:\s*/, "")}</div>
        <div className="text-sm text-[color:var(--color-fg-muted)] mt-1">
          {formatUSD(property.price_usd)}/mes en {property.city}.
        </div>
        <Link href={`/inmueble/${property.id}`} className="btn btn-outline mt-3 text-xs">
          Ver publicación
        </Link>
      </div>
    );
  }

  if (toolName === "suggestPrice") {
    if (output.ok === false) {
      return <Hint type="warn">{String(output.message ?? "Sin comparables disponibles")}</Hint>;
    }
    const range = output.suggested_range as { min: number; median: number; max: number };
    const comps = (output.comparables as PropertySummary[]) ?? [];
    return (
      <div className="card p-4">
        <div className="text-xs text-[color:var(--color-fg-soft)] uppercase tracking-wide">
          Rango sugerido
        </div>
        <div className="font-display text-2xl font-bold mt-1">
          {formatUSD(range.min)} – {formatUSD(range.max)}
        </div>
        <div className="text-sm text-[color:var(--color-fg-muted)]">
          Mediana del mercado: {formatUSD(range.median)} · {comps.length} comparables
        </div>
        {comps.length > 0 && (
          <div className="mt-3 space-y-1 text-xs text-[color:var(--color-fg-muted)]">
            {comps.slice(0, 4).map((c) => (
              <div key={c.id}>
                · {formatUSD(c.price_usd)} — {c.title.replace(/^Llave:\s*/, "")}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}

function Hint({ children, type = "info" }: { children: React.ReactNode; type?: "info" | "warn" }) {
  return (
    <div
      className={`rounded-xl px-4 py-3 text-sm ${type === "warn" ? "bg-amber-50 text-amber-800 border border-amber-200" : "bg-white border border-[color:var(--color-border)] text-[color:var(--color-fg-muted)]"}`}
    >
      {children}
    </div>
  );
}
