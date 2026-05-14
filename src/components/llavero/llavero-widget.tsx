// Widget flotante de Llavero: FAB fijo abajo-derecha + panel compacto de chat
// que reutiliza el transporte /api/chat y el render de ToolResult + MarkdownText.
"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { LlaveLogo } from "@/components/llave-logo";
import { ToolResult } from "@/components/chat/tool-result";
import { MarkdownText } from "@/components/chat/markdown-text";
import { IconSend } from "@/components/dashboard-icons";
import { useLlaveroWidget } from "./llavero-widget-provider";

const QUICK_ACTIONS = [
  "Buscar inmueble",
  "Ver mis leads",
  "Generar contrato",
];

export function LlaveroWidget() {
  const pathname = usePathname();
  const { messages, sendMessage, status, error, open, setOpen, input, setInput } =
    useLlaveroWidget();
  const scroller = useRef<HTMLDivElement>(null);

  const isBusy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (!open) return;
    scroller.current?.scrollTo({
      top: scroller.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, status, open]);

  // En /chat el widget es redundante: la página ya es el chat completo.
  if (pathname === "/chat") return null;

  const submit = (text: string) => {
    const t = text.trim();
    if (!t || isBusy) return;
    sendMessage({ text: t });
    setInput("");
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 size-14 rounded-full bg-[color:var(--color-brand-500)] text-white shadow-pop grid place-items-center hover:bg-[color:var(--color-brand-600)] transition"
          aria-label="Abrir chat con Llavero"
        >
          <LlaveLogo className="size-7" />
        </button>
      )}

      {open && (
        <div className="fixed z-50 inset-x-3 bottom-3 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[360px]">
          <div className="card overflow-hidden grid grid-rows-[auto_1fr_auto] h-[70dvh] max-h-[520px] shadow-pop">
            <header className="flex items-center justify-between gap-3 border-b px-4 py-3 bg-white">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-full bg-[color:var(--color-brand-100)] flex items-center justify-center">
                  <LlaveLogo className="size-5 text-[color:var(--color-brand-700)]" />
                </div>
                <div>
                  <div className="font-semibold text-sm leading-tight">Llavero</div>
                  <div className="text-[11px] text-[color:var(--color-fg-soft)]">
                    <span className="text-[color:var(--color-brand-600)]">en línea</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="size-8 rounded-full grid place-items-center text-[color:var(--color-fg-muted)] hover:bg-[color:var(--color-bg)] hover:text-[color:var(--color-fg)] transition"
                aria-label="Cerrar chat"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="size-4"
                  aria-hidden
                >
                  <path
                    d="M6 6 L18 18 M18 6 L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </header>

            <div
              ref={scroller}
              className="overflow-y-auto px-4 py-4 bg-[color:var(--color-bg)]"
            >
              {messages.length === 0 && (
                <div className="text-center pt-4">
                  <div className="size-11 mx-auto rounded-full bg-[color:var(--color-brand-100)] flex items-center justify-center mb-3">
                    <LlaveLogo className="size-6 text-[color:var(--color-brand-700)]" />
                  </div>
                  <p className="text-sm font-semibold">
                    Hola, soy Llavero. ¿En qué te ayudo?
                  </p>
                  <p className="mt-1.5 text-xs text-[color:var(--color-fg-muted)]">
                    Pregúntame por inmuebles, leads o contratos.
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {QUICK_ACTIONS.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => submit(q)}
                        className="chip hover:border-[color:var(--color-brand-300)] transition"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m) => (
                <Message
                  key={m.id}
                  role={m.role}
                  parts={
                    m.parts as Array<{ type: string; [key: string]: unknown }>
                  }
                />
              ))}

              {isBusy && (
                <div className="flex items-center gap-2 text-xs text-[color:var(--color-fg-soft)] mt-2 ml-10">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                  <span>Llavero está pensando…</span>
                </div>
              )}

              {error && (
                <div className="mt-3 card border-[color:var(--color-danger)]/40 p-3 text-xs text-[color:var(--color-danger)]">
                  {error.message || "Hubo un problema. Intenta de nuevo."}
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit(input);
              }}
              className="border-t bg-white p-2.5 flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Cuéntame qué necesitas…"
                className="input flex-1 min-w-0 text-sm"
                disabled={isBusy}
              />
              <button
                type="submit"
                disabled={isBusy || !input.trim()}
                className="shrink-0 size-9 rounded-full grid place-items-center bg-[color:var(--color-brand-500)] text-white hover:bg-[color:var(--color-brand-600)] disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Enviar"
              >
                <IconSend size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function Message({
  role,
  parts,
}: {
  role: string;
  parts: Array<{ type: string; [key: string]: unknown }>;
}) {
  const isUser = role === "user";
  return (
    <div className={`flex gap-2.5 mb-4 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`shrink-0 size-8 rounded-full flex items-center justify-center text-xs font-semibold ${
          isUser
            ? "bg-[color:var(--color-fg)] text-white"
            : "bg-[color:var(--color-brand-100)] text-[color:var(--color-brand-700)]"
        }`}
      >
        {isUser ? "Tú" : <LlaveLogo className="size-4" />}
      </div>
      <div className="max-w-[85%] space-y-2">
        {parts.map((part, idx) => {
          if (part.type === "text") {
            const text = String((part as { text?: string }).text ?? "");
            return (
              <div
                key={idx}
                className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  isUser
                    ? "bg-[color:var(--color-fg)] text-white ml-auto whitespace-pre-wrap"
                    : "bg-white border border-[color:var(--color-border)]"
                }`}
              >
                {isUser ? text : <MarkdownText>{text}</MarkdownText>}
              </div>
            );
          }
          if (typeof part.type === "string" && part.type.startsWith("tool-")) {
            const toolName = part.type.replace(/^tool-/, "");
            return <ToolResult key={idx} toolName={toolName} part={part} />;
          }
          return null;
        })}
      </div>
    </div>
  );
}
