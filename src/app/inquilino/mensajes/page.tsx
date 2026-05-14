/**
 * /inquilino/mensajes — Bandeja del inquilino. Conversa con asesores y
 * propietarios sobre los inmuebles que le interesan; ?c=<id> selecciona el
 * hilo activo. El inquilino no tiene sidebar, usa la nav del SiteHeader.
 */

import { listConversations, getThread } from "@/lib/db/messages";
import { MessagesInbox } from "@/components/mensajes/messages-inbox";

export const dynamic = "force-dynamic";

export default async function InquilinoMensajesPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c } = await searchParams;
  const conversations = listConversations("inquilino");
  const activeThread = c ? getThread(c) : null;

  return (
    <div className="container-x py-8 sm:py-10 space-y-6">
      <header>
        <span className="chip mb-2">Mensajes</span>
        <h1 className="font-display text-2xl sm:text-3xl font-bold">Mensajes</h1>
        <p className="text-sm text-[color:var(--color-fg-muted)] mt-1 max-w-2xl">
          Conversa con asesores y propietarios sobre los inmuebles que te interesan.
        </p>
      </header>
      <MessagesInbox
        role="inquilino"
        conversations={conversations}
        activeThread={activeThread}
      />
    </div>
  );
}
