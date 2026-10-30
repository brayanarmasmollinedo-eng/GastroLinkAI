"use client";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Bean,
  Cherry,
  Coffee,
  Globe2,
  Leaf,
  PackageCheck,
  Search,
  ShieldCheck,
  Snowflake,
  Sprout,
  Wheat,
  Handshake,
  Utensils,
  SlidersHorizontal,
} from "lucide-react";
import { PublicShell } from "@/components/site-shell";
import { ProductCard, SupplierCard } from "@/components/catalog-cards";
import { useDemo } from "@/components/demo-provider";
import { ProductService, SupplierService } from "@/services/catalog-service";
import { categories } from "@/data/catalog";
export const categoryIcons = [
  Sprout,
  Wheat,
  Coffee,
  Bean,
  Cherry,
  Snowflake,
  Leaf,
  Utensils,
];
export default function Landing() {
  const { state } = useDemo();
  const products = new ProductService(state).list().slice(0, 4);
  const suppliers = new SupplierService(state).list().slice(0, 3);
  return (
    <PublicShell>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="tiny-line" /> ORIGEN PERUANO. ALCANCE GLOBAL.
            </div>
            <h1>
              Productos peruanos.
              <br />
              Nuevas oportunidades <em>gastronómicas.</em>
            </h1>
            <p>
              Conectamos proveedores peruanos con restaurantes y compradores
              internacionales.
            </p>
            <div className="button-row">
              <Link className="button" href="/marketplace">
                Explorar productos <ArrowUpRight size={19} />
              </Link>
              <Link
                className="button button-outline"
                href="/register?role=supplier"
              >
                Quiero vender <ArrowRight size={18} />
              </Link>
            </div>
            <div className="hero-proof">
              <div className="stacked-avatars">
                <span>AF</span>
                <span>IH</span>
                <span>PO</span>
              </div>
              <div>
                <b>El siguiente ingrediente de tu éxito</b>
                <small>Conexiones directas, posibilidades reales.</small>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <img
              className="hero-photo"
              src="/images/hero.jpg"
              alt="Una mesa de ingredientes y gastronomía, inspiración para nuevas conexiones"
            />
            <div className="photo-shade" />
            <div className="hero-photo-title">
              <span>DE NUESTRA TIERRA</span>
              <strong>A tu próxima creación.</strong>
            </div>
            <div className="floating-origin">
              <span className="peru-mark">PE</span>
              <div>
                <b>Extraordinario por naturaleza</b>
                <small>Ingredientes con identidad peruana</small>
              </div>
              <Sprout size={25} />
            </div>
            <div className="route-badge">
              <Globe2 size={16} /> Perú <span>············→</span> España
            </div>
          </div>
        </div>
      </section>
      <div className="trust-bar">
        <div className="container trust-grid">
          <span>
            <Sprout />
            Origen que marca la diferencia
          </span>
          <span>
            <Handshake />
            Conecta directamente
          </span>
          <span>
            <SlidersHorizontal />
            Condiciones a tu medida
          </span>
          <span>
            <PackageCheck />
            Toda tu operación, en un lugar
          </span>
        </div>
      </div>
      <section className="section container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">UNA DESPENSA EXTRAORDINARIA</p>
            <h2>Encuentra tu próximo ingrediente.</h2>
          </div>
          <Link href="/marketplace" className="text-link">
            Ver marketplace <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="category-grid">
          {categories.map((c, i) => {
            const Icon = categoryIcons[i];
            return (
              <Link
                className="category-tile"
                key={c.id}
                href={"/marketplace?category=" + c.id}
              >
                <span>
                  <Icon size={27} strokeWidth={1.5} />
                </span>
                <b>{c.name}</b>
                <small>
                  Explorar <ArrowRight size={12} />
                </small>
              </Link>
            );
          })}
        </div>
      </section>
      <section className="section section-tinted">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">SELECCIÓN CON ORIGEN</p>
              <h2>De Perú, para tu negocio.</h2>
              <p>
                Descubre ingredientes que tienen mucho que aportar a tu mesa.
              </p>
            </div>
            <Link className="text-link" href="/marketplace">
              Todos los productos <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <p className="section-footnote">
            Catálogo de demostración · Precios referenciales sujetos a
            cotización · Fotografías ilustrativas
          </p>
        </div>
      </section>
      <section className="section container process-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">MENOS DISTANCIA. MÁS OPORTUNIDADES.</p>
            <h2>Del descubrimiento al primer pedido.</h2>
          </div>
          <p>
            Una forma más sencilla de conectar
            <br />
            el origen con tu negocio.
          </p>
        </div>
        <div className="steps-grid">
          {[
            [
              Search,
              "01",
              "Descubre productos",
              "Encuentra ingredientes y conoce a quienes están detrás de ellos.",
            ],
            [
              ArrowUpRight,
              "02",
              "Solicita cotizaciones",
              "Cuéntanos qué necesitas, cuánto y dónde lo necesitas.",
            ],
            [
              Handshake,
              "03",
              "Conecta con proveedores",
              "Compara propuestas y conversa sobre tus condiciones.",
            ],
            [
              PackageCheck,
              "04",
              "Gestiona tus operaciones",
              "Acepta tu oferta y sigue cada etapa de tu pedido.",
            ],
          ].map(([Icon, n, title, body]) => {
            const I = Icon as typeof Search;
            return (
              <article className="step" key={String(n)}>
                <div>
                  <I size={24} />
                  <span>{String(n)}</span>
                </div>
                <h3>{String(title)}</h3>
                <p>{String(body)}</p>
              </article>
            );
          })}
        </div>
      </section>
      <section className="section container supplier-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">PERSONAS DETRÁS DEL ORIGEN</p>
            <h2>Conoce a tus próximos aliados.</h2>
          </div>
          <Link href="/suppliers" className="text-link">
            Todos los proveedores <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="supplier-grid">
          {suppliers.map((s) => (
            <SupplierCard supplier={s} key={s.id} />
          ))}
        </div>
      </section>
      <section className="container">
        <div className="bottom-cta">
          <div>
            <p className="eyebrow">EL BUEN GUSTO NO TIENE FRONTERAS</p>
            <h2>
              Tu próxima gran conexión
              <br />
              empieza en el origen.
            </h2>
            <p>
              Forma parte de una nueva manera de hacer negocios gastronómicos.
            </p>
            <Link className="button button-cream" href="/register">
              Empezar ahora <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="cta-emblem">
            <Globe2 size={115} strokeWidth={0.7} />
            <span>PERÚ ↗ EL MUNDO</span>
          </div>
        </div>
      </section>
      <section className="container benefits">
        <span>
          <ShieldCheck size={19} />
          Información comercial en un solo lugar
        </span>
        <span>
          <Handshake size={19} />
          Relaciones directas entre empresas
        </span>
        <span>
          <Globe2 size={19} />
          Pensado para crecer contigo
        </span>
      </section>
    </PublicShell>
  );
}
