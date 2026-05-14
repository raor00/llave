"use client";

/**
 * Formulario para crear una publicación en redes desde /asesor/marketing.
 * Selecciona plataforma (con su icono), escribe el copy y elige un inmueble
 * de la cartera. Llama a createPostAction y refresca la ruta al publicar.
 */

import { useState, useTransition } from "react";
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
  const [isPending, startTransition] = useTransition();
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [copy, setCopy] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

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
        setFeedback("Publicación creada.");
        router.refresh();
      } else {
        setFeedback(res.error);
      }
    });
  }

  return (
    <div className="card p-5 sm:p-6">
      <h2 className="font-display text-lg font-semibold mb-3">Crear publicación</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <label htmlFor="post-copy" className="label">
            Texto
          </label>
          <textarea
            id="post-copy"
            value={copy}
            onChange={(e) => setCopy(e.target.value)}
            rows={3}
            placeholder="Escribe el copy de tu publicación…"
            className="input mt-1 resize-y"
          />
        </div>

        <div>
          <label htmlFor="post-property" className="label">
            Inmueble
          </label>
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

        <div className="flex items-center gap-3">
          <button type="submit" disabled={isPending} className="btn btn-primary text-sm">
            {isPending ? "Publicando…" : "Publicar ahora"}
          </button>
          {feedback && (
            <span className="text-xs text-[color:var(--color-fg-muted)]">{feedback}</span>
          )}
        </div>
      </form>
    </div>
  );
}
