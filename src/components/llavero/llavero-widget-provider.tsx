// Contexto del widget flotante de Llavero: mantiene una instancia de useChat viva
// durante toda la sesión para que la conversación persista al navegar entre páginas.
"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ChatHelpers = ReturnType<typeof useChat>;

type LlaveroWidgetContextValue = {
  messages: ChatHelpers["messages"];
  sendMessage: ChatHelpers["sendMessage"];
  status: ChatHelpers["status"];
  error: ChatHelpers["error"];
  open: boolean;
  setOpen: (open: boolean) => void;
  input: string;
  setInput: (value: string) => void;
};

const LlaveroWidgetContext = createContext<LlaveroWidgetContextValue | null>(null);

export function LlaveroWidgetProvider({ children }: { children: ReactNode }) {
  // useChat vive aquí, en el root layout, que no se desmonta entre navegaciones
  // client-side. Por eso la conversación sobrevive al cambiar de página y al
  // cerrar/reabrir el panel.
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");

  const value = useMemo<LlaveroWidgetContextValue>(
    () => ({ messages, sendMessage, status, error, open, setOpen, input, setInput }),
    [messages, sendMessage, status, error, open, input],
  );

  return (
    <LlaveroWidgetContext.Provider value={value}>
      {children}
    </LlaveroWidgetContext.Provider>
  );
}

export function useLlaveroWidget(): LlaveroWidgetContextValue {
  const ctx = useContext(LlaveroWidgetContext);
  if (!ctx) {
    throw new Error("useLlaveroWidget debe usarse dentro de <LlaveroWidgetProvider>");
  }
  return ctx;
}
