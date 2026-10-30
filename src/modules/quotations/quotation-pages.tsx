"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, ArrowLeft, GitCompareArrows, Send } from "lucide-react";
import type { QuotationOffer, QuotationRequest, Role } from "@/domain/types";
import { useDemo } from "@/components/demo-provider";
import {
  EmptyState,
  PageHeader,
  StatusBadge,
  money,
  dateLabel,
  FormField,
  Notice,
  Modal,
} from "@/components/ui";
import { roleBase } from "@/components/workspace-shell";
import {
  visibleRequests,
  issueOffer,
  rejectOffer,
  negotiate,
} from "@/services/quotation-service";
import { acceptOffer } from "@/services/order-service";
import { startConversation } from "@/services/message-service";
import { errorMessage } from "@/domain/validation";
export function QuoteCard({
  request,
  base,
}: {
  request: QuotationRequest;
  base: string;
}) {
  const { state } = useDemo();
  const product = state.products.find((p) => p.id === request.productId);
  return (
    <article className="operation-card">
      <div className="row-between">
        <span className="code">
          {request.code} · {dateLabel(request.createdAt)}
        </span>
        <StatusBadge status={request.status} />
      </div>
      <h3>{product?.name}</h3>
      <p>
        {request.quantity} kg · {request.city}, {request.country} · Requerido:{" "}
        {dateLabel(request.requiredDate)}
      </p>
      <div className="button-row">
        <Link className="text-link" href={base + "/quotations/" + request.id}>
          Ver solicitud <ArrowUpRight size={16} />
        </Link>
      </div>
    </article>
  );
}
export function QuotationList({ role }: { role: Role }) {
  const { state } = useDemo();
  const [filter, setFilter] = useState("");
  const requests = visibleRequests(state).filter(
    (r) => !filter || r.status === filter,
  );
  return (
    <>
      <PageHeader
        eyebrow="CONVERSACIONES QUE SE CONVIERTEN EN OPORTUNIDADES"
        title={
          role === "supplier"
            ? "Tu bandeja de cotizaciones."
            : "Mis cotizaciones."
        }
        description="Consulta solicitudes, revisa propuestas y acuerda las condiciones de tu próximo pedido."
        action={
          role === "buyer" ? (
            <Link className="button" href="/marketplace">
              Nueva solicitud <ArrowUpRight size={17} />
            </Link>
          ) : undefined
        }
      />
      <div className="results-toolbar">
        <span>{requests.length} solicitudes</span>
        <select
          aria-label="Filtrar cotizaciones por estado"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">Todos los estados</option>
          {["ENVIADA", "OFERTADA", "EN_NEGOCIACION", "ACEPTADA"].map((s) => (
            <option key={s} value={s}>
              {s.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </div>
      {requests.map((r) => (
        <QuoteCard request={r} base={roleBase(role)} key={r.id} />
      ))}
      {!requests.length && (
        <EmptyState
          title="Aún no hay solicitudes en esta vista"
          href={role === "buyer" ? "/marketplace" : undefined}
        />
      )}
    </>
  );
}
function OfferForm({ request }: { request: QuotationRequest }) {
  const { state, mutate } = useDemo();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const product = state.products.find((p) => p.id === request.productId);
  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Prepara tu propuesta</h2>
        <span className="tag">EUR / kg</span>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          try {
            mutate((s) =>
              issueOffer(s, request.id, {
                price: f.get("price"),
                leadDays: f.get("leadDays"),
                minimum: f.get("minimum"),
                validDays: f.get("validDays"),
                presentation: String(f.get("presentation")),
                conditions: String(f.get("conditions")),
              }),
            );
            setSuccess(true);
            setError("");
          } catch (err) {
            setError(errorMessage(err));
            setSuccess(false);
          }
        }}
      >
        <div className="form-grid">
          <FormField label="Precio por kg (€)">
            <input
              name="price"
              type="number"
              min=".01"
              max="100000"
              step=".01"
              defaultValue={product?.price ?? 4.2}
              required
            />
          </FormField>
          <FormField label="Cantidad ofertada (kg)">
            <input value={request.quantity} readOnly />
          </FormField>
          <FormField label="Entrega estimada (días)">
            <input
              name="leadDays"
              type="number"
              min="1"
              max="365"
              defaultValue="18"
              required
            />
          </FormField>
          <FormField label="Vigencia (días)">
            <input
              name="validDays"
              type="number"
              min="1"
              max="90"
              defaultValue="7"
              required
            />
          </FormField>
          <FormField label="Pedido mínimo (kg)">
            <input
              name="minimum"
              type="number"
              min="1"
              max={request.quantity}
              defaultValue={Math.min(product?.minimum ?? 100, request.quantity)}
              required
            />
          </FormField>
          <FormField label="Presentación">
            <input
              name="presentation"
              defaultValue={product?.presentation ?? "Caja de 10 kg"}
              required
              maxLength={120}
            />
          </FormField>
        </div>
        <FormField label="Condiciones comerciales">
          <textarea
            name="conditions"
            required
            minLength={3}
            maxLength={2000}
            defaultValue="Condiciones DEMO. Transporte e impuestos no incluidos; pendientes de acuerdo."
          />
        </FormField>
        {error && <Notice error>{error}</Notice>}
        {success && (
          <Notice>
            Oferta enviada. El comprador ya puede revisarla en su espacio.
          </Notice>
        )}
        <button className="button">
          <Send size={16} />
          Enviar oferta
        </button>
        <p className="demo-note">
          Enviar otra propuesta crea una nueva revisión y sustituye la anterior.
        </p>
      </form>
    </section>
  );
}
export function QuotationDetail({
  role,
  id,
  compare = false,
}: {
  role: Role;
  id: string;
  compare?: boolean;
}) {
  const { state, mutate } = useDemo();
  const router = useRouter();
  const [error, setError] = useState("");
  const [accept, setAccept] = useState<QuotationOffer | null>(null);
  const request = visibleRequests(state).find((r) => r.id === id);
  const base = roleBase(role);
  if (!request)
    return (
      <EmptyState
        title="Solicitud no disponible para este perfil"
        href={base + "/quotations"}
        label="Volver a cotizaciones"
      />
    );
  const product = state.products.find((p) => p.id === request.productId);
  const offers = state.offers.filter(
    (o) =>
      o.requestId === id &&
      (role !== "supplier" || o.supplierId === state.session?.organizationId) &&
      o.status !== "SUSTITUIDA",
  );
  const order = state.orders.find((o) => o.requestId === id);
  const activeOffers = offers.filter(
    (o) => o.status === "EMITIDA" || o.status === "ACEPTADA",
  );
  function action(fn: () => void) {
    try {
      fn();
      setError("");
    } catch (e) {
      setError(errorMessage(e));
    }
  }
  function negotiation(offer: QuotationOffer) {
    action(() => {
      const conversation = mutate((s) => {
        negotiate(s, id);
        return startConversation(s, offer.supplierId);
      });
      router.push("/dashboard/messages?conversation=" + conversation);
    });
  }
  function offerButtons(o: QuotationOffer) {
    const expired = new Date(o.validUntil) < new Date();
    return role === "buyer" &&
      request?.status !== "ACEPTADA" &&
      o.status === "EMITIDA" ? (
      <div className="button-row">
        <button
          className="button button-small"
          disabled={expired}
          onClick={() => setAccept(o)}
        >
          {expired ? "Oferta vencida" : "Aceptar oferta"}
        </button>
        <button
          className="button button-outline button-small"
          onClick={() => negotiation(o)}
        >
          Negociar
        </button>
        <button
          className="table-action"
          onClick={() => action(() => mutate((s) => rejectOffer(s, o.id)))}
        >
          Rechazar
        </button>
      </div>
    ) : null;
  }
  return (
    <>
      <PageHeader
        eyebrow={request.code}
        title={
          compare
            ? "Compara con tus propios criterios."
            : (product?.name ?? "Solicitud de cotización")
        }
        description={
          compare
            ? "Revisa condiciones, plazos y precios. La decisión es tuya."
            : "Cada detalle cuenta para construir un buen acuerdo."
        }
        action={
          <Link className="text-link" href={base + "/quotations"}>
            <ArrowLeft size={14} />
            Cotizaciones
          </Link>
        }
      />
      {error && <Notice error>{error}</Notice>}
      <div className="summary-strip">
        <span>
          Cantidad<b>{request.quantity} kg</b>
        </span>
        <span>
          Destino
          <b>
            {request.city}, {request.country}
          </b>
        </span>
        <span>
          Fecha requerida<b>{dateLabel(request.requiredDate)}</b>
        </span>
        <span>
          Estado
          <b>
            <StatusBadge status={request.status} />
          </b>
        </span>
      </div>
      {order && (
        <Notice>
          Esta solicitud ya generó el pedido{" "}
          <Link className="text-link" href={base + "/orders/" + order.id}>
            {order.code}
          </Link>
          .
        </Notice>
      )}
      {compare ? (
        <>
          <div className="panel table-scroll">
            <table className="compare-table">
              <thead>
                <tr>
                  <th>Tu comparación</th>
                  {activeOffers.map((o) => (
                    <th key={o.id}>
                      <h3>
                        {
                          state.organizations.find((s) => s.id === o.supplierId)
                            ?.name
                        }
                      </h3>
                      <span className="demo-caption">Proveedor ficticio</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Precio por kg", ...activeOffers.map((o) => money(o.price))],
                  [
                    "Importe de producto",
                    ...activeOffers.map((o) => money(o.price * o.quantity)),
                  ],
                  ["Cantidad", ...activeOffers.map((o) => o.quantity + " kg")],
                  ["Presentación", ...activeOffers.map((o) => o.presentation)],
                  [
                    "Pedido mínimo",
                    ...activeOffers.map((o) => o.minimum + " kg"),
                  ],
                  [
                    "Entrega estimada",
                    ...activeOffers.map((o) => o.leadDays + " días"),
                  ],
                  [
                    "Certificaciones DEMO",
                    ...activeOffers.map(
                      (o) =>
                        state.organizations
                          .find((s) => s.id === o.supplierId)
                          ?.certifications.join(", ") || "Sin declarar",
                    ),
                  ],
                  [
                    "Vigencia",
                    ...activeOffers.map((o) => dateLabel(o.validUntil)),
                  ],
                  ["Condiciones", ...activeOffers.map((o) => o.conditions)],
                ].map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j} className={i === 0 && j ? "price" : ""}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td>Tu siguiente paso</td>
                  {activeOffers.map((o) => (
                    <td key={o.id}>
                      <Link
                        className="text-link"
                        href={base + "/quotations/" + id + "#" + o.id}
                      >
                        Ver oferta <ArrowUpRight size={14} />
                      </Link>
                      {offerButtons(o)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
            {!activeOffers.length && (
              <EmptyState title="Todavía no hay ofertas para comparar" />
            )}
          </div>
          <p className="demo-note">
            Importes en EUR. Transporte e impuestos no incluidos salvo acuerdo
            explícito. No se asigna un ganador automáticamente.
          </p>
        </>
      ) : (
        <div className="quote-layout">
          <div>
            <section className="panel">
              <h2 style={{ fontSize: 20 }}>Lo que necesita el comprador</h2>
              <p className="muted" style={{ marginTop: 15 }}>
                {request.comments || "Sin requisitos adicionales."}
              </p>
              <p className="demo-note">
                {
                  state.organizations.find((o) => o.id === request.buyerId)
                    ?.name
                }{" "}
                · Empresa ficticia
              </p>
            </section>
            <div className="panel-heading">
              <h2>
                {role === "supplier" ? "Tus propuestas" : "Ofertas recibidas"}
              </h2>
              {role === "buyer" && activeOffers.length > 1 && (
                <Link
                  className="text-link"
                  href={base + "/quotations/" + id + "/compare"}
                >
                  <GitCompareArrows size={16} />
                  Comparar ofertas
                </Link>
              )}
            </div>
            {offers.map((o) => (
              <article className="offer-card" id={o.id} key={o.id}>
                <div className="row-between">
                  <h3>
                    {
                      state.organizations.find((s) => s.id === o.supplierId)
                        ?.name
                    }
                  </h3>
                  <StatusBadge status={o.status} />
                </div>
                <div className="price">
                  {money(o.price)}
                  <small>
                    {" "}
                    / kg · {money(o.price * o.quantity)} de producto
                  </small>
                </div>
                <p>
                  {o.quantity} kg · {o.presentation} · Entrega estimada:{" "}
                  {o.leadDays} días
                </p>
                <p>
                  Pedido mínimo: {o.minimum} kg · Vigente hasta{" "}
                  {dateLabel(o.validUntil)} · Revisión {o.revision}
                </p>
                <p style={{ marginTop: 12 }}>{o.conditions}</p>
                {offerButtons(o)}
              </article>
            ))}
            {!offers.length && (
              <EmptyState
                title="La conversación acaba de empezar"
                description="El proveedor puede entrar a su espacio y enviar una oferta para esta solicitud."
              />
            )}
          </div>
          <aside>
            {role === "supplier" && request.status !== "ACEPTADA" ? (
              <OfferForm request={request} />
            ) : (
              <section className="panel">
                <p className="eyebrow">TU OPERACIÓN, PASO A PASO</p>
                <h3>Elige con toda la información.</h3>
                <p className="muted" style={{ marginTop: 15 }}>
                  Revisa la presentación, el plazo y las condiciones antes de
                  aceptar. Una aceptación creará un pedido DEMO con los términos
                  de la oferta.
                </p>
                {role === "buyer" && request.status !== "ACEPTADA" && (
                  <Link
                    className="button button-outline"
                    style={{ marginTop: 20 }}
                    href={"/login?role=supplier&org=" + request.supplierIds[0]}
                  >
                    Continuar como proveedor
                  </Link>
                )}
              </section>
            )}
          </aside>
        </div>
      )}
      {accept && (
        <Modal title="Confirmar aceptación" onClose={() => setAccept(null)}>
          <p>
            Aceptarás {accept.quantity} kg por{" "}
            {money(accept.price * accept.quantity)} de producto. Transporte e
            impuestos: según las condiciones indicadas.
          </p>
          <Notice>
            Se creará un pedido DEMO. No se realizará ningún cobro.
          </Notice>
          <p>{accept.conditions}</p>
          {error && <Notice error>{error}</Notice>}
          <div className="button-row">
            <button
              className="button button-outline"
              onClick={() => setAccept(null)}
            >
              Volver
            </button>
            <button
              className="button"
              onClick={() =>
                action(() => {
                  const orderId = mutate((s) => acceptOffer(s, accept.id));
                  setAccept(null);
                  router.push("/dashboard/orders/" + orderId);
                })
              }
            >
              Aceptar y crear pedido
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
