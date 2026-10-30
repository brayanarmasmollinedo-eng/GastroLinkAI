import {
  INTENT_INSTRUCTIONS,
  ProviderError,
  intentSchema,
  type IntentProvider,
} from "./contracts";
export const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash-lite";
const FIELDS =
  ' Responde solo con JSON con estas claves: product (string), quantity (número o null), unit ("kg"|"g"|"t"|"cajas"|"unidades"|null), city (string o null), country (string o null), requiredDate (YYYY-MM-DD o null), presentation (string o null), questions (array de strings).';
const nullable = (type: string) => ({ type, nullable: true });
const responseSchema = {
  type: "OBJECT",
  properties: {
    product: { type: "STRING" },
    quantity: nullable("NUMBER"),
    unit: {
      type: "STRING",
      nullable: true,
      enum: ["kg", "g", "t", "cajas", "unidades"],
    },
    city: nullable("STRING"),
    country: nullable("STRING"),
    requiredDate: nullable("STRING"),
    presentation: nullable("STRING"),
    questions: { type: "ARRAY", items: { type: "STRING" } },
  },
  required: [
    "product",
    "quantity",
    "unit",
    "city",
    "country",
    "requiredDate",
    "presentation",
    "questions",
  ],
};
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
export class GeminiIntentProvider implements IntentProvider {
  constructor(
    private key: string,
    private model: string = DEFAULT_GEMINI_MODEL,
    private request: typeof fetch = fetch,
  ) {}
  private async call(text: string, withSchema: boolean) {
    try {
      return await this.request(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.model)}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": this.key,
          },
          signal: AbortSignal.timeout(25000),
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: INTENT_INSTRUCTIONS + FIELDS }],
            },
            contents: [{ role: "user", parts: [{ text }] }],
            generationConfig: {
              responseMimeType: "application/json",
              maxOutputTokens: 2000,
              ...(withSchema ? { responseSchema } : {}),
            },
          }),
        },
      );
    } catch {
      throw new ProviderError(
        "UNAVAILABLE",
        "No se pudo conectar con Gemini. Comprueba tu conexión a internet.",
      );
    }
  }
  async interpret(text: string) {
    let response = await this.call(text, true);
    // Si el esquema es rechazado (400), reintenta solo con modo JSON.
    if (response.status === 400) response = await this.call(text, false);
    if (!response.ok) throw failure(response.status);
    const payload = await response.json().catch(() => null);
    if (payload?.promptFeedback?.blockReason)
      throw new ProviderError(
        "INVALID",
        "Gemini no pudo atender esta consulta. Reformúlala como una compra de ingredientes.",
      );
    const candidate = payload?.candidates?.[0];
    if (candidate?.finishReason === "MAX_TOKENS")
      throw new ProviderError(
        "INVALID",
        "La respuesta quedó incompleta. Reintenta con una consulta más breve.",
      );
    const raw = (candidate?.content?.parts ?? [])
      .map((part: { text?: string }) => part.text ?? "")
      .join("");
    try {
      return intentSchema.parse(JSON.parse(raw));
    } catch {
      throw new ProviderError(
        "INVALID",
        "Gemini devolvió un formato inesperado. Reintenta la consulta.",
      );
    }
  }
}
