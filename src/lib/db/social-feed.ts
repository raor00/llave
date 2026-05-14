/**
 * Store en memoria del feed social del asesor: publicaciones en redes y los
 * comentarios reales de la gente con sus respuestas. Seed determinista que
 * reutiliza títulos de DEMO_PROPERTIES. Extiende el concepto de posts de
 * marketing.ts agregando comentarios + replies. Cuando integremos Meta /
 * TikTok Business estos getters consultarán esos APIs.
 */

import { DEMO_PROPERTIES } from "./seed-data";

export type SocialPost = {
  id: string;
  platform: "instagram" | "facebook" | "tiktok" | "whatsapp" | "x";
  property_id?: string;
  property_title?: string;
  copy: string;
  image_url?: string;
  status: "publicado" | "borrador" | "programado";
  scheduled_at?: string;
  created_at: string;
  likes: number;
  shares: number;
  comments_count: number;
};

export type PostComment = {
  id: string;
  post_id: string;
  author_name: string;
  author_initials: string;
  body: string;
  created_at: string;
  replies: Array<{ id: string; body: string; created_at: string; by: "me" }>;
};

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function hoursAgo(n: number): string {
  return new Date(Date.now() - n * 3_600_000).toISOString();
}

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function cleanTitle(i: number): string {
  return DEMO_PROPERTIES[i]?.title.replace(/^Llave:\s*/, "") ?? "Inmueble Llave";
}

function propId(i: number): string {
  return DEMO_PROPERTIES[i]?.id ?? "";
}

export const POSTS_STORE: SocialPost[] = [
  {
    id: "sp-001",
    platform: "instagram",
    property_id: propId(6),
    property_title: cleanTitle(6),
    copy: "Imagínate desayunar viendo el Ávila desde tu terraza. Penthouse en Altamira disponible ahora.",
    status: "publicado",
    created_at: daysAgo(1),
    likes: 412,
    shares: 28,
    comments_count: 3,
  },
  {
    id: "sp-002",
    platform: "tiktok",
    property_id: propId(2),
    property_title: cleanTitle(2),
    copy: "POV: encontraste tu estudio en Chacao y ya viene amoblado. Llave lo gestiona por ti.",
    status: "publicado",
    created_at: daysAgo(2),
    likes: 1832,
    shares: 145,
    comments_count: 4,
  },
  {
    id: "sp-003",
    platform: "facebook",
    property_id: propId(1),
    property_title: cleanTitle(1),
    copy: "Casa en El Hatillo con jardín y zona BBQ. Para familias que buscan urbanización cerrada.",
    status: "publicado",
    created_at: daysAgo(3),
    likes: 287,
    shares: 41,
    comments_count: 3,
  },
  {
    id: "sp-004",
    platform: "x",
    property_id: propId(5),
    property_title: cleanTitle(5),
    copy: "Local en Sabana Grande disponible. Alto tránsito peatonal, ideal para café o tienda.",
    status: "publicado",
    created_at: daysAgo(4),
    likes: 88,
    shares: 12,
    comments_count: 2,
  },
  {
    id: "sp-005",
    platform: "instagram",
    property_id: propId(8),
    property_title: cleanTitle(8),
    copy: "Casa de playa en Lechería a tres cuadras del mar, con piscina propia. Reserva tu visita.",
    status: "publicado",
    created_at: daysAgo(5),
    likes: 524,
    shares: 63,
    comments_count: 3,
  },
  {
    id: "sp-006",
    platform: "whatsapp",
    property_id: propId(3),
    property_title: cleanTitle(3),
    copy: "Apartamento moderno en Maracaibo Norte, cerca del hospital. Sin meses por adelantado.",
    status: "publicado",
    created_at: daysAgo(6),
    likes: 56,
    shares: 19,
    comments_count: 2,
  },
];

type CommentSeed = {
  id: string;
  post_id: string;
  author_name: string;
  body: string;
  hoursAgo: number;
  replies?: Array<{ body: string; hoursAgo: number }>;
};

