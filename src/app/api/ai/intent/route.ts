import { NextResponse } from "next/server";
import { z } from "zod";
import { OpenAiIntentProvider } from "@/modules/ai/openai-provider";
import {
  AnthropicIntentProvider,
  DEFAULT_CLAUDE_MODEL,
} from "@/modules/ai/anthropic-provider";
import {
  GeminiIntentProvider,
  DEFAULT_GEMINI_MODEL,
} from "@/modules/ai/gemini-provider";
import { ProviderError } from "@/modules/ai/contracts";
import {
  createLimiter,
  limitedResponse,
  providerName,
  readGuardedJson,
  statusResponse,
} from "@/modules/ai/guard";
export const runtime = "nodejs";
const inputSchema = z
  .object({ text: z.string().trim().min(5).max(1500) })
  .strict();
const limiter = createLimiter(10, 2);
function provider() {
  const name = providerName();
  if (name === "openai")
    return new OpenAiIntentProvider(
      process.env.OPENAI_API_KEY!,
      process.env.OPENAI_MODEL!,
    );
  if (name === "anthropic")
    return new AnthropicIntentProvider(
      process.env.ANTHROPIC_API_KEY!,
      process.env.ANTHROPIC_MODEL || DEFAULT_CLAUDE_MODEL,
    );
  return new GeminiIntentProvider(
    process.env.GEMINI_API_KEY!,
    process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL,
  );
}
export async function GET(request: Request) {
  return statusResponse(request);
}
export async function POST(request: Request) {
  const guarded = await readGuardedJson(request, 8000);
  if ("response" in guarded) return guarded.response;
  const parsed = inputSchema.safeParse(guarded.json);
  if (!parsed.success)
    return NextResponse.json(
      { error: "Escribe una consulta de entre 5 y 1500 caracteres." },
      { status: 400 },
    );
  const release = limiter.take();
  if (!release) return limitedResponse();
  try {
    const intent = await provider().interpret(parsed.data.text);
    return NextResponse.json(
      { intent, mode: "ai" },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof ProviderError
            ? error.userMessage
            : "No pudimos interpretar la consulta. Reintenta o utiliza la búsqueda manual.",
      },
      { status: 502 },
    );
  } finally {
    release();
  }
}
