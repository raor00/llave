"use client";

/**
 * Bandeja de mensajes compartida por los 3 roles. Layout de dos paneles en
 * desktop (lista de conversaciones + hilo activo) y apilado en mobile (la
 * lista se reemplaza por el hilo al tocar una conversación). El envío llama a
 * sendMessageAction y agrega el mensaje de forma optimista.
 */

import { useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Conversation, Message, MessageChannel } from "@/lib/db/messages";
import { sendMessageAction } from "@/app/_actions/messages";
import { IconSend } from "@/components/dashboard-icons";
import {
  IconInstagram,
  IconFacebook,
  IconWhatsapp,
} from "@/components/social-icons";

type ActiveThread = { conversation: Conversation; messages: Message[] } | null;

const CHANNEL_LABEL: Record<MessageChannel, string> = {
  llave: "Llave",
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  facebook: "Facebook",
};

function ChannelIcon({ channel, size = 13 }: { channel: MessageChannel; size?: number }) {
  if (channel === "whatsapp")
    return <IconWhatsapp size={size} className="text-[#25d366]" />;
  if (channel === "instagram")
    return <IconInstagram size={size} className="text-[#e1306c]" />;
  if (channel === "facebook")
    return <IconFacebook size={size} className="text-[#1877f2]" />;
  // llave: glifo de llave
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="text-[color:var(--color-brand-700)]"
    >
      <circle cx="8" cy="8" r="4" />
      <path d="M11 11 L20 20" />
      <path d="M17 17 L19 15" />
      <path d="M14 14 L16 12" />
    </svg>
  );
}

function timeAgo(iso: string): string {
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (diffMin < 1) return "ahora";
  if (diffMin < 60) return `${diffMin}m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}d`;
  return new Date(iso).toLocaleDateString("es-VE", { day: "numeric", month: "short" });
}

function truncate(s: string, n: number): string {
  return s.length <= n ? s : s.slice(0, n).trimEnd() + "…";
}

