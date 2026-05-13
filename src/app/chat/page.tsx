import { Suspense } from "react";
import { ChatWindow } from "@/components/chat/chat-window";

export const dynamic = "force-dynamic";

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="container-x py-10">Cargando…</div>}>
      <ChatWindow />
    </Suspense>
  );
}