const COMMENT_SEEDS: CommentSeed[] = [
  {
    id: "cm-001",
    post_id: "sp-001",
    author_name: "Camila Ferrer",
    body: "¿Está disponible todavía? Me encanta esa terraza.",
    hoursAgo: 20,
    replies: [{ body: "Hola Camila, sí, está disponible. Te escribo por DM para coordinar una visita.", hoursAgo: 19 }],
  },
  {
    id: "cm-002",
    post_id: "sp-001",
    author_name: "Pedro Martínez",
    body: "¿Cuál es el precio del alquiler?",
    hoursAgo: 15,
  },
  {
    id: "cm-003",
    post_id: "sp-001",
    author_name: "Luisa Ramírez",
    body: "¿Acepta mascotas? Tengo un gato.",
    hoursAgo: 8,
  },
  {
    id: "cm-004",
    post_id: "sp-002",
    author_name: "Valentina Suárez",
    body: "¿Está cerca del metro?",
    hoursAgo: 30,
    replies: [{ body: "Sí Valentina, a tres cuadras de la estación Chacao.", hoursAgo: 29 }],
  },
  {
    id: "cm-005",
    post_id: "sp-002",
    author_name: "Andrés B.",
    body: "¿Cuál es la zona exacta?",
    hoursAgo: 22,
  },
  {
    id: "cm-006",
    post_id: "sp-002",
    author_name: "Daniela Q.",
    body: "¿El condominio incluye agua?",
    hoursAgo: 12,
  },
  {
    id: "cm-007",
    post_id: "sp-002",
    author_name: "José Rondón",
    body: "¿Está disponible para mudarse ya?",
    hoursAgo: 5,
  },
  {
    id: "cm-008",
    post_id: "sp-003",
    author_name: "Familia Pérez",
    body: "¿Cuántas habitaciones tiene la casa?",
    hoursAgo: 40,
    replies: [{ body: "Hola, son 4 habitaciones y 3 baños, más cuarto de servicio.", hoursAgo: 39 }],
  },
  {
    id: "cm-009",
    post_id: "sp-003",
    author_name: "Marcos Liendo",
    body: "¿La urbanización tiene vigilancia 24 horas?",
    hoursAgo: 28,
  },
  {
    id: "cm-010",
    post_id: "sp-003",
    author_name: "Gabriela R.",
    body: "¿Acepta mascotas?",
    hoursAgo: 10,
  },
  {
    id: "cm-011",
    post_id: "sp-004",
    author_name: "Diego Castillo",
    body: "¿Cuántos metros cuadrados tiene el local?",
    hoursAgo: 50,
  },
  {
    id: "cm-012",
    post_id: "sp-004",
    author_name: "Inversiones MG",
    body: "¿Está disponible? Buscamos para una franquicia.",
    hoursAgo: 18,
  },
  {
    id: "cm-013",
    post_id: "sp-005",
    author_name: "Ricardo Núñez",
    body: "¿Se alquila para fines de semana o solo anual?",
    hoursAgo: 60,
    replies: [{ body: "Hola Ricardo, esa es anual, pero tengo otra opción de temporada. Te escribo.", hoursAgo: 58 }],
  },
  {
    id: "cm-014",
    post_id: "sp-005",
    author_name: "Familia Torres",
    body: "¿Cuántas personas pueden quedarse cómodas?",
    hoursAgo: 33,
  },
  {
    id: "cm-015",
    post_id: "sp-005",
    author_name: "Ana V.",
    body: "¿La piscina es privada o compartida?",
    hoursAgo: 14,
  },
  {
    id: "cm-016",
    post_id: "sp-006",
    author_name: "Ana López",
    body: "¿Está cerca del hospital universitario?",
    hoursAgo: 70,
    replies: [{ body: "Sí Ana, a diez minutos en carro. Te paso el tour 3D por DM.", hoursAgo: 69 }],
  },
  {
    id: "cm-017",
    post_id: "sp-006",
    author_name: "Luis Mendoza",
    body: "¿Cuál es la zona exacta?",
    hoursAgo: 25,
  },
];

export const COMMENTS_STORE: PostComment[] = COMMENT_SEEDS.map((seed) => ({
  id: seed.id,
  post_id: seed.post_id,
  author_name: seed.author_name,
  author_initials: initials(seed.author_name),
  body: seed.body,
  created_at: hoursAgo(seed.hoursAgo),
  replies: (seed.replies ?? []).map((r, idx) => ({
    id: `${seed.id}-r${idx + 1}`,
    body: r.body,
    created_at: hoursAgo(r.hoursAgo),
    by: "me" as const,
  })),
}));

export function listPosts(): SocialPost[] {
  return [...POSTS_STORE].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function getPost(id: string): SocialPost | undefined {
  return POSTS_STORE.find((p) => p.id === id);
}

export function listComments(postId: string): PostComment[] {
  return COMMENTS_STORE.filter((c) => c.post_id === postId).sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
}

export type CreatePostInput = {
  platform: SocialPost["platform"];
  copy: string;
  property_id?: string;
  property_title?: string;
};

export function createPost(input: CreatePostInput): SocialPost {
  const post: SocialPost = {
    id: `sp-${Date.now()}`,
    platform: input.platform,
    property_id: input.property_id,
    property_title: input.property_title,
    copy: input.copy.trim(),
    status: "publicado",
    created_at: new Date().toISOString(),
    likes: 0,
    shares: 0,
    comments_count: 0,
  };
  POSTS_STORE.push(post);
  return post;
}

export function replyToComment(
  commentId: string,
  body: string
): PostComment["replies"][number] | null {
  const comment = COMMENTS_STORE.find((c) => c.id === commentId);
  const text = body.trim();
  if (!comment || !text) return null;
  const reply = {
    id: `${commentId}-r${Date.now()}`,
    body: text,
    created_at: new Date().toISOString(),
    by: "me" as const,
  };
  comment.replies.push(reply);
  return reply;
}
