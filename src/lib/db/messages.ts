/**
 * Store en memoria de la bandeja de mensajes para los 3 roles (inquilino,
 * asesor, propietario). Seed determinista con hilos realistas: el asesor habla
 * con leads (nombres reutilizados de contacts.ts), el inquilino con asesores y
 * propietarios sobre inmuebles, y el propietario con asesores e inquilinos.
 * Cuando Supabase esté listo se reemplaza por tablas conversations + messages.
 */

import { DEMO_PROPERTIES } from "./seed-data";

export type MessageChannel = "llave" | "whatsapp" | "instagram" | "facebook";

export type Message = {
  id: string;
  conversation_id: string;
  sender: "me" | "them";
  body: string;
  created_at: string;
  read: boolean;
};

export type Conversation = {
  id: string;
  role: "inquilino" | "asesor" | "propietario"; // de quién es la bandeja
  counterpart_name: string;
  counterpart_role: string; // ej "Inquilino interesado", "Asesor Llave", "Propietario"
  channel: MessageChannel;
  property_id?: string;
  property_title?: string;
  last_message: string;
  last_at: string;
  unread: number;
  avatar_initials: string;
};

function minsAgo(n: number): string {
  return new Date(Date.now() - n * 60_000).toISOString();
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

type Seed = {
  conv: Omit<Conversation, "last_message" | "last_at" | "unread" | "avatar_initials">;
  thread: Array<{ sender: "me" | "them"; body: string; minsAgo: number; read?: boolean }>;
};

const SEEDS: Seed[] = [
  // ---- ASESOR ----
  {
    conv: {
      id: "conv-a1",
      role: "asesor",
      counterpart_name: "Carlos González",
      counterpart_role: "Lead caliente",
      channel: "whatsapp",
      property_id: propId(0),
      property_title: cleanTitle(0),
    },
    thread: [
      { sender: "them", body: "Hola, vi el apartamento de Las Mercedes en Instagram. ¿Sigue disponible?", minsAgo: 220, read: true },
      { sender: "me", body: "Hola Carlos, sí, está disponible. ¿Quieres coordinar una visita esta semana?", minsAgo: 210, read: true },
      { sender: "them", body: "Sí, me viene bien el jueves en la tarde. ¿Tiene planta eléctrica?", minsAgo: 35 },
      { sender: "them", body: "Otra cosa, ¿aceptan mascotas? Tengo un perro pequeño.", minsAgo: 32 },
    ],
  },
  {
    conv: {
      id: "conv-a2",
      role: "asesor",
      counterpart_name: "Ana López",
      counterpart_role: "Lead caliente",
      channel: "facebook",
      property_id: propId(3),
      property_title: cleanTitle(3),
    },
    thread: [
      { sender: "them", body: "Buenas, soy médica residente y busco algo cerca del hospital en Maracaibo.", minsAgo: 600, read: true },
      { sender: "me", body: "Hola Ana, tengo un apartamento moderno en Maracaibo Norte que te puede servir. Te paso el tour 3D.", minsAgo: 580, read: true },
      { sender: "them", body: "Perfecto, lo reviso y te confirmo para una visita virtual.", minsAgo: 90 },
    ],
  },
  {
    conv: {
      id: "conv-a3",
      role: "asesor",
      counterpart_name: "Sofía Hernández",
      counterpart_role: "Lead caliente",
      channel: "llave",
      property_id: propId(1),
      property_title: cleanTitle(1),
    },
    thread: [
      { sender: "them", body: "Llavero me conectó contigo por la casa de El Hatillo. Somos familia con dos hijos.", minsAgo: 2900, read: true },
      { sender: "me", body: "Hola Sofía, qué bueno. La casa tiene jardín y zona BBQ, ideal para niños. ¿Te muestro el sábado?", minsAgo: 2880, read: true },
      { sender: "them", body: "Nos encantó la visita del sábado, gracias. Estamos evaluando con mi esposo.", minsAgo: 1400, read: true },
      { sender: "me", body: "Genial, cualquier duda con el contrato me dices. No pedimos meses por adelantado.", minsAgo: 1380, read: true },
    ],
  },
  {
    conv: {
      id: "conv-a4",
      role: "asesor",
      counterpart_name: "Diego Castillo",
      counterpart_role: "Lead tibio",
      channel: "whatsapp",
      property_id: propId(5),
      property_title: cleanTitle(5),
    },
    thread: [
      { sender: "them", body: "Quiero abrir un café. ¿El local de Sabana Grande cuánto mide?", minsAgo: 4300, read: true },
      { sender: "me", body: "Hola Diego, son 80m² con vidriera a la calle y alto tránsito peatonal. Te mando fotos.", minsAgo: 4280, read: true },
      { sender: "them", body: "¿Me puedes pasar fotos del fondo y del baño?", minsAgo: 4100 },
    ],
  },
  {
    conv: {
      id: "conv-a5",
      role: "asesor",
      counterpart_name: "Camila Ferrer",
      counterpart_role: "Lead caliente",
      channel: "instagram",
      property_id: propId(6),
      property_title: cleanTitle(6),
    },
    thread: [
      { sender: "them", body: "Vi el penthouse de Altamira en tu reel. ¿Cuándo puedo verlo?", minsAgo: 2800, read: true },
      { sender: "me", body: "Hola Camila, tengo cupo mañana o el viernes. La terraza con vista al Ávila es lo mejor.", minsAgo: 2780, read: true },
      { sender: "them", body: "Mañana entonces. ¿A qué hora te queda bien?", minsAgo: 120 },
    ],
  },
  // ---- INQUILINO ----
  {
    conv: {
      id: "conv-i1",
      role: "inquilino",
      counterpart_name: "Rafael Oviedo",
      counterpart_role: "Asesor Llave",
      channel: "llave",
      property_id: propId(0),
      property_title: cleanTitle(0),
    },
    thread: [
      { sender: "me", body: "Hola, me interesa el apartamento de Las Mercedes. ¿Sigue disponible?", minsAgo: 300, read: true },
      { sender: "them", body: "Hola, sí, disponible. Tiene planta eléctrica y agua continua. ¿Quieres visitarlo?", minsAgo: 280, read: true },
      { sender: "me", body: "Sí, me gustaría. ¿Qué documentos necesito para aplicar?", minsAgo: 40 },
      { sender: "them", body: "Solo cédula y referencia laboral. Y lo mejor: no pedimos meses por adelantado.", minsAgo: 38 },
    ],
  },
  {
    conv: {
      id: "conv-i2",
      role: "inquilino",
      counterpart_name: "María Inmobiliaria",
      counterpart_role: "Propietaria",
      channel: "whatsapp",
      property_id: propId(2),
      property_title: cleanTitle(2),
    },
    thread: [
      { sender: "me", body: "Buenas, vi su estudio amoblado en Chacao. ¿Está cerca del metro?", minsAgo: 800, read: true },
      { sender: "them", body: "Hola, sí, a tres cuadras de la estación Chacao. Incluye todos los muebles.", minsAgo: 780, read: true },
      { sender: "me", body: "Perfecto. ¿El condominio incluye agua y aseo?", minsAgo: 200 },
    ],
  },
  {
    conv: {
      id: "conv-i3",
      role: "inquilino",
      counterpart_name: "Llavero IA",
      counterpart_role: "Asistente Llave",
      channel: "llave",
      property_id: propId(7),
      property_title: cleanTitle(7),
    },
    thread: [
      { sender: "them", body: "Encontré 3 inmuebles que encajan con tu presupuesto. El de Catia es el más económico.", minsAgo: 1500, read: true },
      { sender: "me", body: "Me interesa el de Catia. ¿Me puedes agendar una visita?", minsAgo: 1480, read: true },
      { sender: "them", body: "Listo, le avisé al asesor. Te escribirá para coordinar el día.", minsAgo: 1460, read: true },
    ],
  },
  {
    conv: {
      id: "conv-i4",
      role: "inquilino",
      counterpart_name: "Jorge Asesor",
      counterpart_role: "Asesor Llave",
      channel: "instagram",
      property_id: propId(8),
      property_title: cleanTitle(8),
    },
    thread: [
      { sender: "me", body: "Hola, vi la casa con piscina en Lechería. ¿Para fines de semana se puede alquilar?", minsAgo: 2600, read: true },
      { sender: "them", body: "Hola, esa es para alquiler anual, pero tengo otra opción de temporada. Te paso info.", minsAgo: 2580, read: true },
      { sender: "them", body: "¿Te interesa que coordinemos una llamada para revisar las dos opciones?", minsAgo: 600 },
    ],
  },
  // ---- PROPIETARIO ----
  {
    conv: {
      id: "conv-p1",
      role: "propietario",
      counterpart_name: "Rafael Oviedo",
      counterpart_role: "Asesor Llave",
      channel: "llave",
      property_id: propId(6),
      property_title: cleanTitle(6),
    },
    thread: [
      { sender: "them", body: "Buenas, ya publiqué el penthouse de Altamira. Tuvo 412 likes en el reel de Instagram.", minsAgo: 500, read: true },
      { sender: "me", body: "Excelente. ¿Cuántas visitas tienes agendadas?", minsAgo: 480, read: true },
      { sender: "them", body: "Tres esta semana. Una lead caliente, Camila, quiere verlo mañana.", minsAgo: 60 },
    ],
  },
  {
    conv: {
      id: "conv-p2",
      role: "propietario",
      counterpart_name: "Andrés Rivas",
      counterpart_role: "Inquilino actual",
      channel: "whatsapp",
      property_id: propId(6),
      property_title: cleanTitle(6),
    },
    thread: [
      { sender: "them", body: "Hola, el pago de este mes ya lo hice por Zelle. Te paso el comprobante.", minsAgo: 1200, read: true },
      { sender: "me", body: "Recibido, gracias Andrés. Todo en orden.", minsAgo: 1180, read: true },
      { sender: "them", body: "Una consulta: la cerradura de la terraza está fallando. ¿Pueden enviar a alguien?", minsAgo: 150 },
    ],
  },
  {
    conv: {
      id: "conv-p3",
      role: "propietario",
      counterpart_name: "Llavero IA",
      counterpart_role: "Asistente Llave",
      channel: "llave",
      property_id: propId(1),
      property_title: cleanTitle(1),
    },
    thread: [
      { sender: "them", body: "Tu casa de El Hatillo tiene engagement alto. Sugiero subir el precio 8% en la próxima renovación.", minsAgo: 3000, read: true },
      { sender: "me", body: "¿Y el riesgo de perder al inquilino actual?", minsAgo: 2980, read: true },
      { sender: "them", body: "Bajo: la familia Hernández mostró intención de quedarse. Te armé el comparativo de mercado.", minsAgo: 2960, read: true },
    ],
  },
  {
    conv: {
      id: "conv-p4",
      role: "propietario",
      counterpart_name: "Sofía Hernández",
      counterpart_role: "Inquilino interesado",
      channel: "facebook",
      property_id: propId(1),
      property_title: cleanTitle(1),
    },
    thread: [
      { sender: "them", body: "Hola, somos la familia que visitó la casa de El Hatillo. Nos encantó.", minsAgo: 1300, read: true },
      { sender: "me", body: "Qué bueno escuchar eso. Cualquier duda del contrato, mi asesor de Llave los acompaña.", minsAgo: 1280, read: true },
      { sender: "them", body: "Perfecto, ya estamos hablando con él. Gracias por la flexibilidad con el depósito.", minsAgo: 400 },
    ],
  },
];

function buildStores(): { conversations: Conversation[]; messages: Message[] } {
  const conversations: Conversation[] = [];
  const messages: Message[] = [];

  for (const seed of SEEDS) {
    let unread = 0;
    seed.thread.forEach((m, idx) => {
      const read = m.read ?? false;
      if (m.sender === "them" && !read) unread += 1;
      messages.push({
        id: `${seed.conv.id}-m${idx + 1}`,
        conversation_id: seed.conv.id,
        sender: m.sender,
        body: m.body,
        created_at: minsAgo(m.minsAgo),
        read,
      });
    });
    const last = seed.thread[seed.thread.length - 1];
    conversations.push({
      ...seed.conv,
      last_message: last?.body ?? "",
      last_at: minsAgo(last?.minsAgo ?? 0),
      unread,
      avatar_initials: initials(seed.conv.counterpart_name),
    });
  }

  return { conversations, messages };
}

const stores = buildStores();
export const CONVERSATIONS_STORE: Conversation[] = stores.conversations;
export const MESSAGES_STORE: Message[] = stores.messages;

export function listConversations(role: Conversation["role"]): Conversation[] {
  return CONVERSATIONS_STORE.filter((c) => c.role === role).sort(
    (a, b) => new Date(b.last_at).getTime() - new Date(a.last_at).getTime()
  );
}

export function getThread(
  conversationId: string
): { conversation: Conversation; messages: Message[] } | null {
  const conversation = CONVERSATIONS_STORE.find((c) => c.id === conversationId);
  if (!conversation) return null;
  const messages = MESSAGES_STORE.filter(
    (m) => m.conversation_id === conversationId
  ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  return { conversation, messages };
}

export function sendMessage(conversationId: string, body: string): Message | null {
  const conversation = CONVERSATIONS_STORE.find((c) => c.id === conversationId);
  const text = body.trim();
  if (!conversation || !text) return null;
  const now = new Date().toISOString();
  const message: Message = {
    id: `${conversationId}-m${Date.now()}`,
    conversation_id: conversationId,
    sender: "me",
    body: text,
    created_at: now,
    read: true,
  };
  MESSAGES_STORE.push(message);
  conversation.last_message = text;
  conversation.last_at = now;
  return message;
}

export function markRead(conversationId: string): void {
  const conversation = CONVERSATIONS_STORE.find((c) => c.id === conversationId);
  if (conversation) conversation.unread = 0;
  for (const m of MESSAGES_STORE) {
    if (m.conversation_id === conversationId) m.read = true;
  }
}
