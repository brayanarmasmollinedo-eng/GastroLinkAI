import { describe, it, expect, vi } from "vitest";
import { intentSchema, kilograms } from "@/modules/ai/contracts";
import Anthropic from "@anthropic-ai/sdk";
import { OpenAiIntentProvider } from "@/modules/ai/openai-provider";
import { GeminiIntentProvider } from "@/modules/ai/gemini-provider";
import { AnthropicIntentProvider } from "@/modules/ai/anthropic-provider";
const intent = {
  product: "ajÃ­ amarillo",
  quantity: 200,
  unit: "kg" as const,
  city: "Madrid",
  country: null,
  requiredDate: null,
  presentation: "congelado",
  questions: ["Â¿En quÃ© paÃ­s?"],
};
describe("intenciÃ³n de compra IA", () => {
  it("valida los datos y rechaza campos inesperados", () => {
    expect(intentSchema.parse(intent)).toEqual(intent);
    expect(() => intentSchema.parse({ ...intent, quantity: -1 })).toThrow();
    expect(() => intentSchema.parse({ ...intent, price: 4 })).toThrow();
  });
  it("convierte solo unidades de masa y nunca cajas", () => {
    expect(kilograms({ ...intent, quantity: 2, unit: "t" })).toBe(2000);
    expect(kilograms({ ...intent, quantity: 500, unit: "g" })).toBe(0.5);
    expect(kilograms({ ...intent, unit: "cajas" })).toBeNull();
  });
  it("usa salida estructurada y no persiste respuestas en el proveedor", async () => {
    const request = vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            status: "completed",
            output: [
              {
                content: [
                  { type: "output_text", text: JSON.stringify(intent) },
                ],
              },
            ],
          }),
        ),
      );
    const provider = new OpenAiIntentProvider(
      "test-key",
      "test-model",
      request,
    );
    expect(await provider.interpret("200 kg de ajÃ­")).toEqual(intent);
    const body = JSON.parse(request.mock.calls[0][1].body);
    expect(body.store).toBe(false);
    expect(body.text.format.strict).toBe(true);
  });
  it("no acepta rechazos ni respuestas incompletas", async () => {
    const request = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ status: "incomplete", output: [] })),
      );
    await expect(
      new OpenAiIntentProvider("test", "test", request).interpret("hola"),
    ).rejects.toThrow();
  });
  it("no filtra detalles del proveedor en errores HTTP", async () => {
    const request = vi
      .fn()
      .mockResolvedValue(new Response("secret", { status: 401 }));
    await expect(
      new OpenAiIntentProvider("test", "test", request).interpret("hola"),
    ).rejects.toMatchObject({ code: "AUTH" });
  });
});
describe("proveedor Claude", () => {
  const reply = (extra: object) => ({
    stop_reason: "end_turn",
    content: [{ type: "text", text: JSON.stringify(intent) }],
    ...extra,
  });
  it("extrae la intenciÃ³n con salida estructurada", async () => {
    const create = vi.fn().mockResolvedValue(reply({}));
    const provider = new AnthropicIntentProvider("k", undefined, { create } as never);
    expect(await provider.interpret("200 kg de ajÃ­")).toEqual(intent);
    const body = create.mock.calls[0][0];
    expect(body.model).toBe("claude-opus-5-5");
    expect(body.output_config.format.type).toBe("json_schema");
    expect(body.messages[0].content).toBe("200 kg de ajÃ­");
  });
  it("trata rechazos y respuestas cortadas como error controlado", async () => {
    for (const stop_reason of ["refusal", "max_tokens"]) {
      const create = vi.fn().mockResolvedValue(reply({ stop_reason }));
      await expect(
        new AnthropicIntentProvider("k", "m", { create } as never).interpret("hola mundo"),
      ).rejects.toMatchObject({ code: "INVALID" });
    }
  });
  it("traduce errores del SDK a mensajes accionables", async () => {
    const cases: [number, string][] = [[401, "AUTH"], [404, "MODEL"], [429, "QUOTA"]];
    for (const [status, code] of cases) {
      const create = vi.fn().mockRejectedValue(
        Anthropic.APIError.generate(status, { error: { message: "x" } }, "x", new Headers()),
      );
      await expect(
        new AnthropicIntentProvider("k", "m", { create } as never).interpret("hola mundo"),
      ).rejects.toMatchObject({ code });
    }
  });
});
describe("proveedor Gemini", () => {
  const ok = (body: object, status = 200) => new Response(JSON.stringify(body), { status });
  const good = { candidates: [{ finishReason: "STOP", content: { parts: [{ text: JSON.stringify(intent) }] } }] };
  it("extrae la intenciÃ³n y envÃ­a la clave por cabecera", async () => {
    const request = vi.fn().mockResolvedValue(ok(good));
    expect(await new GeminiIntentProvider("k", undefined, request).interpret("200 kg de ajÃ­")).toEqual(intent);
    const [url, init] = request.mock.calls[0];
    expect(url).not.toContain("k");
    expect(url).toContain("gemini-3.5-flash-lite:generateContent");
    expect(init.headers["x-goog-api-key"]).toBe("k");
    expect(JSON.parse(init.body).generationConfig.responseMimeType).toBe("application/json");
  });
  it("reintenta sin esquema si Gemini lo rechaza", async () => {
    const request = vi.fn().mockResolvedValueOnce(ok({}, 400)).mockResolvedValueOnce(ok(good));
    await new GeminiIntentProvider("k", "m", request).interpret("hola mundo");
    expect(JSON.parse(request.mock.calls[1][1].body).generationConfig.responseSchema).toBeUndefined();
  });
  it("traduce cuota, modelo y bloqueos", async () => {
    for (const [res, code] of [[ok({}, 429), "QUOTA"], [ok({}, 404), "MODEL"], [ok({ promptFeedback: { blockReason: "SAFETY" } }), "INVALID"]] as const) {
      const request = vi.fn().mockResolvedValue(res);
      await expect(new GeminiIntentProvider("k", "m", request).interpret("hola mundo")).rejects.toMatchObject({ code });
    }
  });
});

