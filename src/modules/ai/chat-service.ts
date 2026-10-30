import type { DemoState, Product } from "@/domain/types";
import { ProductService, normalize } from "@/services/catalog-service";
import type { PurchaseIntent } from "./contracts";
export interface ChatReply {
  text: string;
  products: Product[];
}
export function matchIntent(state: DemoState, intent: PurchaseIntent) {
  const words = normalize(intent.product)
    .split(/\s+/)
    .filter((w) => w.length > 2);
  if (!words.length) return [];
  // Puntúa por palabras coincidentes: «ají amarillo congelado» debe hallar «Ají amarillo».
  return new ProductService(state)
    .list()
    .map((p) => ({
      p,
      score: words.filter((w) => normalize(p.name).includes(w)).length,
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((x) => x.p);
}
export function localReply(state: DemoState, text: string): ChatReply {
  const query = normalize(text);
  if (/cotiz|comprar|pedido|funciona|ayuda/.test(query))
    return {
      text: "Para cotizar, elige un producto e indica cantidad, destino y fecha. El proveedor responde con una oferta; tú revisas las condiciones antes de aceptarla. Puedes consultar el estado después en Mis pedidos. Esta ayuda es local, sin IA.",
      products: [],
    };
  const ignored = new Set([
    "necesito",
    "quiero",
    "busco",
    "tienen",
    "para",
    "comprar",
    "por",
    "favor",
    "hola",
    "que",
    "hay",
    "productos",
    "producto",
    "con",
    "los",
    "las",
    "una",
    "unos",
  ]);
  const words = query
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2 && !ignored.has(w) && !/^\d+$/.test(w));
  const products = words.length
    ? new ProductService(state)
        .list()
        .map((p) => ({
          p,
          score: words.filter((w) => normalize(p.name).includes(w)).length,
        }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 4)
        .map((x) => x.p)
    : [];
  return {
    text: products.length
      ? "Estos productos del catálogo coinciden con tu consulta. Los precios son referenciales y debes confirmar condiciones con el proveedor. Búsqueda local, sin IA."
      : "Puedo ayudarte a explorar el catálogo o explicarte cómo cotizar. Prueba «ají amarillo», «quinua» o «cómo solicitar una cotización». La conversación con IA se habilita al configurar el servicio.",
    products,
  };
}
export function conversationInput(
  previous: PurchaseIntent | null,
  message: string,
) {
  // Only the bounded purchase draft is sent, never orders, messages or account data.
  return previous
    ? JSON.stringify({
        borradorAnterior: previous,
        actualizacionDelComprador: message,
      })
    : message;
}
