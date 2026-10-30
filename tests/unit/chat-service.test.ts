import { describe, it, expect } from "vitest";
import { createSeed } from "@/data/seed";
import {
  localReply,
  matchIntent,
  conversationInput,
} from "@/modules/ai/chat-service";
const intent = {
  product: "ají amarillo",
  quantity: 200,
  unit: "kg" as const,
  city: "Madrid",
  country: null,
  requiredDate: null,
  presentation: null,
  questions: [],
};
describe("chatbot de compras", () => {
  it("busca productos sin inventarlos", () => {
    const state = createSeed();
    const reply = localReply(state, "Busco ají amarillo");
    expect(reply.products[0].name).toContain("Ají amarillo");
    expect(
      reply.products.every((p) => state.products.some((x) => x.id === p.id)),
    ).toBe(true);
    expect(reply.text).toContain("sin IA");
  });
  it("explica el proceso de cotización sin crear operaciones", () => {
    const state = createSeed();
    const before = structuredClone(state);
    expect(localReply(state, "Cómo solicitar una cotización").text).toContain(
      "proveedor",
    );
    expect(state).toEqual(before);
  });
  it("no devuelve todo el catálogo ante producto vacío", () => {
    expect(matchIntent(createSeed(), { ...intent, product: "" })).toEqual([]);
  });
  it("conserva el borrador sin incluir datos privados", () => {
    const value = JSON.parse(
      conversationInput(intent, "Ahora necesito 300 kg"),
    );
    expect(value.borradorAnterior.quantity).toBe(200);
    expect(value.actualizacionDelComprador).toContain("300");
    expect(Object.keys(value)).toHaveLength(2);
  });
});
