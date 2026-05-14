"use client";

/**
 * Botón "Crear publicación" + ventana modal dentro de la página de
 * /asesor/marketing. La modal toma plataforma, copy e inmueble y llama a
 * createPostAction; al publicar cierra y refresca la ruta.
 */

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPostAction } from "@/app/_actions/social";
import {
  IconInstagram,
  IconFacebook,
  IconTikTok,
  IconWhatsapp,
  IconX,
} from "@/components/social-icons";

type Platform = "instagram" | "facebook" | "tiktok" | "whatsapp" | "x";

const PLATFORMS: Array<{
  value: Platform;
  label: string;
  Icon: (props: { size?: number }) => React.JSX.Element;
  tint: string;
}> = [
  { value: "instagram", label: "Instagram", Icon: IconInstagram, tint: "text-[#e1306c]" },
  { value: "facebook", label: "Facebook", Icon: IconFacebook, tint: "text-[#1877f2]" },
  { value: "tiktok", label: "TikTok", Icon: IconTikTok, tint: "text-[#0b1f1c]" },
  { value: "whatsapp", label: "WhatsApp", Icon: IconWhatsapp, tint: "text-[#25d366]" },
  { value: "x", label: "X", Icon: IconX, tint: "text-[#0b1f1c]" },
];

export function CreatePostForm({
  properties,
}: {
  properties: Array<{ id: string; title: string }>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [copy, setCopy] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!copy.trim()) {
      setFeedback("Escribe el texto de la publicación.");
      return;
    }
    const formData = new FormData();
    formData.set("platform", platform);
    formData.set("copy", copy.trim());
    if (propertyId) formData.set("property_id", propertyId);
    setFeedback(null);
    startTransition(async () => {
      const res = await createPostAction(formData);
      if (res.ok) {
        setCopy("");
        setPropertyId("");
        setPlatform("instagram");
        setOpen(false);
        router.refresh();
      } else {
        setFeedback(res.error);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn btn-primary text-sm"
      >
        + Crear publicación
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-lg rounded-[var(--radius-xl)] bg-white shadow-[var(--shadow-pop)] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[color:var(--color-border)]">
              <h2 className="font-display text-lg font-semibold">Crear publicación</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="size-8 rounded-md hover:bg-[color:var(--color-bg)] grid place-items-center text-[color:var(--color-fg-soft)]"
              >
                <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
                  <path d="M6 6l12 12" />
                  <path d="M18 6L6 18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <span className="label">Plataforma</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {PLATFORMS.map(({ value, label, Icon, tint }) => {
                    const active = platform === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setPlatform(value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition ${
                          active
                            ? "border-[color:var(--color-brand-500)] bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)]"
                            : "border-[color:var(--color-border)] text-[color:var(--color-fg-muted)] hover:bg-[color:var(--color-bg)]"
                        }`}
                      >
                        <span className={tint}>
                          <Icon size={14} />
                        </span>
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label htmlFor="post-copy" className="label">Texto</label>
                <textarea
                  id="post-copy"
                  value={copy}
                  onChange={(e) => setCopy(e.target.value)}
                  rows={4}
                  placeholder="Escribe el copy de tu publicación…"
                  className="input mt-1 resize-y"
                />
              </div>

              <div>
                <label htmlFor="post-property" className="label">Inmueble</label>
                <select
                  id="post-property"
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  className="input mt-1"
                >
                  <option value="">Sin inmueble asociado</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              {feedback && (
                <p className="text-xs text-[color:var(--color-danger)]">{feedback}</p>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn btn-ghost text-sm"
                >
                  Cancelar
                </button>
                <button type="submit" disabled={isPending} className="btn btn-primary text-sm">
                  {isPending ? "Publicando…" : "Publicar ahora"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
