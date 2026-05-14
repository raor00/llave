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
  generateRentalContract: "Generando contrato LRCAV",
  listMyContracts: "Cargando tus contratos",
  recordPayment: "Registrando pago",
  getOwnerBalance: "Calculando balance",
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

  if (toolName === "setupMyProfile") {
    if (output.ok === false) {
      return <Hint type="warn">{String(output.error ?? "No pude configurar tu perfil")}</Hint>;
    }
    const redirectTo = String(output.redirect ?? "/inquilino");
    return (
      <div className="card p-4 bg-[color:var(--color-brand-50)] border-[color:var(--color-brand-300)]">
        <div className="font-semibold text-[color:var(--color-brand-700)]">✓ Perfil configurado</div>
        <div className="text-sm mt-1 text-[color:var(--color-fg)]">
          Listo, {String(output.full_name ?? "")}. Tu rol es <strong>{String(output.role ?? "")}</strong>.
        </div>
        <Link href={redirectTo} className="btn btn-primary mt-3 text-xs">
          Ir a Mi Llave
        </Link>
      </div>
    );
  }

  if (toolName === "generateRentalContract") {
    if (output.ok === false) {
      return <Hint type="warn">{String(output.error ?? "No pude generar el contrato")}</Hint>;
    }
    return (
      <div className="card p-4 bg-[color:var(--color-brand-50)] border-[color:var(--color-brand-300)]">
        <div className="text-xs uppercase tracking-wider text-[color:var(--color-brand-700)] font-semibold">
          Contrato LRCAV generado
        </div>
        <div className="font-display text-lg font-bold mt-1">
          {String(output.property_title ?? "Inmueble Llave")}
        </div>
        <div className="text-sm text-[color:var(--color-fg-muted)] mt-1">
          {String(output.parties_summary ?? "")}
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
          <Mini label="Mensual" value={formatUSD(Number(output.monthly_amount ?? 0))} />
          <Mini label="Duración" value={`${output.months_total ?? 12} meses`} />
          <Mini label="Cláusulas" value={String(output.clauses_count ?? 14)} />
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <Link
            href={String(output.pdf_route ?? "#")}
            className="btn btn-primary text-xs !py-1.5"
          >
            Ver contrato
          </Link>
          <Link
            href={`${String(output.pdf_route ?? "#")}/print`}
            className="btn btn-outline text-xs !py-1.5"
            target="_blank"
            rel="noopener"
          >
            Descargar PDF
          </Link>
        </div>
        <p className="text-[10px] text-[color:var(--color-fg-soft)] mt-3 leading-relaxed">
          Cláusulas base LRCAV. Cero depósito al inquilino — cubre el Fondo Garantía 360° de Llave.
        </p>
      </div>
    );
  }

  if (toolName === "listMyContracts") {
    type Row = {
      id: string;
      property_title: string;
      counterpart_name: string;
      monthly: number;
      status: string;
      months_elapsed: number;
      months_total: number;
      months_remaining: number;
      pending_usd: number;
      pdf_route: string;
    };
    const rows = (output.contracts as Row[] | undefined) ?? [];
    if (!rows.length) return <Hint>No tienes contratos activos todavía.</Hint>;
    return (
      <div className="card overflow-x-auto">
        <table className="w-full text-xs min-w-[480px]">
          <thead className="bg-[color:var(--color-bg)] text-left text-[10px] uppercase tracking-wider text-[color:var(--color-fg-soft)]">
            <tr>
              <th className="px-3 py-2 font-semibold">Inmueble</th>
              <th className="px-3 py-2 font-semibold">Contraparte</th>
              <th className="px-3 py-2 font-semibold">Mensual</th>
              <th className="px-3 py-2 font-semibold">Avance</th>
              <th className="px-3 py-2 font-semibold">Saldo</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-[color:var(--color-border)]">
                <td className="px-3 py-2 font-medium line-clamp-1">{r.property_title}</td>
                <td className="px-3 py-2 text-[color:var(--color-fg-muted)]">{r.counterpart_name}</td>
                <td className="px-3 py-2">{formatUSD(r.monthly)}</td>
                <td className="px-3 py-2 text-[color:var(--color-fg-muted)]">
                  {r.months_elapsed}/{r.months_total}
                </td>
                <td className={`px-3 py-2 font-semibold ${r.pending_usd > 0 ? "text-[color:var(--color-danger)]" : "text-[color:var(--color-brand-700)]"}`}>
                  {r.pending_usd > 0 ? formatUSD(r.pending_usd) : "Al día"}
                </td>
                <td className="px-3 py-2 text-right">
                  <Link href={r.pdf_route} className="text-[color:var(--color-brand-700)] hover:underline">
                    Abrir
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (toolName === "recordPayment") {
    if (output.ok === false) {
      return <Hint type="warn">{String(output.error ?? "No pude registrar el pago")}</Hint>;
    }
    return (
      <div className="card p-4 bg-[color:var(--color-brand-50)] border-[color:var(--color-brand-300)]">
        <div className="font-semibold text-[color:var(--color-brand-700)]">
          Pago registrado · {String(output.period ?? "")}
        </div>
        <div className="text-sm mt-1 text-[color:var(--color-fg)]">
          Método: <strong>{String(output.method ?? "")}</strong>. Quedan {formatUSD(Number(output.new_balance_usd ?? 0))} pendientes.
        </div>
        <div className="text-xs text-[color:var(--color-fg-soft)] mt-2">
          Pagos contabilizados: {String(output.months_paid ?? 0)}. Tu Trust Score sube con cada renta puntual.
        </div>
      </div>
    );
  }

  if (toolName === "getOwnerBalance") {
    type ContractLine = {
      contract_id: string;
      property_title: string;
      tenant_name: string;
      monthly: number;
      paid_this_month: number;
      last_payment_at: string | null;
      pending_usd: number;
      status: string;
    };
    const lines = (output.contracts as ContractLine[] | undefined) ?? [];
    return (
      <div className="card p-4">
        <div className="text-xs uppercase tracking-wider text-[color:var(--color-fg-soft)]">
          Balance de tu cartera
        </div>
        <div className="grid grid-cols-2 gap-3 mt-2">
          <Mini label="Pendiente" value={formatUSD(Number(output.total_pending_usd ?? 0))} highlight />
          <Mini label="Cobrado este año" value={formatUSD(Number(output.total_paid_ytd_usd ?? 0))} />
        </div>
        <div className="mt-4 space-y-2">
          {lines.map((l) => (
            <div key={l.contract_id} className="flex items-center justify-between gap-3 border-t border-[color:var(--color-border)] pt-2 text-xs">
              <div className="min-w-0">
                <div className="font-medium line-clamp-1">{l.property_title}</div>
                <div className="text-[color:var(--color-fg-soft)]">{l.tenant_name}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{formatUSD(l.monthly)}/mes</div>
                <div className={l.status === "pendiente" ? "text-[color:var(--color-danger)]" : "text-[color:var(--color-brand-700)]"}>
                  {l.status === "pendiente" ? `Debe ${formatUSD(l.pending_usd)}` : "Al día"}
                </div>
              </div>
            </div>
          ))}
        </div>
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

function Mini({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-md border px-2.5 py-1.5 ${
        highlight
          ? "bg-[color:var(--color-brand-500)] text-white border-[color:var(--color-brand-500)]"
          : "bg-white border-[color:var(--color-border)]"
      }`}
    >
      <div className={`text-[9px] uppercase tracking-wider ${highlight ? "text-white/80" : "text-[color:var(--color-fg-soft)]"}`}>
        {label}
      </div>
      <div className={`text-sm font-bold ${highlight ? "text-white" : "text-[color:var(--color-fg)]"}`}>
        {value}
      </div>
    </div>
  );
}
