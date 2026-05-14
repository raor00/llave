"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ToolResult } from "./tool-result";
import { LlaveLogo } from "@/components/llave-logo";
import { useVoice } from "./use-voice";
import { MarkdownText } from "./markdown-text";
import {
  IconMic,
  IconMicOff,
  IconSpeaker,
  IconSpeakerOff,
  IconSend,
} from "@/components/dashboard-icons";

const SUGGESTIONS = [
  "Busco un apto en Caracas, máximo $300, 2 ambientes",
  "Soy estudiante en Mérida, presupuesto $200",
  "Compárame los 3 inmuebles más baratos en Valencia",
  "Quiero un local de 80m² en Sabana Grande",
];

export function ChatWindow({ asesorMode = false }: { asesorMode?: boolean }) {
  const sp = useSearchParams();
  const initialContext = sp.get("context");

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const [input, setInput] = useState("");
  const [autoSpeak, setAutoSpeak] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const sentInitial = useRef(false);
  const lastSpokenIdRef = useRef<string | null>(null);
  const voice = useVoice();

  useEffect(() => {
    if (initialContext && !sentInitial.current) {
      sentInitial.current = true;
      sendMessage({ text: initialContext });
    }
  }, [initialContext, sendMessage]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  // auto-speak last assistant text once streaming finishes
  useEffect(() => {
    if (!autoSpeak || status === "streaming" || status === "submitted") return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant") return;
    if (lastSpokenIdRef.current === last.id) return;
    const text = (last.parts ?? [])
      .filter((p) => p.type === "text")
      .map((p) => (p as { text?: string }).text ?? "")
      .join(" ")
      .trim();
    if (!text) return;
    lastSpokenIdRef.current = last.id;
    voice.speak(text);
  }, [messages, status, autoSpeak, voice]);

  const isBusy = status === "submitted" || status === "streaming";

  const onMic = () => {
    if (!voice.supported) return;
    if (voice.listening) voice.stop();
    else {
      voice.start({
        onFinal: (text) => {
          sendMessage({ text });
        },
      });
    }
  };

  return (
    <div className="container-x py-4 sm:py-6">
      <div className="card overflow-hidden grid grid-rows-[auto_1fr_auto] h-[calc(100dvh-7rem)] sm:h-[calc(100dvh-9rem)] max-h-[860px] min-h-[480px]">
        <header className="flex items-center justify-between gap-3 border-b px-4 sm:px-5 py-3 sm:py-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-[color:var(--color-brand-100)] flex items-center justify-center">
              <LlaveLogo className="size-5 text-[color:var(--color-brand-700)]" />
            </div>
            <div>
              <div className="font-semibold">Llavero</div>
              <div className="text-xs text-[color:var(--color-fg-soft)]">
                {asesorMode ? "Modo asesor · publicación asistida" : "Tu asistente de alquileres"} ·{" "}
                <span className="text-[color:var(--color-brand-600)]">en línea</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {voice.supported && (
              <button
                type="button"
                onClick={() => setAutoSpeak((v) => !v)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border transition ${
                  autoSpeak
                    ? "bg-[color:var(--color-brand-100)] text-[color:var(--color-brand-700)] border-[color:var(--color-brand-100)]"
                    : "bg-white text-[color:var(--color-fg-muted)] border-[color:var(--color-border)] hover:text-[color:var(--color-fg)]"
                }`}
                title={autoSpeak ? "Apagar voz" : "Encender voz"}
                aria-pressed={autoSpeak}
              >
                {autoSpeak ? <IconSpeaker size={14} /> : <IconSpeakerOff size={14} />}
                <span className="hidden sm:inline">Voz {autoSpeak ? "encendida" : "apagada"}</span>
              </button>
            )}
            <span className="hidden md:flex chip">Claude + AI SDK</span>
          </div>
        </header>

        <div ref={scroller} className="overflow-y-auto px-5 py-6 bg-[color:var(--color-bg)]">
          {messages.length === 0 && (
            <div className="max-w-2xl mx-auto text-center pt-10">
              <div className="size-14 mx-auto rounded-full bg-[color:var(--color-brand-100)] flex items-center justify-center mb-4">
                <LlaveLogo className="size-7 text-[color:var(--color-brand-700)]" />
              </div>
              <h2 className="font-display text-2xl font-bold">
                {asesorMode
                  ? "Soy Llavero. Te ayudo a publicar y gestionar inmuebles."
                  : "Hola, soy Llavero. ¿Qué tipo de inmueble buscas?"}
              </h2>
              <p className="mt-3 text-[color:var(--color-fg-muted)]">
                Cuéntame ciudad, presupuesto y un par de detalles. Te muestro opciones reales y te ayudo a agendar visita.
                {voice.supported && <> Puedes usar el micrófono también.</>}
              </p>
              <div className="mt-7 grid sm:grid-cols-2 gap-3 max-w-xl mx-auto text-left">
                {(asesorMode
                  ? [
                      "Quiero publicar un apto 2hab en Valencia, $260, con piscina",
                      "Sugiéreme precio para una casa de 4 hab en El Hatillo",
                      "Muéstrame los leads pendientes",
                      "Comparativa de comparables en Maracaibo",
                    ]
                  : SUGGESTIONS
                ).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => sendMessage({ text: s })}
                    className="card p-4 text-left text-sm hover:border-[color:var(--color-brand-300)] transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <Message key={m.id} role={m.role} parts={m.parts as Array<{ type: string;[key: string]: unknown }>} />
          ))}

          {isBusy && (
            <div className="flex items-center gap-2 text-sm text-[color:var(--color-fg-soft)] mt-3 ml-12">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
              <span>Llavero está pensando…</span>
            </div>
          )}

          {voice.listening && (
            <div className="mt-3 ml-12 inline-flex items-center gap-2 text-sm text-[color:var(--color-brand-700)]">
              <span className="size-2 rounded-full bg-[color:var(--color-danger)] animate-pulse" />
              <span>Escuchando… “{voice.interim || "habla"}”</span>
            </div>
          )}

          {error && (
            <div className="mt-4 mx-auto max-w-xl card border-[color:var(--color-danger)]/40 p-4 text-sm text-[color:var(--color-danger)]">
              {error.message || "Hubo un problema. Probá de nuevo."}
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const t = input.trim();
            if (!t || isBusy) return;
            sendMessage({ text: t });
            setInput("");
          }}
          className="border-t bg-white p-3 flex items-center gap-2"
        >
          {voice.supported && (
            <button
              type="button"
              onClick={onMic}
              disabled={isBusy}
              className={`shrink-0 size-10 rounded-full grid place-items-center border transition ${
                voice.listening
                  ? "bg-[color:var(--color-brand-500)] text-white border-[color:var(--color-brand-500)] animate-pulse"
                  : "bg-white text-[color:var(--color-fg)] border-[color:var(--color-border)] hover:border-[color:var(--color-brand-500)] hover:text-[color:var(--color-brand-700)]"
              } disabled:opacity-50`}
              title={voice.listening ? "Detener micrófono" : "Hablar"}
              aria-label={voice.listening ? "Detener micrófono" : "Hablar"}
              aria-pressed={voice.listening}
            >
              {voice.listening ? <IconMicOff size={18} /> : <IconMic size={18} />}
            </button>
          )}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={asesorMode ? "Dime qué inmueble quieres publicar…" : "Cuéntame qué buscas…"}
            className="input flex-1 min-w-0"
            disabled={isBusy}
          />
          <button
            type="submit"
            disabled={isBusy || !input.trim()}
            className="shrink-0 size-10 rounded-full grid place-items-center bg-[color:var(--color-brand-500)] text-white hover:bg-[color:var(--color-brand-600)] disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Enviar"
          >
            <IconSend size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}

function Message({
  role,
  parts,
}: {
  role: string;
  parts: Array<{ type: string;[key: string]: unknown }>;
}) {
  const isUser = role === "user";
  return (
    <div className={`flex gap-3 mb-5 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`shrink-0 size-9 rounded-full flex items-center justify-center text-sm font-semibold ${
          isUser
            ? "bg-[color:var(--color-fg)] text-white"
            : "bg-[color:var(--color-brand-100)] text-[color:var(--color-brand-700)]"
        }`}
      >
        {isUser ? "Tú" : <LlaveLogo className="size-5" />}
      </div>
      <div className={`max-w-[88%] space-y-3 ${isUser ? "items-end" : ""}`}>
        {parts.map((part, idx) => {
          if (part.type === "text") {
            const text = String((part as { text?: string }).text ?? "");
            return (
              <div
                key={idx}
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
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
