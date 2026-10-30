import { NextResponse } from "next/server";
const LOCAL_HOSTS = ["127.0.0.1", "localhost", "[::1]"];
// Acepta 127.0.0.1 y localhost (mismo puerto que APP_ORIGIN); rechaza todo lo demás.
/** Enlaces compartidos (Dev Tunnels, proxies): reescriben Origin, pero añaden x-forwarded-host. */
function publicOrigin(request: Request) {
  const host = request.headers.get("x-forwarded-host")?.split(",")[0].trim();
  // Next.js también rellena x-forwarded-host con el host local: eso no es un enlace público.
  if (!host || LOCAL_HOSTS.includes(host.replace(/:\d+$/, ""))) return null;
  const proto = request.headers.get("x-forwarded-proto") === "http" ? "http" : "https";
  return `${proto}://${host}`;
}
function allowedOrigins() {
  return (process.env.AI_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
}
/** Quien entra por un enlace público solo usa la IA si ese enlace está autorizado en AI_ALLOWED_ORIGINS. */
export function publicAccessBlocked(request: Request) {
  const origin = publicOrigin(request);
  return origin !== null && !allowedOrigins().includes(origin);
}
export function localRequest(request: Request) {
  if (publicOrigin(request)) return !publicAccessBlocked(request);
  const expected = new URL(process.env.APP_ORIGIN ?? "http://127.0.0.1:3100");
  // Next puede normalizar request.url a otro host local; se valida la cabecera Origin.
  const origin = request.headers.get("origin");
  if (!origin) return false;
  let from: URL;
  try {
    from = new URL(origin);
  } catch {
    return false;
  }
  return (
    LOCAL_HOSTS.includes(from.hostname) &&
    from.protocol === expected.protocol &&
    from.port === expected.port
  );
}
// Gemini (nivel gratuito) es el proveedor por defecto.
// AI_PROVIDER=openai | anthropic para cambiarlo.
export function providerName() {
  const name = process.env.AI_PROVIDER;
  return name === "openai" || name === "anthropic" ? name : "gemini";
}
export function missingSettings() {
  const missing: string[] = [];
  if (process.env.AI_ENABLED !== "true") missing.push("AI_ENABLED=true");
  const name = providerName();
  if (name === "openai") {
    if (!process.env.OPENAI_API_KEY) missing.push("OPENAI_API_KEY");
    if (!process.env.OPENAI_MODEL) missing.push("OPENAI_MODEL");
  } else if (name === "anthropic") {
    if (!process.env.ANTHROPIC_API_KEY) missing.push("ANTHROPIC_API_KEY");
  } else if (!process.env.GEMINI_API_KEY) missing.push("GEMINI_API_KEY");
  return missing;
}
export function statusResponse(request: Request) {
  const blocked = publicAccessBlocked(request);
  const missing = blocked ? [] : missingSettings();
  return NextResponse.json(
    { configured: !blocked && missing.length === 0, missing, publicBlocked: blocked },
    { headers: { "Cache-Control": "no-store" } },
  );
}
const fail = (error: string, status: number, headers?: HeadersInit) =>
  NextResponse.json({ error }, { status, headers });
/** Valida origen local, configuración, tipo y tamaño. Devuelve el JSON o una respuesta de error. */
export async function readGuardedJson(
  request: Request,
  maxBytes: number,
): Promise<{ json: unknown } | { response: Response }> {
  if (!localRequest(request))
    return {
      response: fail(
        publicAccessBlocked(request)
          ? "La IA está desactivada en el enlace público de la demo. Está disponible en la demostración local."
          : "La IA está habilitada solo para la demostración local.",
        403,
      ),
    };
  const missing = missingSettings();
  if (missing.length)
    return {
      response: fail(
        "La IA aún no está configurada. Falta en .env.local: " +
          missing.join(", ") +
          ". Reinicia el servidor tras guardarlo.",
        503,
      ),
    };
  if (!request.headers.get("content-type")?.includes("application/json"))
    return { response: fail("Formato no admitido.", 415) };
  const reader = request.body?.getReader();
  if (!reader) return { response: fail("Falta la consulta.", 400) };
  let raw = "";
  let bytes = 0;
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > maxBytes) {
      await reader.cancel();
      return { response: fail("Consulta demasiado larga.", 413) };
    }
    raw += decoder.decode(value, { stream: true });
  }
  raw += decoder.decode();
  try {
    return { json: JSON.parse(raw) };
  } catch {
    return { response: fail("Consulta no válida.", 400) };
  }
}
/** Límite local por proceso: `max` llamadas por minuto y `concurrent` simultáneas. */
export function createLimiter(max: number, concurrent: number) {
  let windowStart = 0;
  let calls = 0;
  let active = 0;
  return {
    /** Devuelve una función `release`, o null si se superó el límite. */
    take() {
      if (Date.now() - windowStart > 60000) {
        windowStart = Date.now();
        calls = 0;
      }
      if (calls >= max || active >= concurrent) return null;
      calls++;
      active++;
      return () => {
        active--;
      };
    },
  };
}
export const limitedResponse = () =>
  fail("Espera un minuto antes de volver a consultar.", 429, {
    "Retry-After": "60",
  });
