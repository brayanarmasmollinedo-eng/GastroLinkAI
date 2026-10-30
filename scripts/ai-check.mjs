// Verifica .env.local y hace una llamada real mínima al proveedor. Uso: npm run ai:check
import { readFileSync } from "node:fs";
import Anthropic from "@anthropic-ai/sdk";

const env = {};
try {
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (m && !line.trim().startsWith("#")) env[m[1]] = m[2];
  }
} catch {
  console.error("✗ No existe .env.local (copia .env.example).");
  process.exit(1);
}
const provider = ["openai", "anthropic"].includes(env.AI_PROVIDER) ? env.AI_PROVIDER : "gemini";
const claude = provider === "anthropic";
const gemini = provider === "gemini";
const problems = [];
if (env.AI_ENABLED !== "true") problems.push("AI_ENABLED debe ser true");
if (gemini) {
  if (!env.GEMINI_API_KEY) problems.push("falta GEMINI_API_KEY");
} else if (claude) {
  if (!env.ANTHROPIC_API_KEY) problems.push("falta ANTHROPIC_API_KEY");
} else {
  if (!env.OPENAI_API_KEY) problems.push("falta OPENAI_API_KEY");
  if (!env.OPENAI_MODEL) problems.push("falta OPENAI_MODEL");
}
if (problems.length) {
  console.error("✗ " + problems.join("; "));
  process.exit(1);
}
const hints = {
  401: "clave inválida",
  403: "clave sin permisos",
  404: "modelo no encontrado",
  400: "modelo no compatible o sin créditos",
  429: "límite de uso o sin saldo",
};
function fail(status, fallback) {
  console.error(`✗ El proveedor respondió${status ? " " + status : ""}: ${hints[status] ?? fallback}`);
  process.exit(1);
}
if (gemini) {
  const model = env.GEMINI_MODEL || "gemini-3.5-flash-lite";
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: "Responde solo: ok" }] }] }),
      signal: AbortSignal.timeout(25000),
    },
  ).catch((e) => {
    console.error("✗ Sin conexión con Gemini:", e.message);
    process.exit(1);
  });
  if (res.ok) console.log(`✓ Clave y modelo ${model} válidos. Reinicia el servidor.`);
  else fail(res.status, "error del servicio");
} else if (claude) {
  const model = env.ANTHROPIC_MODEL || "claude-opus-5-5";
  try {
    await new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, maxRetries: 0, timeout: 25000 }).messages.create({
      model,
      max_tokens: 200,
      output_config: { effort: "low" },
      messages: [{ role: "user", content: "Responde solo: ok" }],
    });
    console.log(`✓ Clave válida y modelo ${model} disponible. Reinicia el servidor.`);
  } catch (e) {
    fail(e.status, e.message);
  }
} else {
  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + env.OPENAI_API_KEY },
    body: JSON.stringify({ model: env.OPENAI_MODEL, store: false, max_output_tokens: 50, input: "Responde solo: ok" }),
    signal: AbortSignal.timeout(25000),
  }).catch((e) => {
    console.error("✗ Sin conexión con OpenAI:", e.message);
    process.exit(1);
  });
  if (res.ok) console.log(`✓ Clave y modelo ${env.OPENAI_MODEL} válidos. Reinicia el servidor.`);
  else fail(res.status, "error del servicio");
}

