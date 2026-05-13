import { streamText, convertToModelMessages, stepCountIs, type UIMessage } from "ai";
import { SYSTEM_PROMPT } from "@/lib/ai/system-prompt";
import { llaveroTools } from "@/lib/ai/tools";

export const maxDuration = 60;
export const runtime = "nodejs";

const MODEL_ID = process.env.LLAVE_MODEL_ID ?? "anthropic/claude-sonnet-4-6";

const MAX_BODY_BYTES = 256 * 1024;
const MAX_MESSAGES = 60;

export async function POST(req: Request) {
  if (!process.env.AI_GATEWAY_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({
        error:
          "Falta credencial de IA. Seteá AI_GATEWAY_API_KEY (recomendado) o ANTHROPIC_API_KEY en .env.local.",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  const lenHeader = req.headers.get("content-length");
  if (lenHeader && Number(lenHeader) > MAX_BODY_BYTES) {
    return new Response(JSON.stringify({ error: "Payload demasiado grande" }), {
      status: 413,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "JSON inválido" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const messages = (body as { messages?: UIMessage[] } | null)?.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(
      JSON.stringify({ error: "Faltan messages en el cuerpo" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  if (messages.length > MAX_MESSAGES) {
    return new Response(
      JSON.stringify({ error: `Demasiados mensajes (>${MAX_MESSAGES})` }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const modelMessages = await convertToModelMessages(messages);
  const result = streamText({
    model: MODEL_ID,
    system: SYSTEM_PROMPT,
    messages: modelMessages,
    tools: llaveroTools,
    stopWhen: stepCountIs(8),
    temperature: 0.5,
  });

  return result.toUIMessageStreamResponse();
}
