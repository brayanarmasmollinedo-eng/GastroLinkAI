"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Check, ArrowLeft } from "lucide-react";
import { useDemo } from "@/components/demo-provider";
import {
  EmptyState,
  PageHeader,
  StatusBadge,
  money,
  dateLabel,
  FormField,
  Notice,
} from "@/components/ui";
import { roleBase } from "@/components/workspace-shell";
import { visibleOrders, advanceOrder } from "@/services/order-service";
import { errorMessage } from "@/domain/validation";
import { orderStates, type Role, type Order } from "@/domain/types";
export function OrderCard({ order, base }: { order: Order; base: string }) {
  return (
    <article className="operation-card">
      <div className="row-between">
        <span className="code">{order.code}</span>
        <StatusBadge status={order.status} />
      </div>
      <h3>{order.productName}</h3>
      <p>
        {order.quantity} kg · {money(order.price * order.quantity)} ·{" "}
        {order.city}, {order.country}
      </p>
      <div className="button-row">
        <Link className="text-link" href={base + "/orders/" + order.id}>
          Ver seguimiento <ArrowUpRight size={15} />
        </Link>
      </div>
    </article>
  );
}
export default function OrderPages({ role, id }: { role: Role; id?: string }) {
  const { state, mutate } = useDemo();
  const [error, setError] = useState("");
  const orders = visibleOrders(state);
  const order = orders.find((o) => o.id === id);
  const base = roleBase(role);
  if (id && !order)
    return (
      <EmptyState
        title="Pedido no disponible para este perfil"
        href={base + "/orders"}
        label="Ver pedidos"
      />
    );
  return (
    <>
      <PageHeader
        eyebrow="DEL ACUERDO A LA ENTREGA"
        title={order ? order.code : "Tus pedidos, siempre a mano."}
        description={
          order
            ? "Sigue cada paso de esta operación de demostración."
            : "Cada pedido tiene su propia historia. Aquí puedes acompañarla."
        }
        action={
          order ? (
            <Link className="text-link" href={base + "/orders"}>
              <ArrowLeft size={14} />
              Pedidos
            </Link>
          ) : undefined
        }
      />
      {!id ? (
        <>
          {orders.map((o) => (
            <OrderCard order={o} base={base} key={o.id} />
          ))}
          {!orders.length && (
            <EmptyState
              title="Todavía no hay pedidos"
              description="Acepta una oferta desde el espacio comprador para crear tu primer pedido."
              href={base + "/quotations"}
              label="Ver cotizaciones"
            />
          )}
        </>
      ) : (
        order && (
          <>
            <div className="summary-strip">
              <span>
                Producto<b>{order.productName}</b>
              </span>
              <span>
                Cantidad<b>{order.quantity} kg</b>
              </span>
              <span>
                Importe producto<b>{money(order.price * order.quantity)}</b>
              </span>
              <span>
                Destino
                <b>
                  {order.city}, {order.country}
                </b>
              </span>
            </div>
            <div className="quote-layout">
              <section className="panel">
                <div className="panel-heading">
                  <h2>Seguimiento de tu pedido</h2>
                  <StatusBadge status={order.status} />
                </div>
                <div className="timeline">
                  {orderStates.map((status, i) => {
                    const history = order.history.find(
                      (h) => h.status === status,
                    );
                    const done = i <= orderStates.indexOf(order.status);
                    return (
                      <div
                        className={"timeline-item " + (done ? "done" : "")}
                        key={status}
                      >
                        <span className="timeline-dot">
                          {done && <Check size={12} />}
                        </span>
                        <b>{status.replaceAll("_", " ").toLowerCase()}</b>
                        {history && (
                          <>
                            <small>
                              {dateLabel(history.at)} ·{" "}
                              {state.users.find((u) => u.id === history.actorId)
                                ?.name ?? "Perfil demo"}
                            </small>
                            <small>{history.note}</small>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="demo-note">
                  Seguimiento manual simulado. No está conectado a operadores
                  logísticos.
                </p>
              </section>
              <aside>
                <section className="panel">
                  <h3>Condiciones acordadas</h3>
                  <dl className="detail-specs">
                    <div>
                      <dt>Proveedor</dt>
                      <dd>
                        {
                          state.organizations.find(
                            (o) => o.id === order.supplierId,
                          )?.name
                        }
                      </dd>
                    </div>
                    <div>
                      <dt>Comprador</dt>
                      <dd>
                        {
                          state.organizations.find(
                            (o) => o.id === order.buyerId,
                          )?.name
                        }
                      </dd>
                    </div>
                    <div>
                      <dt>Presentación</dt>
                      <dd>{order.presentation}</dd>
                    </div>
                    <div>
                      <dt>Precio acordado</dt>
                      <dd>{money(order.price)} / kg</dd>
                    </div>
                  </dl>
                  <p className="muted">
                    {
                      state.offers.find((o) => o.id === order.offerId)
                        ?.conditions
                    }
                  </p>
                  <small className="demo-caption">
                    Los datos del producto y precio se conservan aunque cambie
                    el catálogo.
                  </small>
                </section>
                {role === "supplier" && order.status !== "ENTREGADO" && (
                  <section className="panel">
                    <h3>Actualizar seguimiento</h3>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        try {
                          const f = new FormData(e.currentTarget);
                          mutate((s) =>
                            advanceOrder(s, order.id, String(f.get("note"))),
                          );
                          setError("");
                          e.currentTarget.reset();
                        } catch (err) {
                          setError(errorMessage(err));
                        }
                      }}
                    >
                      <FormField label="Observación">
                        <textarea
                          name="note"
                          placeholder="Añade información sobre esta etapa…"
                          maxLength={500}
                        />
                      </FormField>
                      {error && <Notice error>{error}</Notice>}
                      <button className="button">
                        Avanzar a{" "}
                        {orderStates[orderStates.indexOf(order.status) + 1]
                          ?.replaceAll("_", " ")
                          .toLowerCase()}
                      </button>
                    </form>
                  </section>
                )}
                {role === "buyer" && (
                  <Link
                    className="text-link"
                    href={"/login?role=supplier&org=" + order.supplierId}
                  >
                    Simular avance como proveedor <ArrowUpRight size={15} />
                  </Link>
                )}
              </aside>
            </div>
          </>
        )
      )}
    </>
  );
}
