import { MockLanguageModelV3, simulateReadableStream } from "ai/test";
import type { ModelMessage } from "ai";

// Heuristic intent parser for offline / no-key local demo.
// Inspects the latest user message + chat history, decides which Llavero tool
// to invoke, then returns a MockLanguageModelV3 that emits:
//   1. a short intro text-delta in Llavero voice
//   2. the corresponding tool-call (which `streamText` executes against the
//      real tool implementation — real data from seed/Supabase)
//   3. a closing text-delta riffing on the result
//
// Result: the chat UI behaves exactly like the live agent, no LLM round-trips.

const CITIES = [
  "Caracas", "Valencia", "Maracaibo", "Barquisimeto", "Mérida", "Lechería",
  "El Hatillo", "Chacao", "San Antonio", "Altamira", "Las Mercedes", "Catia",
  "Sabana Grande", "La Castellana", "La California",
];

const TYPES: Array<{ keys: RegExp; value: "apartamento" | "casa" | "local" | "habitacion" }> = [
  { keys: /\b(apto|apartamento|departamento|depa)\b/i, value: "apartamento" },
  { keys: /\b(casa|quinta)\b/i, value: "casa" },
  { keys: /\b(local|comercial|tienda|boutique)\b/i, value: "local" },
  { keys: /\b(habitaci[oó]n|cuarto|pieza)\b/i, value: "habitacion" },
];

const AMENITY_KEYWORDS = [
  "planta", "agua", "piscina", "gimnasio", "balc", "wifi", "seguridad",
  "ascensor", "amobl", "jard", "garage", "estaciona", "vista", "terraza",
  "metro", "aire", "parrillera", "amobl",
];

type Intent =
  | { tool: "searchProperties"; args: Record<string, unknown>; intro: string; closer: string }
  | { tool: "recommendByProfile"; args: Record<string, unknown>; intro: string; closer: string }
  | { tool: "compareProperties"; args: Record<string, unknown>; intro: string; closer: string }
  | { tool: "getPropertyDetail"; args: Record<string, unknown>; intro: string; closer: string }
  | { tool: "scheduleVisit"; args: Record<string, unknown>; intro: string; closer: string }
  | { tool: "createPropertyDraft"; args: Record<string, unknown>; intro: string; closer: string }
  | { tool: "suggestPrice"; args: Record<string, unknown>; intro: string; closer: string }
  | { tool: null; text: string };

function lastUser(messages: ModelMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role === "user") {
      const content = m.content;
      if (typeof content === "string") return content;
      if (Array.isArray(content)) {
        return content
          .map((p) =>
            typeof p === "string"
              ? p
              : "text" in p && typeof p.text === "string"
                ? p.text
                : ""
          )
          .join(" ");
      }
    }
  }
  return "";
}

