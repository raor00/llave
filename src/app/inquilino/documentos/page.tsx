/**
 * /inquilino/documentos — Vista de documentos del inquilino (contratos,
 * cédula, comprobante de ingresos, recibos, RIF si lo hubiere, foto).
 *
 * Mantiene un dropzone visual no funcional como placeholder de la próxima
 * fase: Supabase Storage + EXIF cleanup. Por ahora todo es seed in-memory.
 */

import Link from "next/link";
import {
  DOC_KIND_LABEL,
  formatDocSize,
  listDocumentsForRole,
  type Document,
} from "@/lib/db/documents";
import {
  IconDocument,
  IconDownload,
  IconUpload,
} from "@/components/dashboard-icons";

export const dynamic = "force-dynamic";

export default async function InquilinoDocumentosPage() {
  const docs = listDocumentsForRole("inquilino");

  return (
    <div className="container-x py-8 sm:py-10 space-y-8">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <span className="chip mb-2">Mi Llave · Documentos</span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">
            Tus documentos
          </h1>
          <p className="text-sm text-[color:var(--color-fg-muted)] mt-1 max-w-2xl">
            Tu cédula, contrato, recibos y comprobantes — todo cifrado y bajo tu control. Sin RIF obligatorio, sin redes verificadas.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/inquilino/contratos" className="btn btn-outline text-sm">
            Ver contratos
          </Link>
        </div>
      </header>

      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {docs.map((d) => (
          <DocCard key={d.id} doc={d} />
        ))}
      </section>

      <section className="card p-6 border-2 border-dashed border-[color:var(--color-border-strong)] bg-white text-center">
        <div className="size-12 rounded-full bg-[color:var(--color-brand-50)] grid place-items-center mx-auto text-[color:var(--color-brand-700)]">
          <IconUpload size={22} />
        </div>
        <h3 className="font-display text-lg font-semibold mt-3">
          Subir un documento nuevo
        </h3>
        <p className="text-sm text-[color:var(--color-fg-muted)] mt-1 max-w-md mx-auto">
          Arrastra tu archivo aquí o haz clic. Llave acepta PDF, JPG y PNG, hasta 8 MB. EXIF se borra al subir.
        </p>
        <button
          type="button"
          className="btn btn-outline mt-4 text-sm cursor-not-allowed opacity-70"
          disabled
          aria-disabled="true"
        >
          Seleccionar archivo (próximamente)
        </button>
      </section>

      <p className="text-xs text-[color:var(--color-fg-soft)]">
        Llave no comparte tus documentos con terceros. El asesor sólo ve los que tú vinculas a un contrato.
      </p>
    </div>
  );
}

function DocCard({ doc }: { doc: Document }) {
  const uploaded = new Date(doc.uploaded_at).toLocaleDateString("es-VE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const inner = (
    <div className="card p-4 h-full flex flex-col gap-2 hover:shadow-[var(--shadow-pop)] transition">
      <div className="flex items-start gap-3">
        <div className="size-10 rounded-md bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] grid place-items-center shrink-0">
          <IconDocument size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-sm line-clamp-2">{doc.name}</div>
          <div className="text-[11px] text-[color:var(--color-fg-soft)] mt-0.5">
            {DOC_KIND_LABEL[doc.kind]} · {formatDocSize(doc.size_kb)}
          </div>
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between pt-2 border-t border-[color:var(--color-border)]">
        <div className="text-[11px] text-[color:var(--color-fg-soft)]">{uploaded}</div>
        <span className="text-xs text-[color:var(--color-brand-700)] font-medium flex items-center gap-1">
          <IconDownload size={14} /> {doc.link ? "Abrir" : "Descargar"}
        </span>
      </div>
    </div>
  );
  if (doc.link) {
    return (
      <Link href={doc.link} className="block">
        {inner}
      </Link>
    );
  }
  return <div className="block">{inner}</div>;
}
