"use client";
import Link from "next/link";
import {
  FileText,
  Package,
  Store,
  Bookmark,
  ArrowUpRight,
  Users,
  Building2,
} from "lucide-react";
import { useDemo } from "@/components/demo-provider";
import {
  PageHeader,
  DashboardMetric,
  EmptyState,
  dateLabel,
  StatusBadge,
} from "@/components/ui";
import { ProductCard } from "@/components/catalog-cards";
import { roleBase } from "@/components/workspace-shell";
import { visibleRequests } from "@/services/quotation-service";
import { visibleOrders } from "@/services/order-service";
import { ProductService } from "@/services/catalog-service";
import type { Role } from "@/domain/types";
export default function Dashboard({ role }: { role: Role }) {
  const { state } = useDemo();
  const org = state.organizations.find(
    (o) => o.id === state.session?.organizationId,
  );
  const base = roleBase(role);
  const requests = visibleRequests(state);
  const orders = visibleOrders(state);
  const offers = state.offers.filter(
    (o) =>
      requests.some((r) => r.id === o.requestId) &&
      o.status === "EMITIDA" &&
      (role !== "supplier" || o.supplierId === org?.id),
  );
  const products =
    role === "supplier"
      ? state.products.filter((p) => p.supplierId === org?.id)
      : new ProductService(state).list();
  const suppliers = state.organizations.filter((o) => o.kind === "supplier");
  const savedPrefix = org?.id + ":" + state.session?.userId + ":";
  const metrics =
    role === "admin"
      ? [
          ["Usuarios", state.users.length, Users],
          ["Proveedores", suppliers.length, Building2],
          [
            "Productos",
            state.products.filter((p) => p.published).length,
            Store,
          ],
          [
            "Pedidos activos",
            orders.filter((o) => o.status !== "ENTREGADO").length,
            Package,
          ],
        ]
      : role === "supplier"
        ? [
            [
              "Solicitudes nuevas",
              requests.filter((r) => r.status === "ENVIADA").length,
              FileText,
            ],
            ["Cotizaciones enviadas", offers.length, FileText],
            [
              "Pedidos activos",
              orders.filter((o) => o.status !== "ENTREGADO").length,
              Package,
            ],
            [
              "Productos publicados",
              products.filter((p) => p.published).length,
              Store,
            ],
          ]
        : [
            [
              "Cotizaciones activas",
              requests.filter((r) => r.status !== "ACEPTADA").length,
              FileText,
            ],
            ["Ofertas recibidas", offers.length, FileText],
            [
              "Pedidos activos",
              orders.filter((o) => o.status !== "ENTREGADO").length,
              Package,
            ],
            [
              "Proveedores guardados",
              state.savedSuppliers.filter((k) => k.startsWith(savedPrefix))
                .length,
              Bookmark,
            ],
          ];
  return (
    <>
      <PageHeader
        eyebrow={
          role === "admin"
            ? "VISIÓN GENERAL DE LA PLATAFORMA"
            : "CADA CONEXIÓN, UNA NUEVA OPORTUNIDAD"
        }
        title={
          role === "admin"
            ? "Todo tu ecosistema, en un lugar."
            : "Bienvenido, " + (org?.name ?? "equipo")
        }
        description={
          role === "buyer"
            ? "Encuentra el próximo ingrediente de tu éxito."
            : role === "supplier"
              ? "Haz crecer tus conexiones y acompaña cada pedido."
              : "Actividad y gestión del entorno de demostración."
        }
        action={
          <Link
            className="button"
            href={
              role === "buyer"
                ? "/marketplace"
                : role === "supplier"
                  ? "/supplier/products"
                  : "/admin/verifications"
            }
          >
            {role === "buyer"
              ? "Explorar productos"
              : role === "supplier"
                ? "Gestionar productos"
                : "Ver verificaciones"}
            <ArrowUpRight size={17} />
          </Link>
        }
      />
      <div className="metrics">
        {metrics.map(([label, value, Icon]) => {
          const I = Icon as typeof FileText;
          return (
            <DashboardMetric
              label={String(label)}
              value={Number(value)}
              icon={<I />}
              key={String(label)}
            />
          );
        })}
      </div>
      <div className="dashboard-columns">
        <section className="panel">
          <div className="panel-heading">
            <h2>
              {role === "supplier"
                ? "Solicitudes recientes"
                : "Últimas cotizaciones"}
            </h2>
            <Link className="text-link" href={base + "/quotations"}>
              Ver todas <ArrowUpRight size={14} />
            </Link>
          </div>
          {requests.slice(0, 3).map((r) => (
            <Link
              href={base + "/quotations/" + r.id}
              className="operation-card"
              style={{ display: "block" }}
              key={r.id}
            >
              <div className="row-between">
                <span className="code">{r.code}</span>
                <StatusBadge status={r.status} />
              </div>
              <h3>{state.products.find((p) => p.id === r.productId)?.name}</h3>
              <p>
                {r.quantity} kg · {r.city}, {r.country}
              </p>
            </Link>
          ))}
          {!requests.length && (
            <EmptyState
              title="Las nuevas solicitudes aparecerán aquí"
              description="Empieza tu próxima conexión desde el marketplace."
            />
          )}
        </section>
        <section className="panel">
          <div className="panel-heading">
            <h2>
              {role === "admin"
                ? "Proveedores pendientes"
                : "Pedidos recientes"}
            </h2>
          </div>
          {role === "admin" ? (
            suppliers
              .filter((o) => o.verification === "PENDIENTE_VERIFICACION")
              .map((o) => (
                <div className="operation-card" key={o.id}>
                  <h3>{o.name}</h3>
                  <p>{o.city} · Perfil ficticio</p>
                  <Link className="text-link" href="/admin/verifications">
                    Revisar perfil <ArrowUpRight size={14} />
                  </Link>
                </div>
              ))
          ) : orders.length ? (
            orders.slice(0, 3).map((o) => (
              <Link
                style={{ display: "block" }}
                className="operation-card"
                key={o.id}
                href={base + "/orders/" + o.id}
              >
                <div className="row-between">
                  <b>{o.code}</b>
                  <StatusBadge status={o.status} />
                </div>
                <p>{o.productName}</p>
              </Link>
            ))
          ) : (
            <EmptyState
              title="Tu próximo pedido empieza con una oferta"
              description="Acepta una propuesta para ver aquí su seguimiento."
              href={base + "/quotations"}
              label="Ver cotizaciones"
            />
          )}
        </section>
      </div>
      {role === "buyer" ? (
        <section>
          <div className="section-heading">
            <div>
              <p className="eyebrow">INSPIRACIÓN PARA TU PRÓXIMA CARTA</p>
              <h2>Ingredientes para descubrir.</h2>
            </div>
            <span className="demo-caption">
              Selección editorial DEMO · sin IA
            </span>
          </div>
          <div className="product-grid">
            {products.slice(0, 3).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : role === "supplier" ? (
        <section className="panel">
          <div className="panel-heading">
            <h2>Una mirada a tu inventario</h2>
            <Link className="text-link" href="/supplier/inventory">
              Gestionar stock <ArrowUpRight size={14} />
            </Link>
          </div>
          {products.slice(0, 4).map((p) => (
            <div
              className="row-between"
              key={p.id}
              style={{
                padding: "12px 0",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <span>{p.name}</span>
              <span className="tag">
                {p.stock.toLocaleString("es-ES")} kg disponibles
              </span>
            </div>
          ))}
          <p className="demo-note">
            {
              state.documents.filter(
                (d) => d.supplierId === org?.id && d.status === "Por vencer",
              ).length
            }{" "}
            documento(s) demo próximos a vencer.{" "}
            <Link className="text-link" href="/supplier/documents">
              Revisar documentos
            </Link>
          </p>
        </section>
      ) : (
        <section className="panel">
          <div className="panel-heading">
            <h2>Actividad reciente</h2>
            <span className="tag">
              {state.requests.length} cotizaciones generadas
            </span>
          </div>
          <ul className="activity-list">
            {state.activities.slice(0, 8).map((a) => (
              <li key={a.id}>
                {a.label}
                <small>{dateLabel(a.at)}</small>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