export function extractEntities(text: string) {
  const t = text.toLowerCase();

  // city
  const city = CITIES.find((c) => t.includes(c.toLowerCase()));

  // type
  const type = TYPES.find((t2) => t2.keys.test(text))?.value;

  // rooms
  const roomsMatch = text.match(/(\d+)\s*(amb|hab|cuarto|dormit|rec[aá]m)/i);
  const rooms_min = roomsMatch ? Number(roomsMatch[1]) : undefined;

  // price — patterns like "$300", "300$", "máximo 250", "hasta 400"
  let price_max: number | undefined;
  const moneyMatch = text.match(
    /(?:m[áa]ximo|hasta|menos de|por debajo de|debajo de|tope)\s*\$?\s*(\d{2,5})/i
  );
  if (moneyMatch) price_max = Number(moneyMatch[1]);
  if (price_max === undefined) {
    const dollarMatch = text.match(/\$\s*(\d{2,5})/);
    if (dollarMatch) price_max = Number(dollarMatch[1]);
  }
  if (price_max === undefined) {
    const bareMatch = text.match(/\b(\d{2,5})\s*(?:usd|dolar|d[oó]lar|\/mes|por mes)\b/i);
    if (bareMatch) price_max = Number(bareMatch[1]);
  }

  // amenities
  const amenities = AMENITY_KEYWORDS.filter((k) => t.includes(k));

  // explicit property id (uuid)
  const idMatch = text.match(
    /\b([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\b/i
  );
  const property_id = idMatch?.[1];

  return { city, type, rooms_min, price_max, amenities, property_id };
}

export function detectIntent(text: string, history: ModelMessage[] = []): Intent {
  const t = text.toLowerCase().trim();
  if (!t) {
    return {
      tool: null,
      text:
        "¡Hola! Soy Llavero. Contame qué inmueble buscás (ciudad, presupuesto, ambientes) y te muestro opciones reales.",
    };
  }

  const ents = extractEntities(text);

  // Comparison
  if (/\bcompara(r|me|m[ée])?\b|\bcomparativa\b|\bvs\b|\bversus\b/i.test(t)) {
    const ids = collectRecentPropertyIds(history);
    if (ids.length >= 2) {
      return {
        tool: "compareProperties",
        args: { property_ids: ids.slice(0, 4) },
        intro: "Te armo la comparativa lado a lado.",
        closer: "Mirá la tabla: los chips marcan el más barato y el más amplio. ¿Cuál te late?",
      };
    }
    // Fall through to search if no ids yet
  }

  // Schedule visit
  if (/\bagend(a|ar|ame|emos)\b|\bvisitar?\b|\bquiero visitar\b/i.test(t)) {
    const nameMatch = text.match(/\bsoy\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)/i);
    const phoneMatch = text.match(/(\+?\d[\d\s-]{7,15})/);
    const idForVisit = ents.property_id ?? collectRecentPropertyIds(history)[0];
    if (idForVisit && nameMatch && phoneMatch) {
      return {
        tool: "scheduleVisit",
        args: {
          property_id: idForVisit,
          inquilino_name: nameMatch[1],
          inquilino_phone: phoneMatch[1],
        },
        intro: "Listo, agendo la visita.",
        closer: "Un asesor te confirma por teléfono. Mientras, podés seguir explorando otros.",
      };
    }
    return {
      tool: null,
      text:
        "Dale, agendamos. Pasame: tu nombre, un teléfono o email para que el asesor te confirme, y el inmueble (id o nombre). Si no te sentís de agendar todavía, podemos hablar primero del lugar.",
    };
  }

  // Asesor: suggest price
  if (/\bsugerime\s+precio\b|\bsugerencia de precio\b|\bcomparables\b|\bcu[áa]nto cobrar\b/i.test(t)) {
    return {
      tool: "suggestPrice",
      args: {
        city: ents.city ?? "Caracas",
        type: ents.type ?? "apartamento",
        rooms: ents.rooms_min,
      },
      intro: "Te traigo el rango de mercado.",
      closer: "Mediana y rango basados en comparables reales del marketplace.",
    };
  }

  // Asesor: publish draft
  if (/\bpublic(a|ar|amos)\b|\bcargar inmueble\b|\bcrear publicaci[oó]n\b|\bborrador\b/i.test(t)) {
    return {
      tool: "createPropertyDraft",
      args: {
        raw_notes: text,
        type: ents.type ?? "apartamento",
        city: ents.city ?? "Caracas",
        state: stateFromCity(ents.city),
        address: "(actualizar)",
        price_usd: ents.price_max ?? 280,
        rooms: ents.rooms_min ?? 2,
        bathrooms: ents.rooms_min ? Math.max(1, ents.rooms_min - 1) : 1,
        amenities: ents.amenities,
      },
      intro: "Voy a redactar el borrador con esos datos.",
      closer: "Listo, ya quedó publicado en estado disponible. Después podés editarlo desde tu panel.",
    };
  }

  // Detail
  if (/\b(detalle|info|m[áa]s sobre|inform[aá]ci[oó]n)\b/i.test(t) && ents.property_id) {
    return {
      tool: "getPropertyDetail",
      args: { property_id: ents.property_id },
      intro: "Te traigo los detalles de ese inmueble.",
      closer: "Si te interesa, podemos agendar visita ahí mismo.",
    };
  }

  // Recommendation: explicit lifestyle / "soy estudiante" / "vivo solo" cues
  if (/\b(recomienda|sugerime|que me recomendas|recomendaci[oó]n|para m[íi])\b/i.test(t)
      || /\bsoy (estudiante|profesional|m[eé]dic|abogad|familia|pareja|joven|m[áa]m[áa]|pap[áa])\b/i.test(t)) {
    return {
      tool: "recommendByProfile",
      args: {
        budget_usd: ents.price_max ?? 300,
        city: ents.city ?? "Caracas",
        lifestyle: text.slice(0, 200),
        needs: ents.amenities,
        rooms_min: ents.rooms_min,
      },
      intro: "Te armo recomendaciones según tu perfil.",
      closer: "Cada match tiene su razón. La que más te haga ruido la profundizamos.",
    };
  }

  // Default: search
  const args: Record<string, unknown> = { limit: 6 };
  if (ents.city) args.city = ents.city;
  if (ents.type) args.type = ents.type;
  if (ents.price_max !== undefined) args.price_max = ents.price_max;
  if (ents.rooms_min !== undefined) args.rooms_min = ents.rooms_min;
  if (ents.amenities.length) args.amenities = ents.amenities;
  // free-text fallback for things we didn't parse
  args.query = text.length < 120 ? text : undefined;

  const filterDescription = describeFilters(ents);
  return {
    tool: "searchProperties",
    args,
    intro: `Busco en la base ${filterDescription}.`,
    closer:
      "Estos son los disponibles bajo el modelo Llave (sin meses adelantados). ¿Querés más detalle de alguno o agendamos visita?",
  };
}

function describeFilters(ents: ReturnType<typeof extractEntities>): string {
  const bits: string[] = [];
  if (ents.city) bits.push(`en ${ents.city}`);
  if (ents.type) bits.push(`tipo ${ents.type}`);
  if (ents.rooms_min) bits.push(`${ents.rooms_min}+ habitaciones`);
  if (ents.price_max) bits.push(`hasta $${ents.price_max}`);
  if (ents.amenities.length) bits.push(`con ${ents.amenities.slice(0, 3).join(", ")}`);
  return bits.length ? bits.join(", ") : "lo que tenemos disponible";
}

function stateFromCity(city?: string): string {
  if (!city) return "Distrito Capital";
  const map: Record<string, string> = {
    Caracas: "Distrito Capital",
    Chacao: "Distrito Capital",
    "El Hatillo": "Miranda",
    Valencia: "Carabobo",
    Maracaibo: "Zulia",
    Barquisimeto: "Lara",
    Mérida: "Mérida",
    Lechería: "Anzoátegui",
    "San Antonio": "Miranda",
  };
  return map[city] ?? "Distrito Capital";
}

function collectRecentPropertyIds(history: ModelMessage[]): string[] {
  const ids: string[] = [];
  // Look back through history for any tool-result whose output contained property ids
  const uuidRe = /\b([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\b/gi;
  for (let i = history.length - 1; i >= 0 && ids.length < 4; i--) {
    const m = history[i];
    if (m.role !== "assistant" && m.role !== "tool") continue;
    const raw = JSON.stringify(m.content);
    let match;
    while ((match = uuidRe.exec(raw)) !== null) {
      if (!ids.includes(match[1])) ids.push(match[1]);
      if (ids.length >= 4) break;
    }
  }
  return ids;
}

export function makeLocalMockModel(messages: ModelMessage[]) {
  const userText = lastUser(messages);
  const intent = detectIntent(userText, messages);

  return new MockLanguageModelV3({
    doStream: async () => {
      // Stream parts shape varies between AI SDK V2/V3 model interfaces.
      // Build untyped chunks and let simulateReadableStream forward them.
      const chunks: Array<Record<string, unknown>> = [];

      chunks.push({ type: "stream-start", warnings: [] });
      chunks.push({
        type: "response-metadata",
        id: "local-mock",
        modelId: "llave-local",
        timestamp: new Date(),
      });

      const introId = "intro";
      const introText = "tool" in intent && intent.tool ? intent.intro : (intent as { text: string }).text;
      chunks.push({ type: "text-start", id: introId });
      for (const piece of chunkText(introText)) {
        chunks.push({ type: "text-delta", id: introId, delta: piece });
      }
      chunks.push({ type: "text-end", id: introId });

      if ("tool" in intent && intent.tool) {
        chunks.push({
          type: "tool-call",
          toolCallId: `call_${Math.random().toString(36).slice(2, 10)}`,
          toolName: intent.tool,
          input: JSON.stringify(intent.args),
        });
      }

      chunks.push({
        type: "finish",
        finishReason: "stop",
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      });

      return {
        stream: simulateReadableStream({
          initialDelayInMs: 50,
          chunkDelayInMs: 35,
          chunks,
        }),
      } as never;
    },
  });
}

function chunkText(s: string, size = 6): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < s.length) {
    out.push(s.slice(i, i + size));
    i += size;
  }
  return out;
}
