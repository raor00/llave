"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const TOUR_EXTENSIONS = new Set(["glb", "gltf", "usdz", "ply", "splat"]);
const MAX_TOUR_BYTES = 250 * 1024 * 1024;

export function classifyTourFileName(name: string): "tour" | "splat" | null {
  const ext = name.toLowerCase().split(".").pop() ?? "";
  if (!TOUR_EXTENSIONS.has(ext)) return null;
  return ext === "splat" ? "splat" : "tour";
}

export async function uploadTourFile(args: {
  file: File;
  propertyId?: string;
}): Promise<{ url: string; kind: "tour" | "splat" }> {
  const kind = classifyTourFileName(args.file.name);
  if (!kind) {
    throw new Error("El archivo debe ser .glb, .gltf, .usdz, .ply o .splat.");
  }
  if (args.file.size > MAX_TOUR_BYTES) {
    throw new Error("El tour pesa más de 250 MB. Exportá una versión web más liviana.");
  }

  const supa = createSupabaseBrowserClient();
  if (!supa) {
    throw new Error("Supabase no está configurado; por ahora pegá una URL pública del tour.");
  }

  const ext = args.file.name.toLowerCase().split(".").pop();
  const scope = args.propertyId ? `properties/${args.propertyId}` : "drafts";
  const path = `tours/${scope}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supa.storage.from("properties").upload(path, args.file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: args.file.type || contentTypeForExtension(ext ?? ""),
  });
  if (error) throw error;

  const { data } = supa.storage.from("properties").getPublicUrl(path);
  return { url: data.publicUrl, kind };
}

function contentTypeForExtension(ext: string) {
  switch (ext) {
    case "glb":
      return "model/gltf-binary";
    case "gltf":
      return "model/gltf+json";
    case "usdz":
      return "model/vnd.usdz+zip";
    case "ply":
      return "application/octet-stream";
    case "splat":
      return "application/octet-stream";
    default:
      return "application/octet-stream";
  }
}
