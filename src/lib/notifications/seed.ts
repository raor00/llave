/**
 * In-memory notification seed. Mirrors the schema in
 * `supabase/migrations/0003_stats_contracts_notifications.sql` so the demo
 * works even before the migration is applied.
 *
 * Each role gets pre-seeded notifications tailored to its workflow:
 * - inquilino: contract status, score boosts, recommended properties.
 * - asesor:    new leads, visits agendadas, listings pending publish.
 * - propietario: new views, new leads, occupancy alerts.
 */

export type Role = "inquilino" | "asesor" | "propietario";

export type NotificationKind =
  | "lead_new"
  | "visit_scheduled"
  | "property_view"
  | "score_up"
  | "contract_reminder"
  | "tip"
  | "marketing";

export type Notification = {
  id: string;
  user_id: string | null;
  role: Role;
  kind: NotificationKind;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
};

function minsAgo(m: number) {
  return new Date(Date.now() - m * 60 * 1000).toISOString();
}

export const SEED_NOTIFICATIONS: Notification[] = [
  // Inquilino
  {
    id: crypto.randomUUID(),
    user_id: null,
    role: "inquilino",
    kind: "contract_reminder",
    title: "Tu contrato vence en 4 meses",
    body: "Estás a tiempo. Si pagas a tiempo este mes ganas +15 en Trust Score.",
    link: "/inquilino",
    read: false,
    created_at: minsAgo(6),
  },
  {
    id: crypto.randomUUID(),
    user_id: null,
    role: "inquilino",
    kind: "score_up",
    title: "Llavero subió tu Trust Score a 735",
    body: "Pago a tiempo registrado. Vas rumbo a nivel Premium.",
    link: "/inquilino",
    read: false,
    created_at: minsAgo(120),
  },
  {
    id: crypto.randomUUID(),
    user_id: null,
    role: "inquilino",
    kind: "tip",
    title: "3 inmuebles nuevos en Las Mercedes coinciden con tu perfil",
    body: "Llavero detectó que repetiste búsquedas en esa zona. Ya los filtró por ti.",
    link: "/buscar?city=Caracas",
    read: true,
    created_at: minsAgo(60 * 8),
  },

  // Asesor
  {
    id: crypto.randomUUID(),
    user_id: null,
    role: "asesor",
    kind: "lead_new",
    title: "Lead nuevo: Carlos González",
    body: "Pareja joven, busca mudarse a Las Mercedes en 2 semanas. Budget $300.",
    link: "/asesor/leads",
    read: false,
    created_at: minsAgo(8),
  },
  {
    id: crypto.randomUUID(),
    user_id: null,
    role: "asesor",
    kind: "visit_scheduled",
    title: "Visita agendada · Loft Hackathon",
    body: "Hoy 17:00. Llavero ya envió el recordatorio al inquilino.",
    link: "/asesor/leads",
    read: false,
    created_at: minsAgo(35),
  },
  {
    id: crypto.randomUUID(),
    user_id: null,
    role: "asesor",
    kind: "property_view",
    title: "+47 vistas hoy en tu cartera",
    body: "El Loft Hackathon concentra el 38% de visitas. Considerá un Reels para Instagram.",
    link: "/asesor",
    read: true,
    created_at: minsAgo(60 * 3),
  },

  // Propietario
  {
    id: crypto.randomUUID(),
    user_id: null,
    role: "propietario",
    kind: "property_view",
    title: "12 personas vieron tu inmueble esta semana",
    body: "Tu inmueble en Altamira está siendo visto 3x el promedio de la ciudad.",
    link: "/propietario",
    read: false,
    created_at: minsAgo(20),
  },
  {
    id: crypto.randomUUID(),
    user_id: null,
    role: "propietario",
    kind: "lead_new",
    title: "Inquilino pre-calificado interesado",
    body: "Ana López — Trust Score 820. Quiere agendar visita.",
    link: "/propietario",
    read: false,
    created_at: minsAgo(60),
  },
  {
    id: crypto.randomUUID(),
    user_id: null,
    role: "propietario",
    kind: "tip",
    title: "Ocupación de tu cartera: 67%",
    body: "Llavero sugiere bajar 5% el precio del estudio en Chacao para acelerar.",
    link: "/propietario",
    read: true,
    created_at: minsAgo(60 * 18),
  },
];

export function getNotificationsForRole(role: Role): Notification[] {
  return SEED_NOTIFICATIONS
    .filter((n) => n.role === role)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}
