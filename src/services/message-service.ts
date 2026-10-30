import type { DemoState } from "@/domain/types";
import { requireSession } from "./access";
import { z } from "zod";
export function visibleConversations(state: DemoState) {
  const s = state.session;
  return state.conversations.filter(
    (c) =>
      s &&
      (c.buyerId === s.organizationId || c.supplierId === s.organizationId),
  );
}
export function startConversation(state: DemoState, supplierId: string) {
  const s = requireSession(state, "buyer");
  if (
    !state.organizations.some(
      (o) => o.id === supplierId && o.kind === "supplier",
    )
  )
    throw new Error("Proveedor no encontrado.");
  const existing = state.conversations.find(
    (c) => c.buyerId === s.organizationId && c.supplierId === supplierId,
  );
  if (existing) return existing.id;
  const id = crypto.randomUUID();
  state.conversations.push({
    id,
    buyerId: s.organizationId!,
    supplierId,
    subject: "Consulta comercial",
  });
  return id;
}
export function sendMessage(
  state: DemoState,
  conversationId: string,
  body: string,
) {
  const s = requireSession(state);
  const conversation = visibleConversations(state).find(
    (c) => c.id === conversationId,
  );
  if (!conversation) throw new Error("Conversación no disponible.");
  const text = z.string().trim().min(1).max(2000).parse(body);
  state.messages.push({
    id: crypto.randomUUID(),
    conversationId,
    senderId: s.userId,
    senderOrganizationId: s.organizationId!,
    body: text,
    createdAt: new Date().toISOString(),
  });
}
