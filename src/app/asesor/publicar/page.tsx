import { Suspense } from "react";
import { ChatWindow } from "@/components/chat/chat-window";

export const dynamic = "force-dynamic";

export default function PublicarPage() {
  return (
    <div>
      <div className="container-x pt-10 pb-2">
        <h1 className="font-display text-3xl font-bold">Publicar con IA</h1>
        <p className="text-[color:var(--color-fg-muted)] mt-1">
          Decile a Llavero los datos del inmueble, te redacta el título, descripción y precio sugerido.
        </p>
      </div>
      <Suspense fallback={<div className="container-x py-10">Cargando…</div>}>
        <ChatWindow asesorMode />
      </Suspense>
    </div>
  );
}
