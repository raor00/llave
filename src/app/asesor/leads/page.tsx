import Link from "next/link";
import { listLeadsForOwner } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  nuevo: "bg-blue-50 text-blue-700 border-blue-200",
  contactado: "bg-amber-50 text-amber-700 border-amber-200",
  agendado: "bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] border-[color:var(--color-brand-300)]",
  firmado: "bg-emerald-50 text-emerald-700 border-emerald-200",
  descartado: "bg-stone-100 text-stone-500 border-stone-200",
};

export default async function LeadsPage() {
  const leads = await listLeadsForOwner();

  return (
    <div className="container-x py-10">
      <Link href="/asesor" className="text-sm text-[color:var(--color-fg-muted)] hover:underline">
        ← Panel asesor
      </Link>
      <h1 className="font-display text-3xl font-bold mt-2 mb-6">Leads</h1>
      {leads.length === 0 ? (
        <div className="card p-10 text-center text-[color:var(--color-fg-muted)]">
          Todavía no hay leads. Cuando alguien agende una visita desde Llavero, aparecerá acá.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {leads.map((lead) => {
            const l = lead as unknown as {
              id: string;
              property_id: string;
              property?: { title?: string; city?: string } | null;
              inquilino_name: string | null;
              inquilino_phone: string | null;
              inquilino_email: string | null;
              status: string;
              agent_summary: string | null;
              preferred_visit_at: string | null;
            };
            return (
              <div key={l.id} className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{l.inquilino_name ?? "Anónimo"}</div>
                    <div className="text-xs text-[color:var(--color-fg-soft)]">
                      {l.inquilino_phone ?? l.inquilino_email ?? "Sin contacto"}
                    </div>
                  </div>
                  <span className={`chip border ${STATUS_COLORS[l.status] ?? ""}`}>{l.status}</span>
                </div>
                <div className="text-sm mt-3">
                  {l.property?.title?.replace(/^Llave:\s*/, "") ?? "Inmueble"} ·{" "}
                  <span className="text-[color:var(--color-fg-muted)]">{l.property?.city}</span>
                </div>
                {l.preferred_visit_at && (
                  <div className="text-xs text-[color:var(--color-brand-700)] mt-1">
                    Visita: {new Date(l.preferred_visit_at).toLocaleString("es-VE")}
                  </div>
                )}
                {l.agent_summary && (
                  <p className="text-xs text-[color:var(--color-fg-muted)] mt-3 italic">
                    Llavero: {l.agent_summary}
                  </p>
                )}
                <Link href={`/inmueble/${l.property_id}`} className="text-xs text-[color:var(--color-brand-700)] hover:underline mt-3 inline-block">
                  Ver inmueble →
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
