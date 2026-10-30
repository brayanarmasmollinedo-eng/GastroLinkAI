import { describe, it, expect } from "vitest";
import { MemoryDemoRepository } from "@/repositories/demo-repository";
import { loginDemo } from "@/services/account-service";
import {
  createRequest,
  issueOffer,
  visibleRequests,
} from "@/services/quotation-service";
import { acceptOffer, advanceOrder } from "@/services/order-service";
import { startConversation, sendMessage } from "@/services/message-service";
import type { DemoState } from "@/domain/types";
describe("flujo persistido entre perfiles", () => {
  it("recorre solicitud → oferta → pedido → seguimiento y mensajes", () => {
    const repo = new MemoryDemoRepository();
    const command = <T>(fn: (s: DemoState) => T) => {
      const state = repo.load();
      const result = fn(state);
      repo.save(state);
      return result;
    };
    command((s) => loginDemo(s, "buyer", "buyer-1"));
    const requestId = command((s) =>
      createRequest(s, {
        productId: "product-1",
        quantity: 200,
        city: "Madrid",
        country: "España",
        requiredDate: new Date(Date.now() + 40 * 86400000)
          .toISOString()
          .slice(0, 10),
        comments: "Presentación de 10 kg.",
      }),
    );
    command((s) => loginDemo(s, "supplier", "supplier-1"));
    expect(visibleRequests(repo.load()).some((r) => r.id === requestId)).toBe(
      true,
    );
    const offerId = command((s) =>
      issueOffer(s, requestId, {
        price: 4.2,
        leadDays: 18,
        minimum: 100,
        validDays: 7,
        presentation: "Caja de 10 kg",
        conditions: "Oferta demo, transporte no incluido.",
      }),
    );
    command((s) => loginDemo(s, "buyer", "buyer-1"));
    const orderId = command((s) => acceptOffer(s, offerId));
    expect(command((s) => acceptOffer(s, offerId))).toBe(orderId);
    const conversationId = command((s) => startConversation(s, "supplier-1"));
    command((s) =>
      sendMessage(s, conversationId, "Gracias, esperamos la preparación."),
    );
    command((s) => loginDemo(s, "supplier", "supplier-1"));
    command((s) => advanceOrder(s, orderId, "Preparando 20 cajas."));
    command((s) => loginDemo(s, "buyer", "buyer-1"));
    expect(repo.load().orders.find((o) => o.id === orderId)?.status).toBe(
      "PREPARACION",
    );
    expect(repo.load().messages.at(-1)?.body).toBe(
      "Gracias, esperamos la preparación.",
    );
    const before = repo.load();
    expect(() =>
      command((s) => advanceOrder(s, orderId, "Acceso indebido")),
    ).toThrow();
    expect(repo.load()).toEqual(before);
  });
  it("la copia de lectura no modifica accidentalmente lo persistido", () => {
    const repo = new MemoryDemoRepository();
    const copy = repo.load();
    copy.products.length = 0;
    expect(repo.load().products).toHaveLength(20);
  });
});
