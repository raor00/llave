import { formatUSD } from "@/lib/format";
import type { FullContract } from "@/lib/db/contracts";

/**
 * Renderiza el documento del contrato Llave en formato firmable: encabezado
 * notarial, partes, identificación del inmueble, términos económicos,
 * cláusulas numeradas con su artículo LRCAV y bloque de firmas al final.
 * Es 100% RSC — no necesita JS — para que `window.print()` lo genere bien.
 */
export function ContractDocument({ contract }: { contract: FullContract }) {
  const { draft, property } = contract;
  const start = new Date(draft.terms.start_date).toLocaleDateString("es-VE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const end = new Date(draft.terms.end_date).toLocaleDateString("es-VE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="bg-white text-[color:var(--color-fg)] max-w-3xl mx-auto print:max-w-none">
      <header className="text-center border-b border-[color:var(--color-border-strong)] pb-6 mb-8">
        <div className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-fg-soft)]">
          Llave · Plataforma de arrendamiento residencial
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold mt-2">
          Contrato de Arrendamiento de Vivienda
        </h1>
        <div className="text-xs text-[color:var(--color-fg-muted)] mt-2">
          Conforme a la Ley para la Regularización y Control de los Arrendamientos de Vivienda (LRCAV).
        </div>
        <div className="text-[11px] text-[color:var(--color-fg-soft)] mt-3 font-mono">
          ID: {draft.id}
        </div>
      </header>

      <section className="mb-8">
        <h2 className="font-display text-base font-semibold uppercase tracking-wide text-[color:var(--color-brand-700)] mb-3">
          I · De las partes
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm leading-relaxed">
          <PartyBlock label="El Arrendador" party={draft.parties.owner} />
          <PartyBlock label="El Arrendatario" party={draft.parties.tenant} />
          {draft.parties.asesor && (
            <PartyBlock label="Asesor Llave" party={draft.parties.asesor} />
          )}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="font-display text-base font-semibold uppercase tracking-wide text-[color:var(--color-brand-700)] mb-3">
          II · Del inmueble
        </h2>
        <div className="text-sm leading-relaxed">
          <div className="font-medium">{property?.title.replace(/^Llave:\s*/, "") ?? "Inmueble Llave"}</div>
          <div className="text-[color:var(--color-fg-muted)] mt-1">
            {draft.property.address}, {draft.property.city}, {draft.property.state}, Venezuela.
          </div>
          <div className="text-[color:var(--color-fg-muted)] mt-1">
            {draft.property.rooms} habitación{draft.property.rooms === 1 ? "" : "es"} ·{" "}
            {draft.property.bathrooms} baño{draft.property.bathrooms === 1 ? "" : "s"}
            {draft.property.area_m2 ? ` · ${draft.property.area_m2} m²` : ""}.
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="font-display text-base font-semibold uppercase tracking-wide text-[color:var(--color-brand-700)] mb-3">
          III · De los términos económicos
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <Term label="Canon mensual" value={`${formatUSD(draft.terms.monthly_amount)} (${draft.terms.currency})`} />
          <Term label="Duración" value={`${draft.terms.months_total} meses`} />
          <Term label="Inicio" value={start} />
          <Term label="Vencimiento" value={end} />
          <Term label="Día de pago" value={`Hasta el ${draft.terms.payment_due_day} de cada mes`} />
          <Term label="Depósito legal" value={`${draft.terms.deposit_months_lrcav} mes(es) · cubierto por Llave`} />
          <Term label="Depósito al inquilino" value="USD 0 (Fondo Garantía 360°)" highlight />
          <Term label="Comisión al inquilino" value="USD 0" />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="font-display text-base font-semibold uppercase tracking-wide text-[color:var(--color-brand-700)] mb-3">
          IV · De las cláusulas
        </h2>
        <ol className="space-y-5 text-sm leading-relaxed">
          {draft.clauses.map((c, i) => (
            <li key={c.id} className="grid grid-cols-[28px_1fr] gap-3">
              <div className="font-semibold text-[color:var(--color-brand-700)]">{i + 1}.</div>
              <div>
                <div className="font-semibold">{c.title}</div>
                <p className="text-[color:var(--color-fg)] mt-1 text-justify">{c.body}</p>
                <div className="text-[10px] uppercase tracking-wider text-[color:var(--color-fg-soft)] mt-1">
                  {c.statute}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12 pt-8 border-t border-[color:var(--color-border-strong)]">
        <h2 className="font-display text-base font-semibold uppercase tracking-wide text-[color:var(--color-brand-700)] mb-6">
          V · De las firmas
        </h2>
        <div className="grid sm:grid-cols-2 gap-10">
          {draft.signatures.map((s) => (
            <div key={s.role}>
              <div className="h-12 border-b border-[color:var(--color-fg)]" />
              <div className="text-xs mt-2">
                <div className="font-semibold capitalize">Firma del {s.role}</div>
                <div className="text-[color:var(--color-fg-muted)]">{s.name}</div>
                <div className="text-[color:var(--color-fg-soft)] font-mono text-[11px]">
                  CI {s.cedula}
                </div>
                <div className="text-[color:var(--color-fg-soft)] mt-1">
                  Fecha: ____ / ____ / ______
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-10 pt-4 border-t border-[color:var(--color-border)] text-[10px] text-[color:var(--color-fg-soft)] leading-relaxed">
        Documento generado por Llavero el{" "}
        {new Date(draft.generated_at).toLocaleDateString("es-VE", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
        . Las cláusulas son las protecciones base de la LRCAV venezolana
        (artículos referenciados). El depósito legal lo absorbe el Fondo Garantía 360° de Llave.
      </footer>
    </article>
  );
}

function PartyBlock({
  label,
  party,
}: {
  label: string;
  party: { full_name: string; cedula: string; phone?: string; email?: string };
}) {
  return (
    <div className="rounded-md border border-[color:var(--color-border)] p-3">
      <div className="text-[10px] uppercase tracking-wider text-[color:var(--color-fg-soft)]">{label}</div>
      <div className="font-semibold mt-1">{party.full_name}</div>
      <div className="text-[color:var(--color-fg-muted)] font-mono text-[11px]">CI {party.cedula}</div>
      {party.phone && (
        <div className="text-[color:var(--color-fg-soft)] text-[11px]">Tel: {party.phone}</div>
      )}
      {party.email && (
        <div className="text-[color:var(--color-fg-soft)] text-[11px]">{party.email}</div>
      )}
    </div>
  );
}

function Term({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-md border px-3 py-2 ${
        highlight
          ? "border-[color:var(--color-brand-300)] bg-[color:var(--color-brand-50)]"
          : "border-[color:var(--color-border)] bg-white"
      }`}
    >
      <div className="text-[10px] uppercase tracking-wider text-[color:var(--color-fg-soft)]">{label}</div>
      <div className="text-sm font-semibold mt-0.5">{value}</div>
    </div>
  );
}
