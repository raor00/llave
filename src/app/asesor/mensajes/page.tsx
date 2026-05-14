/**
 * /asesor/mensajes — Bandeja del asesor. Lista conversaciones con leads y
 * clientes potenciales; ?c=<id> selecciona el hilo activo. Data desde el store
 * en memoria messages.ts; se reemplaza por Supabase cuando esté listo.
 */

import { listConversations, getThread } from "@/lib/db/messages";
import { MessagesInbox } from "@/components/mensajes/messages-inbox";

export const dynamic = "force-dynamic";

export default async function AsesorMensajesPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c } = await searchParams;
  const conversations = listConversations("asesor");
  const activeThread = c ? getThread(c) : null;

  return (
    <div className="container-x py-8 sm:py-10 space-y-6">
      <header>
        <span className="chip mb-2">Operación · Mensajes</span>
        <h1 className="font-display text-2xl sm:text-3xl font-bold">Mensajes</h1>
        <p className="text-sm text-[color:var(--color-fg-muted)] mt-1 max-w-2xl">
          Conversa con tus leads y clientes potenciales en un solo lugar.
        </p>
      </header>
      <MessagesInbox
        role="asesor"
        conversations={conversations}
        activeThread={activeThread}
      />
    </div>
  );
}
