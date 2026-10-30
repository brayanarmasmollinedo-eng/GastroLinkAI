"use client";
import { PurchaseAssistant } from "@/modules/ai/purchase-assistant";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, Sparkles, ArrowRight } from "lucide-react";
import { PublicShell } from "@/components/site-shell";
import { ProductCard } from "@/components/catalog-cards";
import { PageHeader, EmptyState, FormField } from "@/components/ui";
import { useDemo } from "@/components/demo-provider";
import { categories } from "@/data/catalog";
import {
  ProductService,
  SupplierService,
  type ProductFilters,
} from "@/services/catalog-service";
export default function Marketplace() {
  const params = useSearchParams();
  const { state } = useDemo();
  const [filters, setFilters] = useState<ProductFilters>({
    category: params.get("category") ?? "",
    search: params.get("search") ?? "",
  });
  const [sort, setSort] = useState("featured");
  const [open, setOpen] = useState(false);
  const [ai, setAi] = useState(false);

  const update = (patch: Partial<ProductFilters>) =>
    setFilters((f) => ({ ...f, ...patch }));
  const products = new ProductService(state)
    .list(filters)
    .sort((a, b) =>
      sort === "low"
        ? a.price - b.price
        : sort === "fast"
          ? a.leadDays - b.leadDays
          : 0,
    );
  const suppliers = new SupplierService(state).list();
  return (
    <PublicShell>
      <section className="market-intro">
        <div className="container">
          <PageHeader
            eyebrow="INGREDIENTES CON ORIGEN"
            title="Una despensa sin fronteras."
            description="Descubre productos peruanos y conecta con tu próximo aliado comercial."
          />
          <div className="search-bar">
            <Search size={20} />
            <input
              aria-label="Buscar productos"
              placeholder="¿Qué producto estás buscando?"
              value={filters.search ?? ""}
              onChange={(e) => update({ search: e.target.value })}
            />
          </div>
          <div className="ai-search">
            <button onClick={() => setAi(!ai)} aria-expanded={ai}>
              <Sparkles size={16} />
              GastroLink AI <ArrowRight size={14} />
            </button>
            <span>Describe lo que necesitas · Asistente de compra</span>
          </div>
          {ai && (
            <PurchaseAssistant onSearch={(search) => setFilters({ search })} />
          )}
        </div>
      </section>
      <div className="container market-layout">
        <aside className={"filter-panel " + (open ? "is-open" : "")}>
          <h3>
            <SlidersHorizontal size={17} />
            Filtrar productos
          </h3>
          <FormField label="Categoría">
            <select
              value={filters.category ?? ""}
              onChange={(e) => update({ category: e.target.value })}
            >
              <option value="">Todas las categorías</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Precio máximo / kg">
            <select
              value={filters.maxPrice ?? ""}
              onChange={(e) =>
                update({ maxPrice: Number(e.target.value) || undefined })
              }
            >
              <option value="">Cualquier precio</option>
              {[5, 10, 15].map((p) => (
                <option key={p} value={p}>
                  Hasta €{p}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Presentación">
            <select
              value={filters.presentation ?? ""}
              onChange={(e) => update({ presentation: e.target.value })}
            >
              <option value="">Todas</option>
              {Array.from(
                new Set(state.products.map((p) => p.presentation)),
              ).map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Certificación demo">
            <select
              value={filters.certification ?? ""}
              onChange={(e) => update({ certification: e.target.value })}
            >
              <option value="">Todas</option>
              <option>Orgánico</option>
              <option>HACCP</option>
            </select>
          </FormField>
          <FormField label="Proveedor">
            <select
              value={filters.supplier ?? ""}
              onChange={(e) => update({ supplier: e.target.value })}
            >
              <option value="">Todos los proveedores</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Región de origen · Perú">
            <select
              value={filters.region ?? ""}
              onChange={(e) => update({ region: e.target.value })}
            >
              <option value="">Todas las regiones</option>
              {Array.from(new Set(state.products.map((p) => p.region))).map(
                (r) => (
                  <option key={r}>{r}</option>
                ),
              )}
            </select>
          </FormField>
          <FormField label="Entrega estimada">
            <select
              value={filters.maxDays ?? ""}
              onChange={(e) =>
                update({ maxDays: Number(e.target.value) || undefined })
              }
            >
              <option value="">Cualquier plazo</option>
              <option value="14">Hasta 14 días</option>
              <option value="18">Hasta 18 días</option>
              <option value="25">Hasta 25 días</option>
            </select>
          </FormField>
          <label>
            <input
              type="checkbox"
              checked={!!filters.available}
              onChange={(e) => update({ available: e.target.checked })}
            />
            Solo disponibles
          </label>
          <button
            className="filter-reset"
            onClick={() => {
              setFilters({});
            }}
          >
            Limpiar filtros
          </button>
        </aside>
        <section>
          <div className="results-toolbar">
            <span>
              <b>{products.length}</b> productos para tu negocio
            </span>
            <button
              className="button button-outline button-small mobile-filters"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
            >
              <SlidersHorizontal size={14} />
              Filtros
            </button>
            <select
              aria-label="Ordenar productos"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="featured">Selección de origen</option>
              <option value="low">Menor precio</option>
              <option value="fast">Menor plazo de entrega</option>
            </select>
          </div>
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
            {!products.length && (
              <EmptyState
                title="No encontramos ese ingrediente"
                description="Prueba otro nombre o elimina algunos filtros."
              />
            )}
          </div>
          <p className="section-footnote">
            Empresas ficticias · Precios referenciales en EUR · Fotografías
            ilustrativas
          </p>
        </section>
      </div>
    </PublicShell>
  );
}
