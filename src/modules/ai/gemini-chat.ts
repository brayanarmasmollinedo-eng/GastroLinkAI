import { ProviderError } from "./contracts";
import { DEFAULT_GEMINI_MODEL } from "./gemini-provider";
import { systemPrompt, type ChatInput } from "./assistant";
function failure(status: number) {
  if (status === 400 || status === 401 || status === 403)
    return new ProviderError(
      "AUTH",
      "Gemini rechazó la petición. Revisa que GEMINI_API_KEY sea válida (https://aistudio.google.com/apikey).",
    );
  if (status === 404)
    return new ProviderError(
      "MODEL",
      "Gemini no encontró el modelo (GEMINI_MODEL). Mira los nombres vigentes en https://ai.google.dev/gemini-api/docs/models.",
    );
  if (status === 429)
    return new ProviderError(
      "QUOTA",
      "Se alcanzó el límite gratuito de Gemini. Espera un minuto o inténtalo mañana.",
    );
  return new ProviderError(
    "UNAVAILABLE",
    "Gemini no respondió. Reintenta en unos segundos.",
  );
}
export class GeminiChat {
  constructor(
    private key: string,
    private model: string = DEFAULT_GEMINI_MODEL,
    private request: typeof fetch = fetch,
  ) {}
  async reply(input: ChatInput): Promise<string> {
    let response: Response;
    try {
      response = await this.request(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.model)}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": this.key,
          },
          signal: AbortSignal.timeout(30000),
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemPrompt(input.catalog) }],
            },
            contents: input.messages.map((m) => ({
              role: m.role === "user" ? "user" : "model",
              parts: [{ text: m.text }],
            })),
            generationConfig: { maxOutputTokens: 2048, temperature: 0.6 },
          }),
        },
      );
    } catch {
      throw new ProviderError(
        "UNAVAILABLE",
        "No se pudo conectar con Gemini. Comprueba tu conexión a internet.",
      );
    }
    if (!response.ok) throw failure(response.status);
    const payload = await response.json().catch(() => null);
    if (payload?.promptFeedback?.blockReason)
      throw new ProviderError(
        "INVALID",
        "No puedo responder a eso. Prueba con otra pregunta.",
      );
    const candidate = payload?.candidates?.[0];
    const text = (candidate?.content?.parts ?? [])
      .map((part: { text?: string }) => part.text ?? "")
      .join("")
      .trim();
    if (!text)
      throw new ProviderError(
        "INVALID",
        "Gemini no devolvió respuesta. Reformula la pregunta e inténtalo otra vez.",
      );
    return candidate?.finishReason === "MAX_TOKENS"
      ? text + " …(respuesta recortada; pide que continúe si necesitas más)"
      : text;
  }
}
