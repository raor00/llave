/**
 * /propietario/mensajes — Bandeja del propietario. Conversa con asesores e
 * inquilinos de sus inmuebles; ?c=<id> selecciona el hilo activo. Data desde
 * el store en memoria messages.ts.
 */

import { listConversations, getThread } from "@/lib/db/messages";
import { MessagesInbox } from "@/components/mensajes/messages-inbox";

export const dynamic = "force-dynamic";

export default async function PropietarioMensajesPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c } = await searchParams;
  const conversations = listConversations("propietario");
  const activeThread = c ? getThread(c) : null;

  return (
    <div className="container-x py-8 sm:py-10 space-y-6">
      <header>
        <span className="chip mb-2">Operación · Mensajes</span>
        <h1 className="font-display text-2xl sm:text-3xl font-bold">Mensajes</h1>
        <p className="text-sm text-[color:var(--color-fg-muted)] mt-1 max-w-2xl">
          Conversa con asesores e inquilinos de tus inmuebles.
        </p>
      </header>
      <MessagesInbox
        role="propietario"
        conversations={conversations}
        activeThread={activeThread}
      />
    </div>
  );
}
