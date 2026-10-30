import type { DemoState } from "@/domain/types";
export function addSampleOrder(state: DemoState, now: Date): DemoState {
  const past = (days: number) =>
    new Date(now.getTime() - days * 86400000).toISOString();
  state.requests.push({
    id: "rfq-history",
    code: "RFQ-00123",
    buyerId: "buyer-1",
    productId: "product-20",
    supplierIds: ["supplier-1"],
    quantity: 150,
    unit: "kg",
    city: "Madrid",
    country: "España",
    requiredDate: new Date(now.getTime() + 15 * 86400000)
      .toISOString()
      .slice(0, 10),
    comments: "Pedido de muestra para seguimiento.",
    status: "ACEPTADA",
    createdAt: past(6),
  });
  state.offers.push({
    id: "offer-history",
    requestId: "rfq-history",
    supplierId: "supplier-1",
    price: 4.1,
    quantity: 150,
    leadDays: 18,
    minimum: 100,
    presentation: "Caja de 10 kg",
    conditions:
      "Operación histórica DEMO. Transporte e impuestos pendientes de acuerdo.",
    validUntil: new Date(now.getTime() + 86400000).toISOString(),
    status: "ACEPTADA",
    revision: 1,
    createdAt: past(5),
  });
  state.orders.push({
    id: "order-history",
    code: "GL-" + now.getFullYear() + "-001",
    requestId: "rfq-history",
    offerId: "offer-history",
    buyerId: "buyer-1",
    supplierId: "supplier-1",
    productName: "Choclo desgranado",
    presentation: "Caja de 10 kg",
    quantity: 150,
    price: 4.1,
    city: "Madrid",
    country: "España",
    status: "DOCUMENTACION",
    createdAt: past(4),
    history: [
      {
        status: "CONFIRMADO",
        previous: null,
        actorId: "user-buyer-1",
        at: past(4),
        note: "Pedido ficticio confirmado.",
      },
      {
        status: "PREPARACION",
        previous: "CONFIRMADO",
        actorId: "user-supplier-1",
        at: past(3),
        note: "Selección y preparación de 15 cajas.",
      },
      {
        status: "DOCUMENTACION",
        previous: "PREPARACION",
        actorId: "user-supplier-1",
        at: past(1),
        note: "Documentación de demostración en preparación.",
      },
    ],
  });
  return state;
}
