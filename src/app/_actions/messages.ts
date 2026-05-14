"use server";

/**
 * Server actions de la bandeja de mensajes. sendMessageAction empuja un
 * mensaje "me" al store en memoria y revalida la ruta de mensajes del rol
 * que corresponda para que el hilo se actualice.
 */

import { revalidatePath } from "next/cache";
import { sendMessage, getThread } from "@/lib/db/messages";

export async function sendMessageAction(
  conversationId: string,
  body: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const text = body.trim();
  if (!conversationId) return { ok: false, error: "Falta la conversación." };
  if (!text) return { ok: false, error: "El mensaje está vacío." };

  const message = sendMessage(conversationId, text);
  if (!message) return { ok: false, error: "No se pudo enviar el mensaje." };

  const thread = getThread(conversationId);
  const role = thread?.conversation.role;
  if (role) revalidatePath(`/${role}/mensajes`);

  return { ok: true };
}