export function MessagesInbox({
  role,
  conversations,
  activeThread,
}: {
  role: Conversation["role"];
  conversations: Conversation[];
  activeThread: ActiveThread;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [draft, setDraft] = useState("");
  const [optimistic, setOptimistic] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeId = activeThread?.conversation.id ?? null;

  // Resetea los mensajes optimistas al cambiar de conversación.
  useEffect(() => {
    setOptimistic([]);
    setDraft("");
  }, [activeId]);

  // Auto-scroll al fondo cuando llegan mensajes nuevos.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeId, optimistic.length, activeThread?.messages.length]);

  if (conversations.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="font-display text-lg font-semibold">Tu bandeja está vacía</p>
        <p className="text-sm text-[color:var(--color-fg-muted)] mt-1">
          Cuando inicies o recibas una conversación, aparecerá aquí.
        </p>
      </div>
    );
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !activeId) return;
    const temp: Message = {
      id: `optimistic-${Date.now()}`,
      conversation_id: activeId,
      sender: "me",
      body: text,
      created_at: new Date().toISOString(),
      read: true,
    };
    setOptimistic((prev) => [...prev, temp]);
    setDraft("");
    startTransition(async () => {
      await sendMessageAction(activeId, text);
      router.refresh();
    });
  }

  const threadMessages = activeThread
    ? [...activeThread.messages, ...optimistic]
    : [];

  return (
    <div className="card overflow-hidden grid lg:grid-cols-[320px_1fr] h-[calc(100vh-13rem)] min-h-[480px]">
      {/* Lista de conversaciones */}
      <aside
        className={`border-r border-[color:var(--color-border)] overflow-y-auto ${
          activeId ? "hidden lg:block" : "block"
        }`}
      >
        <ul>
          {conversations.map((c) => {
            const active = c.id === activeId;
            return (
              <li key={c.id}>
                <Link
                  href={`/${role}/mensajes?c=${c.id}`}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-[color:var(--color-border)] transition ${
                    active
                      ? "bg-[color:var(--color-brand-50)]"
                      : "hover:bg-[color:var(--color-bg)]"
                  }`}
                >
                  <span className="size-10 shrink-0 rounded-full bg-[color:var(--color-brand-100)] text-[color:var(--color-brand-700)] grid place-items-center font-semibold text-sm">
                    {c.avatar_initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm truncate flex-1">
                        {c.counterpart_name}
                      </span>
                      <ChannelIcon channel={c.channel} />
                      <span className="text-[10px] text-[color:var(--color-fg-soft)] shrink-0">
                        {timeAgo(c.last_at)}
                      </span>
                    </div>
                    <span className="chip-muted text-[10px] mt-0.5 inline-block">
                      {c.counterpart_role}
                    </span>
                    <p className="text-xs text-[color:var(--color-fg-muted)] mt-1 leading-snug">
                      {truncate(c.last_message, 52)}
                    </p>
                  </div>
                  {c.unread > 0 && (
                    <span className="shrink-0 size-5 rounded-full bg-[color:var(--color-brand-500)] text-white text-[10px] font-bold grid place-items-center">
                      {c.unread}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Hilo activo */}
      <section
        className={`flex flex-col min-w-0 ${activeId ? "flex" : "hidden lg:flex"}`}
      >
        {activeThread ? (
          <>
            <header className="flex items-center gap-3 px-4 py-3 border-b border-[color:var(--color-border)]">
              <Link
                href={`/${role}/mensajes`}
                className="lg:hidden text-[color:var(--color-fg-soft)] hover:text-[color:var(--color-fg)] text-lg shrink-0"
                aria-label="Volver a la lista"
              >
                ←
              </Link>
              <span className="size-9 shrink-0 rounded-full bg-[color:var(--color-brand-100)] text-[color:var(--color-brand-700)] grid place-items-center font-semibold text-sm">
                {activeThread.conversation.avatar_initials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm truncate">
                    {activeThread.conversation.counterpart_name}
                  </span>
                  <ChannelIcon channel={activeThread.conversation.channel} />
                </div>
                <div className="text-[11px] text-[color:var(--color-fg-soft)]">
                  {activeThread.conversation.counterpart_role} ·{" "}
                  {CHANNEL_LABEL[activeThread.conversation.channel]}
                </div>
              </div>
              {activeThread.conversation.property_id && (
                <Link
                  href={`/inmueble/${activeThread.conversation.property_id}`}
                  className="text-[11px] text-[color:var(--color-brand-700)] hover:underline shrink-0 max-w-[40%] truncate"
                >
                  {activeThread.conversation.property_title}
                </Link>
              )}
            </header>

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5 bg-[color:var(--color-bg)]"
            >
              {threadMessages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.sender === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm leading-snug ${
                      m.sender === "me"
                        ? "bg-[color:var(--color-brand-500)] text-white rounded-br-sm"
                        : "bg-white border border-[color:var(--color-border)] rounded-bl-sm"
                    }`}
                  >
                    <p>{m.body}</p>
                    <div
                      className={`text-[10px] mt-1 ${
                        m.sender === "me"
                          ? "text-white/70"
                          : "text-[color:var(--color-fg-soft)]"
                      }`}
                    >
                      {timeAgo(m.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleSend}
              className="flex items-center gap-2 px-3 py-3 border-t border-[color:var(--color-border)]"
            >
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Escribe un mensaje…"
                className="input flex-1"
              />
              <button
                type="submit"
                disabled={!draft.trim() || isPending}
                className="btn btn-primary !px-3 shrink-0"
                aria-label="Enviar mensaje"
              >
                <IconSend size={16} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 grid place-items-center p-10 text-center">
            <div>
              <p className="font-display text-lg font-semibold">
                Selecciona una conversación
              </p>
              <p className="text-sm text-[color:var(--color-fg-muted)] mt-1">
                Elige un chat de la lista para ver el hilo completo.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
