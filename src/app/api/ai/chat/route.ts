import { NextResponse } from "next/server";
import { ProviderError } from "@/modules/ai/contracts";
import { chatInputSchema } from "@/modules/ai/assistant";
import { GeminiChat } from "@/modules/ai/gemini-chat";
import { DEFAULT_GEMINI_MODEL } from "@/modules/ai/gemini-provider";
import {
  createLimiter,
  limitedResponse,
  providerName,
  readGuardedJson,
  statusResponse,
} from "@/modules/ai/guard";
export const runtime = "nodejs";
const limiter = createLimiter(20, 2);
export async function GET(request: Request) {
  return statusResponse(request);
}
export async function POST(request: Request) {
  const guarded = await readGuardedJson(request, 60000);
  if ("response" in guarded) return guarded.response;
  if (providerName() !== "gemini")
    return NextResponse.json(
      {
        error:
          "El chat conversacional solo está disponible con Gemini (AI_PROVIDER=gemini).",
      },
      { status: 501 },
    );
  const parsed = chatInputSchema.safeParse(guarded.json);
  if (!parsed.success)
    return NextResponse.json(
      { error: "Mensaje no válido. Escribe entre 1 y 1500 caracteres." },
      { status: 400 },
    );
  const release = limiter.take();
  if (!release) return limitedResponse();
  try {
    const reply = await new GeminiChat(
      process.env.GEMINI_API_KEY!,
      process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL,
    ).reply(parsed.data);
    return NextResponse.json(
      { reply },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof ProviderError
            ? error.userMessage
            : "No pudimos responder. Inténtalo de nuevo.",
      },
      { status: 502 },
    );
  } finally {
    release();
  }
}
