import { orderStates, type DemoState } from "@/domain/types";
import { requireSession, requireSupplier, activity } from "./access";
export function visibleOrders(state: DemoState) {
  const s = state.session;
  return state.orders.filter(
    (o) =>
      s &&
      (s.role === "admin" ||
        o.buyerId === s.organizationId ||
        o.supplierId === s.organizationId),
  );
}
export function acceptOffer(state: DemoState, offerId: string) {
  const actor = requireSession(state, "buyer");
  const offer = state.offers.find((o) => o.id === offerId);
  const request = state.requests.find(
    (r) => r.id === offer?.requestId && r.buyerId === actor.organizationId,
  );
  if (!offer || !request) throw new Error("No tienes acceso a esta oferta.");
  const existing = state.orders.find((o) => o.offerId === offerId);
  if (existing) return existing.id;
  if (
    request.status === "ACEPTADA" ||
    state.orders.some((o) => o.requestId === request.id)
  )
    throw new Error("Esta solicitud ya tiene un pedido.");
  if (offer.status !== "EMITIDA" || new Date(offer.validUntil) <= new Date())
    throw new Error("La oferta ya no está vigente.");
  if (
    state.organizations.find((o) => o.id === offer.supplierId)?.verification ===
    "SUSPENDIDO"
  )
    throw new Error("El proveedor está suspendido.");
  const product = state.products.find((p) => p.id === request.productId);
  if (!product) throw new Error("Producto no encontrado.");
  const now = new Date().toISOString();
  const order = {
    id: crypto.randomUUID(),
    code:
      "GL-" +
      new Date().getFullYear() +
      "-" +
      String(state.orders.length + 1).padStart(3, "0"),
    requestId: request.id,
    offerId,
    buyerId: request.buyerId,
    supplierId: offer.supplierId,
    productName: product.name,
    presentation: offer.presentation,
    quantity: offer.quantity,
    price: offer.price,
    city: request.city,
    country: request.country,
    status: "CONFIRMADO" as const,
    createdAt: now,
    history: [
      {
        status: "CONFIRMADO" as const,
        previous: null,
        actorId: actor.userId,
        at: now,
        note: "Oferta aceptada. Pedido de demostración creado.",
      },
    ],
  };
  offer.status = "ACEPTADA";
  request.status = "ACEPTADA";
  state.offers
    .filter(
      (o) =>
        o.requestId === request.id &&
        o.id !== offer.id &&
        o.status === "EMITIDA",
    )
    .forEach((o) => {
      o.status = "RECHAZADA";
    });
  state.orders.unshift(order);
  activity(state, "Pedido creado: " + order.code);
  return order.id;
}
export function advanceOrder(state: DemoState, orderId: string, note: string) {
  const s = requireSupplier(state);
  const order = state.orders.find(
    (o) => o.id === orderId && o.supplierId === s.organizationId,
  );
  if (!order) throw new Error("No puedes modificar este pedido.");
  const next = orderStates[orderStates.indexOf(order.status) + 1];
  if (!next) throw new Error("El pedido ya fue entregado.");
  const previous = order.status;
  order.status = next;
  order.history.push({
    previous,
    status: next,
    actorId: s.userId,
    at: new Date().toISOString(),
    note: note.trim().slice(0, 500) || "Actualización de seguimiento demo.",
  });
  activity(state, order.code + ": " + next.replaceAll("_", " "));
}
