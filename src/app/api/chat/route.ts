import { streamText, convertToModelMessages, stepCountIs, type UIMessage } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { SYSTEM_PROMPT } from "@/lib/ai/system-prompt";
import { llaveroTools } from "@/lib/ai/tools";
import { makeLocalMockModel } from "@/lib/ai/local-mock-model";

export const maxDuration = 60;
export const runtime = "nodejs";

// Direct Anthropic model id (used when ANTHROPIC_API_KEY is set)
const DIRECT_MODEL_ID = process.env.LLAVE_MODEL_ID ?? "claude-sonnet-4-5";
// AI Gateway model string (used when only AI_GATEWAY_API_KEY is set)
const GATEWAY_MODEL_ID =
  process.env.LLAVE_GATEWAY_MODEL_ID ?? "anthropic/claude-sonnet-4-5";
const FORCE_OFFLINE = process.env.LLAVE_OFFLINE === "1";

const MAX_BODY_BYTES = 256 * 1024;
const MAX_MESSAGES = 60;

export async function POST(req: Request) {
  const hasAnthropic = Boolean(process.env.ANTHROPIC_API_KEY);
  const hasGateway = Boolean(process.env.AI_GATEWAY_API_KEY);
  const useOffline = FORCE_OFFLINE || (!hasAnthropic && !hasGateway);

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

  // Prefer direct Anthropic when ANTHROPIC_API_KEY is set; fall back to
  // AI Gateway string routing; fall back to local mock for offline demo.
  const model = useOffline
    ? makeLocalMockModel(modelMessages)
    : hasAnthropic
      ? anthropic(DIRECT_MODEL_ID)
      : GATEWAY_MODEL_ID;

  const result = streamText({
    model,
    system: SYSTEM_PROMPT,
    messages: modelMessages,
    tools: llaveroTools,
    stopWhen: stepCountIs(useOffline ? 2 : 8),
    temperature: 0.5,
  });

  return result.toUIMessageStreamResponse();
}
