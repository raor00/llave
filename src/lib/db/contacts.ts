/**
 * CRM de contactos del asesor para /asesor/contactos.
 *
 * Mantiene 12 contactos seed con la forma del modelo real (source de tráfico,
 * tags de búsqueda, trust_score y temperatura). Cuando Supabase esté listo
 * se reemplaza por una query a `profiles` filtrados por relación con el
 * asesor (leads, conversaciones, contratos).
 */

import type { TrafficSource } from "./asesor-analytics";

export type ContactStatus = "frio" | "tibio" | "caliente" | "cliente";

export type Contact = {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  source: TrafficSource;
  tags: string[];
  last_contact_at: string;
  trust_score: number; // 0..1000
  status: ContactStatus;
  bio: string;
  history: Array<{ at: string; kind: "mensaje" | "visita" | "llamada" | "lead"; detail: string }>;
};

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export const DEMO_CONTACTS: Contact[] = [
  {
    id: "c-001",
    full_name: "Carlos González",
    phone: "+58 412-9876543",
    email: "carlos.gonzalez@example.com",
    source: "instagram",
    tags: ["interesado-apt", "presupuesto-300", "pareja-joven"],
    last_contact_at: daysAgo(1),
    trust_score: 820,
    status: "caliente",
    bio: "Ingeniero en Chacao. Busca mudarse en 2 semanas con su pareja. Quiere apto con planta eléctrica.",
    history: [
      { at: daysAgo(1), kind: "mensaje", detail: "Confirmó visita al apto de Las Mercedes" },
      { at: daysAgo(2), kind: "lead", detail: "Llegó por anuncio en Instagram" },
      { at: daysAgo(4), kind: "mensaje", detail: "Preguntó por depósito y mascotas" },
    ],
  },
  {
    id: "c-002",
    full_name: "Ana López",
    phone: "+58 416-5551234",
    email: "ana.lopez@example.com",
    source: "facebook",
    tags: ["medico", "maracaibo", "presupuesto-250"],
    last_contact_at: daysAgo(0),
    trust_score: 760,
    status: "caliente",
    bio: "Médica residente, busca apto en Maracaibo cerca del hospital.",
    history: [
      { at: daysAgo(0), kind: "llamada", detail: "Llamó para coordinar visita virtual" },
      { at: daysAgo(3), kind: "lead", detail: "Lead desde Facebook Ads" },
    ],
  },
  {
    id: "c-003",
    full_name: "Sofía Hernández",
    phone: "+58 424-3344556",
    email: "sofia.h@example.com",
    source: "llavero",
    tags: ["familia", "el-hatillo", "mascotas-ok"],
    last_contact_at: daysAgo(2),
    trust_score: 880,
    status: "caliente",
    bio: "Familia con dos hijos. Llavero la dirigió al inmueble de El Hatillo.",
    history: [
      { at: daysAgo(2), kind: "visita", detail: "Visitó la casa en El Hatillo" },
      { at: daysAgo(5), kind: "mensaje", detail: "Llavero la conectó con el asesor" },
    ],
  },
  {
    id: "c-004",
    full_name: "Diego Castillo",
    phone: "+58 412-2211009",
    email: "diego.castillo@example.com",
    source: "whatsapp",
    tags: ["local-comercial", "sabana-grande"],
    last_contact_at: daysAgo(3),
    trust_score: 700,
    status: "tibio",
    bio: "Quiere abrir un café. Busca local de 60-100m² con alto tránsito.",
    history: [
      { at: daysAgo(3), kind: "mensaje", detail: "Pidió fotos adicionales del local" },
      { at: daysAgo(7), kind: "lead", detail: "Llegó por WhatsApp orgánico" },
    ],
  },
  {
    id: "c-005",
    full_name: "Valentina Suárez",
    phone: "+58 414-6655443",
    email: "valentina@example.com",
    source: "tiktok",
    tags: ["estudio", "chacao", "amoblado"],
    last_contact_at: daysAgo(4),
    trust_score: 640,
    status: "tibio",
    bio: "Estudiante de últimos semestres. Busca estudio amoblado cerca del metro.",
    history: [
      { at: daysAgo(4), kind: "mensaje", detail: "Comentó en TikTok del estudio" },
    ],
  },
  {
    id: "c-006",
    full_name: "Andrés Rivas",
    phone: "+58 412-7778899",
    email: "andres.rivas@example.com",
    source: "direct",
    tags: ["apartamento", "altamira", "presupuesto-alto"],
    last_contact_at: daysAgo(6),
    trust_score: 920,
    status: "cliente",
    bio: "Cerró contrato del penthouse en Altamira. Cliente repetido.",
    history: [
      { at: daysAgo(60), kind: "visita", detail: "Firmó contrato del penthouse" },
      { at: daysAgo(6), kind: "mensaje", detail: "Saludó por aniversario de mudanza" },
    ],
  },
  {
    id: "c-007",
    full_name: "Luis Mendoza",
    phone: "+58 416-9988776",
    email: "luis.m@example.com",
    source: "google",
    tags: ["maracaibo", "familia"],
    last_contact_at: daysAgo(5),
    trust_score: 580,
    status: "tibio",
    bio: "Llegó buscando 'apartamentos en maracaibo' en Google. Quiere ver opciones.",
    history: [
      { at: daysAgo(5), kind: "mensaje", detail: "Pidió tour 3D del apto" },
      { at: daysAgo(8), kind: "lead", detail: "Lead orgánico desde Google" },
    ],
  },
  {
    id: "c-008",
    full_name: "María Pérez",
    phone: "+58 414-1112233",
    email: "maria.perez@example.com",
    source: "instagram",
    tags: ["valencia", "casa-colonial"],
    last_contact_at: daysAgo(10),
    trust_score: 450,
    status: "frio",
    bio: "Vió la casa colonial de Valencia pero no respondió al seguimiento.",
    history: [
      { at: daysAgo(10), kind: "mensaje", detail: "Última respuesta hace 10 días" },
      { at: daysAgo(12), kind: "lead", detail: "Lead inicial desde Instagram" },
    ],
  },
  {
    id: "c-009",
    full_name: "Jorge Salazar",
    phone: "+58 412-4422118",
    email: "jorge.s@example.com",
    source: "facebook",
    tags: ["barquisimeto", "remodelado"],
    last_contact_at: daysAgo(7),
    trust_score: 670,
    status: "tibio",
    bio: "Está reubicándose a Barquisimeto por trabajo.",
    history: [
      { at: daysAgo(7), kind: "mensaje", detail: "Pidió referencias del edificio" },
    ],
  },
  {
    id: "c-010",
    full_name: "Camila Ferrer",
    phone: "+58 424-7788991",
    email: "camila.ferrer@example.com",
    source: "llavero",
    tags: ["penthouse", "caracas", "lujo"],
    last_contact_at: daysAgo(2),
    trust_score: 890,
    status: "caliente",
    bio: "Llavero detectó alta intención por inmuebles premium. Está agendando dos visitas.",
    history: [
      { at: daysAgo(2), kind: "visita", detail: "Visitó el penthouse de Altamira" },
      { at: daysAgo(3), kind: "mensaje", detail: "Llavero la calificó como caliente" },
    ],
  },
  {
    id: "c-011",
    full_name: "Ricardo Núñez",
    phone: "+58 416-1023456",
    email: "ricardo.nunez@example.com",
    source: "whatsapp",
    tags: ["lecheria", "playa", "familia-grande"],
    last_contact_at: daysAgo(1),
    trust_score: 740,
    status: "caliente",
    bio: "Busca casa de playa para fines de semana. Familia con 2 hijos.",
    history: [
      { at: daysAgo(1), kind: "llamada", detail: "Confirma visita el sábado" },
    ],
  },
  {
    id: "c-012",
    full_name: "Gabriela Romero",
    phone: "+58 414-9988221",
    email: "gabriela.r@example.com",
    source: "tiktok",
    tags: ["estudiante", "merida", "presupuesto-bajo"],
    last_contact_at: daysAgo(14),
    trust_score: 380,
    status: "frio",
    bio: "Estudiante ULA. Vio video del inmueble en TikTok pero no concretó.",
    history: [
      { at: daysAgo(14), kind: "mensaje", detail: "Última conversación quedó abierta" },
    ],
  },
];

export function listContacts(): Contact[] {
  return [...DEMO_CONTACTS];
}

export function buildContactMetrics(contacts: Contact[]) {
  return {
    total: contacts.length,
    calientes: contacts.filter((c) => c.status === "caliente").length,
    tibios: contacts.filter((c) => c.status === "tibio").length,
    frios: contacts.filter((c) => c.status === "frio").length,
  };
}
