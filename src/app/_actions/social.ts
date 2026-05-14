"use server";

/**
 * Server actions del feed social del asesor: crear publicación y responder
 * comentarios. Escriben al store en memoria de social-feed.ts y revalidan
 * /asesor/marketing para reflejar los cambios al instante.
 */

import { revalidatePath } from "next/cache";
import { createPost, replyToComment, type SocialPost } from "@/lib/db/social-feed";
import { DEMO_PROPERTIES } from "@/lib/db/seed-data";

const VALID_PLATFORMS: SocialPost["platform"][] = [
  "instagram",
  "facebook",
  "tiktok",
  "whatsapp",
  "x",
];

export async function createPostAction(
  formData: FormData
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const platform = String(formData.get("platform") ?? "") as SocialPost["platform"];
  const copy = String(formData.get("copy") ?? "").trim();
  const propertyId = String(formData.get("property_id") ?? "").trim();

  if (!VALID_PLATFORMS.includes(platform)) {
    return { ok: false, error: "Plataforma no soportada." };
  }
  if (!copy) return { ok: false, error: "Escribe el texto de la publicación." };

  const property = propertyId
    ? DEMO_PROPERTIES.find((p) => p.id === propertyId)
    : undefined;

  const post = createPost({
    platform,
    copy,
    property_id: property?.id,
    property_title: property?.title.replace(/^Llave:\s*/, ""),
  });

  revalidatePath("/asesor/marketing");
  return { ok: true, id: post.id };
}

export async function replyCommentAction(
  commentId: string,
  body: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const text = body.trim();
  if (!commentId) return { ok: false, error: "Falta el comentario." };
  if (!text) return { ok: false, error: "La respuesta está vacía." };

  const reply = replyToComment(commentId, text);
  if (!reply) return { ok: false, error: "No se pudo responder el comentario." };

  revalidatePath("/asesor/marketing");
  return { ok: true };
}
