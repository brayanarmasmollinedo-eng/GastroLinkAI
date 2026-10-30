"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  ArrowUpRight,
  MapPin,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import { PublicShell } from "@/components/site-shell";
import { ProductCard, SupplierCard } from "@/components/catalog-cards";
import {
  EmptyState,
  PageHeader,
  Modal,
  money,
  LoadingState,
  Notice,
} from "@/components/ui";
import { useDemo } from "@/components/demo-provider";
import { ProductService, SupplierService } from "@/services/catalog-service";
import { RequestForm } from "@/modules/quotations/request-form";
import { startConversation } from "@/services/message-service";
import { errorMessage } from "@/domain/validation";
import { categories } from "@/data/catalog";
export function ProductDetail({ slug }: { slug: string }) {
  const { state, ready } = useDemo();
  const params = useSearchParams();
  const [quote, setQuote] = useState(params.get("quote") === "1");
  const product = new ProductService(state).find(slug);
  const supplier = state.organizations.find(
    (o) => o.id === product?.supplierId,
  );
  if (!ready)
    return (
      <PublicShell>
        <LoadingState />
      </PublicShell>
    );
  if (!product || !supplier)
    return (
      <PublicShell>
        <EmptyState title="Producto no disponible" href="/marketplace" />
      </PublicShell>
    );
  return (
    <PublicShell>
      <div className="container">
        <nav className="breadcrumb">
          <Link href="/marketplace">Marketplace</Link>
          <ChevronRight size={14} />
          <span>{product.name}</span>
        </nav>
        <div className="detail-grid">
          <div>
            <img
              className="detail-image"
              src={product.image}
              alt={product.name + " · fotografía ilustrativa"}
            />
            <div className="detail-thumbs">
              <img src={product.image} alt="Vista principal" />
            </div>
            <small className="demo-caption">
              Fotografía ilustrativa. La presentación comercial se acuerda en la
              oferta.
            </small>
          </div>
          <div className="product-detail">
            <p className="eyebrow">PERÚ · {product.region.toUpperCase()}</p>
            <h1>{product.name}</h1>
            <Link href={"/suppliers/" + supplier.slug} className="text-link">
              {supplier.name} <ArrowUpRight size={15} />
            </Link>
            <p style={{ marginTop: 20 }}>{product.description}</p>
            <div className="detail-price">
              {money(product.price)} <small>/ kg · precio referencial</small>
            </div>
            <dl className="detail-specs">
              {[
                ["Presentación", product.presentation],
                ["Pedido mínimo", product.minimum + " kg"],
                [
                  "Disponibilidad",
                  product.stock
                    ? product.stock.toLocaleString("es-ES") + " kg en stock"
                    : "Bajo pedido",
                ],
                [
                  "Capacidad de suministro",
                  product.capacity.toLocaleString("es-ES") + " kg / mes",
                ],
                ["Entrega estimada", product.leadDays + " días"],
                ["Unidad de medida", "Kilogramo (kg)"],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <div className="tag-row">
              {product.certifications.map((c) => (
                <span className="tag" key={c}>
                  {c} · demo
                </span>
              ))}
            </div>
            <button className="button" onClick={() => setQuote(true)}>
              Solicitar cotización <ArrowUpRight size={18} />
            </button>
            <small className="demo-caption">
              Transporte e impuestos pendientes de acuerdo. Sin obligación de
              compra.
            </small>
          </div>
        </div>
        <div className="detail-supplier">
          <span className={"company-avatar " + supplier.color}>
            {supplier.initials}
          </span>
          <div style={{ flex: 1 }}>
            <h3>{supplier.name}</h3>
            <p className="muted">
              Perfil de demostración · {supplier.city}, Perú
            </p>
          </div>
          <Link
            className="button button-outline"
            href={"/suppliers/" + supplier.slug}
          >
            Ver proveedor <ArrowUpRight size={16} />
          </Link>
        </div>
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="section-heading">
            <h2>Más ingredientes, nuevas ideas.</h2>
          </div>
          <div className="product-grid">
            {new ProductService(state)
              .list()
              .filter((p) => p.id !== product.id)
              .slice(0, 4)
              .map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
          </div>
        </section>
      </div>
      {quote && (
        <Modal title="Solicitar cotización" onClose={() => setQuote(false)}>
          <RequestForm product={product} />
        </Modal>
      )}
    </PublicShell>
  );
}
export function Suppliers({ slug }: { slug?: string }) {
  const { state, mutate, ready } = useDemo();
  const router = useRouter();
  const [error, setError] = useState("");
  const service = new SupplierService(state);
  const supplier = slug ? service.find(slug) : undefined;
  if (!ready)
    return (
      <PublicShell>
        <LoadingState />
      </PublicShell>
    );
  if (slug && !supplier)
    return (
      <PublicShell>
        <EmptyState
          title="Proveedor no disponible"
          href="/suppliers"
          label="Ver proveedores"
        />
      </PublicShell>
    );
  return (
    <PublicShell>
      <div className="container" style={{ paddingBottom: 60 }}>
        {supplier ? (
          <>
            <nav className="breadcrumb">
              <Link href="/suppliers">Proveedores</Link>
              <ChevronRight size={14} />
              <span>{supplier.name}</span>
            </nav>
            <div className="supplier-hero">
              <div className="supplier-hero-top">
                <span className={"company-avatar " + supplier.color}>
                  {supplier.initials}
                </span>
                <div>
                  <p className="eyebrow">PERFIL DE DEMOSTRACIÓN</p>
                  <h1>{supplier.name}</h1>
                  <p className="supplier-location">
                    <MapPin size={14} />
                    {supplier.city}, {supplier.country}
                  </p>
                </div>
              </div>
              <p>{supplier.description}</p>
              <div className="supplier-facts">
                <div>
                  <b>{supplier.years} años</b>Experiencia DEMO
                </div>
                <div>
                  <b>{supplier.markets.join(" · ")}</b>Mercados atendidos DEMO
                </div>
                <div>
                  <b>
                    {
                      state.products.filter(
                        (p) => p.supplierId === supplier.id && p.published,
                      ).length
                    }
                  </b>
                  Productos publicados
                </div>
                {supplier.monthlyCapacityKg !== undefined && (
                  <div>
                    <b>
                      {supplier.monthlyCapacityKg.toLocaleString("es-ES")} kg
                    </b>
                    Capacidad mensual DEMO
                  </div>
                )}
              </div>
              <div className="tag-row">
                {(supplier.categoryIds ?? []).map((id) => (
                  <span className="tag" key={id}>
                    {categories.find((c) => c.id === id)?.name ?? id}
                  </span>
                ))}
                {supplier.certifications.map((c) => (
                  <span className="tag" key={c}>
                    {c} · certificación DEMO
                  </span>
                ))}
              </div>
              <button
                className="button"
                onClick={() => {
                  if (state.session?.role !== "buyer") {
                    router.push(
                      "/login?next=" +
                        encodeURIComponent("/suppliers/" + supplier.slug),
                    );
                    return;
                  }
                  try {
                    const id = mutate((s) => startConversation(s, supplier.id));
                    router.push("/dashboard/messages?conversation=" + id);
                  } catch (e) {
                    setError(errorMessage(e));
                  }
                }}
              >
                <MessageSquare size={16} />
                Solicitar información
              </button>
              {error && <Notice error>{error}</Notice>}
              <small className="demo-caption">
                Empresa ficticia. Los datos de experiencia, mercados y
                certificaciones no acreditan una verificación real.
              </small>
            </div>
            <div className="section-heading">
              <h2>Su selección de ingredientes.</h2>
            </div>
            <div className="product-grid">
              {new ProductService(state)
                .list({ supplier: supplier.id })
                .map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
            </div>
          </>
        ) : (
          <>
            <PageHeader
              eyebrow="PERSONAS DETRÁS DEL ORIGEN"
              title="Tus próximos aliados comerciales."
              description="Conoce proveedores peruanos y encuentra la conexión que tu negocio necesita."
            />
            <div className="supplier-grid">
              {service.list().map((s) => (
                <SupplierCard key={s.id} supplier={s} />
              ))}
            </div>
            <p className="demo-note">
              Todas las empresas de este directorio son ficticias y forman parte
              del prototipo.
            </p>
          </>
        )}
      </div>
    </PublicShell>
  );
}
