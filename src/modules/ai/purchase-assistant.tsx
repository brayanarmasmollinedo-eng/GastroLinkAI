"use client";
import { useEffect, useState } from "react";
import { Sparkles, LoaderCircle } from "lucide-react";
import { FormField, Notice, Modal } from "@/components/ui";
import { useDemo } from "@/components/demo-provider";
import { matchIntent } from "./chat-service";
import { intentSchema, kilograms, type PurchaseIntent } from "./contracts";
import { RequestForm } from "@/modules/quotations/request-form";
import type { Product } from "@/domain/types";
export function PurchaseAssistant({
  onSearch,
}: {
  onSearch: (text: string) => void;
}) {
  const { state } = useDemo();
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [missing, setMissing] = useState<string[]>([]);
  const [publicBlocked, setPublicBlocked] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [intent, setIntent] = useState<PurchaseIntent | null>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  useEffect(() => {
    let current = true;
    fetch("/api/ai/intent")
      .then((r) => r.json())
      .then((data) => {
        if (!current) return;
        setConfigured(data.configured === true);
        setMissing(Array.isArray(data.missing) ? data.missing : []);
        setPublicBlocked(data.publicBlocked === true);
      })
      .catch(() => {
        if (current) setConfigured(false);
      });
    return () => {
      current = false;
    };
  }, []);
  const matches = intent ? matchIntent(state, intent) : [];
  function edit(key: keyof PurchaseIntent, value: string | number | null) {
    setIntent((previous) => (previous ? { ...previous, [key]: value } : null));
  }
  return (
    <section className="ai-box" aria-label="Asistente de compra">
      <div className="row-between">
        <h3>
          <Sparkles size={18} style={{ display: "inline", marginRight: 8 }} />
          GastroLink AI
        </h3>
        <span className="tag">
          {configured === null
            ? "Comprobando conexión"
            : configured
              ? "IA conectada"
              : "Pendiente de activación"}
        </span>
      </div>
      <p className="muted" style={{ margin: "12px 0" }}>
        Cuéntanos qué necesitas. Revisa la propuesta antes de buscar o preparar
        tu solicitud.
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          setIntent(null);
          try {
            const response = await fetch("/api/ai/intent", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text }),
              signal: AbortSignal.timeout(30000),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok)
              throw new Error(data.error ?? "No se pudo consultar la IA.");
            setIntent(intentSchema.parse(data.intent));
          } catch (err) {
            setError(
              err instanceof Error && err.name !== "TimeoutError"
                ? err.message
                : "La IA tardó demasiado en responder. Reintenta.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <input
          aria-label="Describe tu compra"
          placeholder="Necesito 200 kg de ají amarillo congelado para Madrid el 20/11/2026."
          value={text}
          onChange={(e) => setText(e.target.value)}
          minLength={5}
          maxLength={1500}
          required
          disabled={busy}
        />
        <button className="button" disabled={busy || !configured}>
          {busy ? <LoaderCircle size={16} /> : <Sparkles size={16} />}{" "}
          {busy ? "Interpretando…" : "Preparar con IA"}
        </button>
      </form>
      <small>
        Al consultar, el texto se envía al servicio de IA configurado. No incluyas información
        confidencial. La IA no envía solicitudes ni realiza compras.
      </small>
      {configured === false && publicBlocked && (
        <Notice>
          La IA está desactivada en este enlace público para proteger el
          servicio. Puedes seguir usando el buscador y las cotizaciones
          manuales; la IA está disponible en la demostración local.
        </Notice>
      )}
      {configured === false && !publicBlocked && (
        <Notice>
          La integración está preparada, pero falta configurar el servidor
          {missing.length > 0 && <> (en .env.local: {missing.join(", ")})</>}.
          Reinicia el servidor tras guardar. Puedes seguir usando el buscador y
          las cotizaciones manuales.
        </Notice>
      )}
      {error && <Notice error>{error}</Notice>}
      {intent && (
        <div style={{ marginTop: 24 }}>
          <h3>Revisa lo que entendimos</h3>
          <div className="form-grid" style={{ marginTop: 18 }}>
            <FormField label="Producto">
              <input
                value={intent.product}
                onChange={(e) => edit("product", e.target.value)}
              />
            </FormField>
            <FormField label="Cantidad">
              <input
                type="number"
                min=".001"
                step="any"
                value={intent.quantity ?? ""}
                onChange={(e) =>
                  edit(
                    "quantity",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
              />
            </FormField>
            <FormField label="Unidad">
              <select
                value={intent.unit ?? ""}
                onChange={(e) => edit("unit", e.target.value || null)}
              >
                <option value="">Por confirmar</option>
                {["kg", "g", "t", "cajas", "unidades"].map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Presentación">
              <input
                value={intent.presentation ?? ""}
                onChange={(e) => edit("presentation", e.target.value || null)}
              />
            </FormField>
            <FormField label="Ciudad">
              <input
                value={intent.city ?? ""}
                onChange={(e) => edit("city", e.target.value || null)}
              />
            </FormField>
            <FormField label="País">
              <input
                value={intent.country ?? ""}
                onChange={(e) => edit("country", e.target.value || null)}
              />
            </FormField>
            <FormField label="Fecha requerida">
              <input
                type="date"
                value={intent.requiredDate ?? ""}
                onChange={(e) => edit("requiredDate", e.target.value || null)}
              />
            </FormField>
          </div>
          {intent.questions.length > 0 && (
            <Notice>{intent.questions.join(" ")}</Notice>
          )}
          <button
            type="button"
            className="button button-outline"
            onClick={() => onSearch(intent.product)}
          >
            Aplicar al buscador
          </button>
          <p className="demo-note">
            Coincidencias del catálogo actual. La IA no confirma stock, precios
            ni certificaciones.
          </p>
          {matches.slice(0, 4).map((p) => (
            <div className="row-between operation-card" key={p.id}>
              <div>
                <b>{p.name}</b>
                <small style={{ display: "block" }}>
                  {state.organizations.find((o) => o.id === p.supplierId)?.name}{" "}
                  · mínimo {p.minimum} kg
                </small>
              </div>
              <button
                type="button"
                className="button button-small"
                onClick={() => setSelected(p)}
              >
                Preparar solicitud
              </button>
            </div>
          ))}
          {!matches.length && (
            <p className="muted">
              Sin coincidencias exactas. Ajusta el nombre del producto o usa el
              buscador.
            </p>
          )}
          {selected && (
            <Modal
              title="Revisar solicitud antes de enviar"
              onClose={() => setSelected(null)}
            >
              <RequestForm
                product={selected}
                initial={{
                  quantity: kilograms(intent),
                  city: intent.city,
                  country: intent.country,
                  requiredDate: intent.requiredDate,
                  comments: intent.presentation
                    ? "Presentación solicitada: " + intent.presentation
                    : "",
                }}
              />
            </Modal>
          )}
        </div>
      )}
    </section>
  );
}
