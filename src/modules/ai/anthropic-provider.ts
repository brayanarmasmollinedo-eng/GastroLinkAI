import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import {
  INTENT_INSTRUCTIONS,
  ProviderError,
  intentSchema,
  type IntentProvider,
} from "./contracts";
export const DEFAULT_CLAUDE_MODEL = "claude-opus-5-5";
type Messages = Pick<Anthropic["messages"], "create">;
function failure(error: unknown) {
  if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError)
    return new ProviderError(
      "AUTH",
      "Claude rechazó la clave (ANTHROPIC_API_KEY). Revisa que sea válida y esté activa.",
    );
  if (error instanceof Anthropic.NotFoundError)
    return new ProviderError(
      "MODEL",
      "Claude no encontró el modelo (ANTHROPIC_MODEL). Ejemplos válidos: claude-opus-5-5, claude-sonnet-5-5, claude-haiku-5-5.",
    );
  if (error instanceof Anthropic.RateLimitError)
    return new ProviderError(
      "QUOTA",
      "Claude indica límite de uso o saldo agotado. Revisa tu plan en console.anthropic.com e inténtalo más tarde.",
    );
  if (error instanceof Anthropic.BadRequestError)
    return new ProviderError(
      "MODEL",
      "Claude rechazó la petición. Revisa ANTHROPIC_MODEL y que tu cuenta tenga créditos.",
    );
  return new ProviderError(
    "UNAVAILABLE",
    "No se pudo conectar con Claude. Comprueba tu conexión e inténtalo de nuevo.",
  );
}
export class AnthropicIntentProvider implements IntentProvider {
  private messages: Messages;
  constructor(
    key: string,
    private model: string = DEFAULT_CLAUDE_MODEL,
    messages?: Messages,
  ) {
    this.messages =
      messages ??
      new Anthropic({ apiKey: key, timeout: 25000, maxRetries: 1 }).messages;
  }
  async interpret(text: string) {
    let response;
    try {
      response = await this.messages.create({
        model: this.model,
        max_tokens: 4000,
        system: INTENT_INSTRUCTIONS,
        output_config: {
          effort: "low",
          format: zodOutputFormat(intentSchema),
        },
        messages: [{ role: "user", content: text }],
      });
    } catch (error) {
      throw failure(error);
    }
    if (response.stop_reason === "refusal")
      throw new ProviderError(
        "INVALID",
        "Claude no pudo atender esta consulta. Reformúlala como una compra de ingredientes.",
      );
    if (response.stop_reason === "max_tokens")
      throw new ProviderError(
        "INVALID",
        "La respuesta quedó incompleta. Reintenta con una consulta más breve.",
      );
    const raw = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");
    try {
      return intentSchema.parse(JSON.parse(raw));
    } catch {
      throw new ProviderError(
        "INVALID",
        "Claude devolvió un formato inesperado. Reintenta la consulta.",
      );
    }
  }
}
