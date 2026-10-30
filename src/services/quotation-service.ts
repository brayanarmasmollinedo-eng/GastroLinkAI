import type { DemoState, QuotationRequest } from "@/domain/types";
import {
  requestSchema,
  offerSchema,
  type RequestInput,
  type OfferInput,
} from "@/domain/validation";
import { activity, requireSession, requireSupplier } from "./access";
export function visibleRequests(state: DemoState): QuotationRequest[] {
  const s = state.session;
  if (!s) return [];
  return state.requests.filter(
    (r) =>
      s.role === "admin" ||
      (s.role === "buyer"
        ? r.buyerId === s.organizationId
        : r.supplierIds.includes(s.organizationId!)),
  );
}
export function createRequest(state: DemoState, input: RequestInput) {
  const actor = requireSession(state, "buyer");
  const data = requestSchema.parse(input);
  const product = state.products.find(
    (p) => p.id === data.productId && p.published,
  );
  if (!product) throw new Error("El producto ya no está disponible.");
  if (data.quantity < product.minimum)
    throw new Error("El pedido mínimo es de " + product.minimum + " kg.");
  if (
    state.organizations.find((o) => o.id === product.supplierId)
      ?.verification === "SUSPENDIDO"
  )
    throw new Error("El proveedor no está disponible.");
  const request: QuotationRequest = {
    ...data,
    id: crypto.randomUUID(),
    code: "RFQ-" + String(125 + state.requests.length).padStart(5, "0"),
    buyerId: actor.organizationId!,
    supplierIds: [product.supplierId],
    unit: "kg",
    status: "ENVIADA",
    createdAt: new Date().toISOString(),
  };
  state.requests.unshift(request);
  activity(state, "Nueva solicitud " + request.code);
  return request.id;
}
export function issueOffer(
  state: DemoState,
  requestId: string,
  input: OfferInput,
) {
  const actor = requireSupplier(state);
  const data = offerSchema.parse(input);
  const request = state.requests.find(
    (r) => r.id === requestId && r.supplierIds.includes(actor.organizationId!),
  );
  if (!request || ["ACEPTADA", "RECHAZADA"].includes(request.status))
    throw new Error("La solicitud no permite nuevas ofertas.");
  if (data.minimum > request.quantity)
    throw new Error("El mínimo no puede superar la cantidad solicitada.");
  const previous = state.offers.filter(
    (o) => o.requestId === requestId && o.supplierId === actor.organizationId,
  );
  previous
    .filter((o) => o.status === "EMITIDA")
    .forEach((o) => {
      o.status = "SUSTITUIDA";
    });
  const { validDays, ...terms } = data;
  const offer = {
    ...terms,
    id: crypto.randomUUID(),
    requestId,
    supplierId: actor.organizationId!,
    quantity: request.quantity,
    validUntil: new Date(Date.now() + validDays * 86400000).toISOString(),
    status: "EMITIDA" as const,
    revision: previous.length + 1,
    createdAt: new Date().toISOString(),
  };
  state.offers.push(offer);
  request.status = "OFERTADA";
  activity(state, "Oferta enviada para " + request.code);
  return offer.id;
}
export function rejectOffer(state: DemoState, offerId: string) {
  const s = requireSession(state, "buyer");
  const offer = state.offers.find((o) => o.id === offerId);
  const request = state.requests.find(
    (r) => r.id === offer?.requestId && r.buyerId === s.organizationId,
  );
  if (
    !request ||
    !offer ||
    request.status === "ACEPTADA" ||
    offer.status !== "EMITIDA"
  )
    throw new Error("No puedes rechazar esta oferta.");
  offer.status = "RECHAZADA";
  request.status = state.offers.some(
    (o) => o.requestId === request.id && o.status === "EMITIDA",
  )
    ? "OFERTADA"
    : "EN_NEGOCIACION";
  activity(state, "Oferta rechazada: " + request.code);
}
export function negotiate(state: DemoState, requestId: string) {
  const s = requireSession(state, "buyer");
  const request = state.requests.find(
    (r) => r.id === requestId && r.buyerId === s.organizationId,
  );
  if (!request || request.status === "ACEPTADA")
    throw new Error("La solicitud no permite negociar.");
  request.status = "EN_NEGOCIACION";
  activity(state, "Negociación iniciada: " + request.code);
}
