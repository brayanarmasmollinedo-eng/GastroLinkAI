"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MessageCircle, Sparkles, X, Send, RotateCcw } from "lucide-react";
import { useDemo } from "@/components/demo-provider";
import { Modal, money } from "@/components/ui";
import { RequestForm } from "@/modules/quotations/request-form";
import { localReply } from "./chat-service";
import { catalogContext, productsMentioned } from "./assistant";
import type { Product } from "@/domain/types";
interface Turn {
  id: number;
  role: "user" | "assistant";
  text: string;
  products?: Product[];
  failed?: boolean;
}
// Renderiza el markdown básico que devuelve la IA (negritas, listas, títulos) sin HTML crudo.
function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      part.replace(/\*/g, "")
    ),
  );
}
function ChatText({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((raw, i) => {
        const line = raw.trim();
        if (!line || /^[-*_]{3,}$/.test(line)) return null;
        const heading = line.match(/^#{1,6}\s+(.*)$/);
        if (heading)
          return (
            <p key={i}>
              <strong>{inline(heading[1])}</strong>
            </p>
          );
        const item = line.match(/^(?:[-*•]\s+|(\d+)[.)]\s+)(.*)$/);
        if (item)
          return (
            <p key={i} style={{ paddingLeft: 14 }}>
              {item[1] ? item[1] + ". " : "• "}
              {inline(item[2])}
            </p>
          );
        return <p key={i}>{inline(line)}</p>;
      })}
    </>
  );
}
export function Chatbot() {
  const { state } = useDemo();
  const [open, setOpen] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [mode, setMode] = useState<"local" | "ai">("local");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [selection, setSelection] = useState<Product | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const requestId = useRef(0);
  const chosen = useRef(false);
  useEffect(() => {
    if (!open) return;
    let valid = true;
    fetch("/api/ai/intent")
      .then((r) => r.json())
      .then((data) => {
        if (!valid) return;
        setConfigured(data.configured === true);
        // Con IA disponible, el chat arranca en modo IA salvo que ya se haya elegido otro.
        if (data.configured === true && !chosen.current) setMode("ai");
      })
      .catch(() => {
        if (valid) setConfigured(false);
      });
    field.current?.focus();
    return () => {
      valid = false;
    };
  }, [open]);
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "nearest" });
  }, [turns, busy]);
  function close() {
    setOpen(false);
    launcher.current?.focus();
  }
  async function send(text: string) {
    if (busy || !text.trim()) return;
    const current = ++requestId.current;
    const value = text.trim();
    setMessage("");
    setBusy(true);
    setTurns((t) => [...t, { id: current * 2, role: "user", text: value }]);
    try {
      if (mode === "local") {
        const reply = localReply(state, value);
        setTurns((t) => [
          ...t,
          { id: current * 2 + 1, role: "assistant", ...reply },
        ]);
      } else {
        // Historial reciente (sin mensajes de error) + catálogo público de la demo.
        const history = turns
          .filter((t) => !t.failed)
          .slice(-11)
          .map((t) => ({ role: t.role, text: t.text.slice(0, 1500) }));
        const response = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...history, { role: "user", text: value }],
            catalog: catalogContext(state),
          }),
          signal: AbortSignal.timeout(40000),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok)
          throw new Error(data.error ?? "No pudimos consultar la IA.");
        const reply = String(data.reply ?? "");
        setTurns((t) => [
          ...t,
          {
            id: current * 2 + 1,
            role: "assistant",
            text: reply,
            products: productsMentioned(state, reply),
          },
        ]);
      }
    } catch (error) {
      setTurns((t) => [
        ...t,
        {
          id: current * 2 + 1,
          role: "assistant",
          failed: true,
          text:
            error instanceof Error && error.name !== "TimeoutError"
              ? error.message
              : "La IA tardó demasiado en responder. Intenta de nuevo.",
        },
      ]);
    } finally {
      setBusy(false);
      field.current?.focus();
    }
  }
  return (
    <>
      <button
        ref={launcher}
        className="chatbot-launcher"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="gastrolink-chat"
      >
        <MessageCircle size={21} />
        <span>Asistente GastroLink</span>
      </button>
      {open && (
        <section
          className="chatbot-panel"
          id="gastrolink-chat"
          role="dialog"
          aria-modal="false"
          aria-label="Asistente de compras GastroLink"
          onKeyDown={(e) => {
            if (e.key === "Escape") close();
          }}
        >
          <header className="chatbot-header">
            <div>
              <strong>
                <Sparkles size={17} /> GastroLink AI
              </strong>
              <small>Tu asistente de compras</small>
            </div>
            <div>
              <button
                className="icon-button"
                disabled={busy}
                aria-label="Nueva conversación"
                onClick={() => {
                  setTurns([]);
                }}
              >
                <RotateCcw size={17} />
              </button>
              <button
                className="icon-button"
                aria-label="Cerrar chatbot"
                onClick={close}
              >
                <X size={20} />
              </button>
            </div>
          </header>
          <div className="chatbot-mode">
            <label htmlFor="chat-mode">Modo</label>
            <select
              id="chat-mode"
              value={mode}
              disabled={busy}
              onChange={(e) => {
                chosen.current = true;
                setMode(e.target.value as "local" | "ai");
              }}
            >
              <option value="local">Ayuda y catálogo local · sin IA</option>
              <option value="ai" disabled={!configured}>
                {configured
                  ? "Conversación con IA"
                  : "IA pendiente de activación"}
              </option>
            </select>
          </div>
          <div
            className="chatbot-history"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
          >
            <div className="chatbot-bubble assistant">
              ¡Hola! Puedo ayudarte a encontrar ingredientes peruanos y preparar
              tu próxima cotización. ¿Qué necesitas para tu negocio?
            </div>
            {!turns.length && (
              <div className="chatbot-suggestions">
                {[
                  "Ají amarillo",
                  "Quinua",
                  "Cómo solicitar una cotización",
                ].map((s) => (
                  <button key={s} onClick={() => void send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}
            {turns.map((t) => (
              <div key={t.id} className={"chatbot-bubble " + t.role}>
                <ChatText text={t.text} />
                {t.products?.map((p) => (
                  <article className="chatbot-product" key={p.id}>
                    <img src={p.image} alt="" />
                    <div>
                      <Link href={"/products/" + p.slug} onClick={close}>
                        <b>{p.name}</b>
                      </Link>
                      <small>
                        {money(p.price)}/kg · mínimo {p.minimum} kg
                      </small>
                      <button
                        onClick={() =>
                          setSelection(p)
                        }
                      >
                        Preparar cotización →
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ))}
            {busy && (
              <p className="chatbot-typing" role="status">
                Preparando respuesta…
              </p>
            )}
            <div ref={bottom} />
          </div>
          <footer className="chatbot-footer">
            <small>
              {mode === "ai"
                ? "Tu pregunta y el catálogo público de la demo se envían al servicio de IA configurado. No compartas datos confidenciales."
                : "Ayuda local sin IA. Las empresas y operaciones son de demostración."}
            </small>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send(message);
              }}
            >
              <input
                ref={field}
                aria-label="Mensaje al asistente"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="¿Qué ingrediente necesitas?"
                maxLength={700}
                disabled={busy}
                required
              />
              <button
                className="button button-small"
                disabled={busy || !message.trim()}
                aria-label="Enviar al asistente"
              >
                <Send size={17} />
              </button>
            </form>
          </footer>
        </section>
      )}
      {selection && (
        <Modal title="Revisa tu solicitud" onClose={() => setSelection(null)}>
          <RequestForm product={selection} />
        </Modal>
      )}
    </>
  );
}
