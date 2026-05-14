/**
 * Documentos del usuario (contratos, cédula, RIF, recibos, poderes, etc.)
 * Almacenamiento en memoria mientras Supabase Storage no esté listo. Las
 * páginas /inquilino/documentos y /propietario/documentos consumen este
 * store. Los archivos físicos no existen; cada documento es un metadato
 * con un `link` opcional (por ejemplo `/contrato/[id]`).
 */

import { CONTRACTS_STORE, DEMO_TENANTS } from "./contracts";
import { DEMO_OWNER } from "./seed-data";

export type DocumentRole = "inquilino" | "propietario" | "asesor";

export type DocumentKind =
  | "contrato"
  | "cedula"
  | "rif"
  | "recibo"
  | "poder"
  | "comprobante"
  | "otro";

export type Document = {
  id: string;
  owner_id: string;
  role: DocumentRole;
  name: string;
  kind: DocumentKind;
  size_kb: number;
  uploaded_at: string;
  link?: string;
};

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? `doc-${crypto.randomUUID().slice(0, 12)}`
    : `doc-${Math.random().toString(36).slice(2, 14)}`;
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

/**
 * Documentos seed por rol. Cada inquilino del CONTRACTS_STORE recibe un
 * paquete básico (contrato + cédula + comprobante). El propietario recibe
 * los contratos firmados de su cartera + RIF + poder.
 */
function buildSeedDocuments(): Document[] {
  const out: Document[] = [];

  // Documentos por inquilino: contrato firmado + cédula + comprobante.
  for (const c of CONTRACTS_STORE) {
    const tenant = DEMO_TENANTS.find((t) => t.id === c.tenant_id);
    if (!tenant) continue;
    out.push({
      id: newId(),
      owner_id: tenant.id,
      role: "inquilino",
      name: `Contrato Llave — ${c.property?.title.replace(/^Llave:\s*/, "") ?? c.property_id}.pdf`,
      kind: "contrato",
      size_kb: 240 + Math.floor(Math.random() * 80),
      uploaded_at: c.started_at,
      link: `/contrato/${c.id}`,
    });
    out.push({
      id: newId(),
      owner_id: tenant.id,
      role: "inquilino",
      name: `Cédula ${tenant.full_name}.jpg`,
      kind: "cedula",
      size_kb: 180,
      uploaded_at: daysAgo(45),
    });
    out.push({
      id: newId(),
      owner_id: tenant.id,
      role: "inquilino",
      name: "Comprobante de ingresos.pdf",
      kind: "comprobante",
      size_kb: 320,
      uploaded_at: daysAgo(40),
    });
    out.push({
      id: newId(),
      owner_id: tenant.id,
      role: "inquilino",
      name: "Último recibo de pago.pdf",
      kind: "recibo",
      size_kb: 95,
      uploaded_at: daysAgo(5),
    });
  }

  // Documentos del propietario / asesor demo.
  for (const c of CONTRACTS_STORE) {
    out.push({
      id: newId(),
      owner_id: DEMO_OWNER.id,
      role: "propietario",
      name: `Contrato firmado — ${c.property?.title.replace(/^Llave:\s*/, "") ?? c.property_id}.pdf`,
      kind: "contrato",
      size_kb: 248,
      uploaded_at: c.started_at,
      link: `/contrato/${c.id}`,
    });
  }
  out.push({
    id: newId(),
    owner_id: DEMO_OWNER.id,
    role: "propietario",
    name: "RIF Llave Propietario.pdf",
    kind: "rif",
    size_kb: 88,
    uploaded_at: daysAgo(120),
  });
  out.push({
    id: newId(),
    owner_id: DEMO_OWNER.id,
    role: "propietario",
    name: "Poder de administración Las Mercedes.pdf",
    kind: "poder",
    size_kb: 312,
    uploaded_at: daysAgo(90),
  });
  out.push({
    id: newId(),
    owner_id: DEMO_OWNER.id,
    role: "propietario",
    name: "Cédula propietario.jpg",
    kind: "cedula",
    size_kb: 175,
    uploaded_at: daysAgo(200),
  });

  return out;
}

export const DOCUMENTS_STORE: Document[] = buildSeedDocuments();

/**
 * Devuelve los documentos visibles para un usuario+rol. Si no se pasa userId,
 * usa el primer inquilino demo (Carlos) para inquilino, o DEMO_OWNER para
 * propietario/asesor. Así las páginas demo nunca quedan vacías.
 */
export function listDocumentsForRole(
  role: DocumentRole,
  userId?: string | null
): Document[] {
  const id =
    userId ??
    (role === "inquilino" ? DEMO_TENANTS[0].id : DEMO_OWNER.id);
  return DOCUMENTS_STORE
    .filter((d) => d.role === role && d.owner_id === id)
    .sort((a, b) => b.uploaded_at.localeCompare(a.uploaded_at));
}

export function addDocument(input: Omit<Document, "id" | "uploaded_at">): Document {
  const doc: Document = {
    id: newId(),
    uploaded_at: new Date().toISOString(),
    ...input,
  };
  DOCUMENTS_STORE.unshift(doc);
  return doc;
}

export function formatDocSize(kb: number): string {
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export const DOC_KIND_LABEL: Record<DocumentKind, string> = {
  contrato: "Contrato",
  cedula: "Cédula",
  rif: "RIF",
  recibo: "Recibo",
  poder: "Poder",
  comprobante: "Comprobante",
  otro: "Otro",
};
