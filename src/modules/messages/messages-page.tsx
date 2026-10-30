"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Send } from "lucide-react";
import { useDemo } from "@/components/demo-provider";
import { PageHeader, EmptyState, Notice } from "@/components/ui";
import { visibleConversations, sendMessage } from "@/services/message-service";
import { errorMessage } from "@/domain/validation";
export default function MessagesPage() {
  const { state, mutate } = useDemo();
  const params = useSearchParams();
  const conversations = visibleConversations(state);
  const [selected, setSelected] = useState(params.get("conversation") ?? "");
  const [error, setError] = useState("");
  const active =
    conversations.find((c) => c.id === selected) ?? conversations[0];
  const organizationId = state.session?.organizationId;
  const otherName = (buyerId: string, supplierId: string) =>
    state.organizations.find(
      (o) => o.id === (organizationId === buyerId ? supplierId : buyerId),
    )?.name ?? "Empresa demo";
  return (
    <>
      <PageHeader
        eyebrow="BUENOS ACUERDOS EMPIEZAN CON UNA CONVERSACIÓN"
        title="Conectemos los detalles."
        description="Mensajes de demostración entre compradores y proveedores. Sin envío externo ni chat en tiempo real."
      />
      {error && <Notice error>{error}</Notice>}
      {!conversations.length ? (
        <EmptyState
          title="Todavía no hay conversaciones"
          description="Abre el perfil de un proveedor y solicita información para empezar."
          href={state.session?.role === "buyer" ? "/suppliers" : undefined}
          label="Conocer proveedores"
        />
      ) : (
        <div className="chat-layout">
          <aside className="chat-list">
            {conversations.map((c) => (
              <button
                className={active?.id === c.id ? "active" : ""}
                key={c.id}
                onClick={() => setSelected(c.id)}
              >
                {otherName(c.buyerId, c.supplierId)}
                <small>{c.subject}</small>
              </button>
            ))}
          </aside>
          {active && (
            <section className="chat-content">
              <header className="chat-heading">
                {otherName(active.buyerId, active.supplierId)}
                <small className="demo-caption">
                  Conversación DEMO · cambia de perfil para responder
                </small>
              </header>
              <div className="chat-messages" aria-live="polite">
                {state.messages
                  .filter((m) => m.conversationId === active.id)
                  .map((m) => (
                    <div
                      key={m.id}
                      className={
                        "chat-bubble " +
                        (m.senderOrganizationId === organizationId ? "own" : "")
                      }
                    >
                      <p>{m.body}</p>
                      <small>
                        {
                          state.organizations.find(
                            (o) => o.id === m.senderOrganizationId,
                          )?.name
                        }{" "}
                        ·{" "}
                        {new Date(m.createdAt).toLocaleTimeString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </small>
                    </div>
                  ))}
              </div>
              <form
                className="chat-composer"
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  try {
                    mutate((s) =>
                      sendMessage(s, active.id, String(f.get("message"))),
                    );
                    setError("");
                    e.currentTarget.reset();
                  } catch (err) {
                    setError(errorMessage(err));
                  }
                }}
              >
                <input
                  aria-label="Mensaje"
                  name="message"
                  placeholder="Escribe tu mensaje…"
                  required
                  maxLength={2000}
                />
                <button className="button" aria-label="Enviar mensaje">
                  <Send size={17} />
                </button>
              </form>
            </section>
          )}
        </div>
      )}
    </>
  );
}
