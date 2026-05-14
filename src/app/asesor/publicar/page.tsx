// Página de publicación asistida: wizard EXIF/geo arriba, Llavero abajo —
// stack vertical full-width para que ambos se desplieguen bien sin clipping.
import { Suspense } from "react";
import { PublicarWizard } from "@/components/asesor/publicar-wizard";
import { ChatWindow } from "@/components/chat/chat-window";

export const dynamic = "force-dynamic";

export default function PublicarPage() {
  return (
    <div>
      <div className="container-x pt-8 sm:pt-10 pb-4">
        <span className="chip mb-2">Panel asesor · Publicar con IA</span>
        <h1 className="font-display text-2xl sm:text-3xl font-bold">
          Publica un inmueble en 3 pasos
        </h1>
        <p className="text-sm text-[color:var(--color-fg-muted)] mt-1 max-w-2xl">
          Sube las fotos del inmueble, confirma la zona y deja que Llavero redacte título, descripción y precio en base a comparables reales. Llavero aprende con cada publicación.
        </p>
      </div>

      <div className="container-x pb-6">
        <PublicarWizard />
      </div>

      <div className="container-x pb-2">
        <h2 className="font-display text-lg sm:text-xl font-semibold">
          Habla con Llavero
        </h2>
        <p className="text-xs text-[color:var(--color-fg-muted)] mt-1">
          Cuéntale precio, ambientes y notas adicionales. Llavero puede llamar a{" "}
          <code className="text-[10px] bg-[color:var(--color-bg)] px-1 py-0.5 rounded">
            suggestPrice
          </code>{" "}
          y{" "}
          <code className="text-[10px] bg-[color:var(--color-bg)] px-1 py-0.5 rounded">
            createPropertyDraft
          </code>{" "}
          directo.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="container-x py-10 text-sm text-[color:var(--color-fg-muted)]">
            Cargando…
          </div>
        }
      >
        <ChatWindow
          asesorMode
          heightClass="h-[72dvh] max-h-[780px] min-h-[520px]"
        />
      </Suspense>
    </div>
  );
}
