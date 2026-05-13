import { streamText, convertToModelMessages, stepCountIs, type UIMessage } from "ai";
import { SYSTEM_PROMPT } from "@/lib/ai/system-prompt";
import { llaveroTools } from "@/lib/ai/tools";

export const maxDuration = 60;
export const runtime = "nodejs";

const MODEL_ID = process.env.LLAVE_MODEL_ID ?? "anthropic/claude-sonnet-4-6";

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

  const { messages }: { messages: UIMessage[] } = await req.json();

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
