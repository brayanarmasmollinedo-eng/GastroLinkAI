"use client";
import Link from "next/link";
import { ArrowUpRight, Heart, MapPin, Bookmark } from "lucide-react";
import type { Organization, Product } from "@/domain/types";
import { useDemo } from "./demo-provider";
import { money } from "./ui";
import { useRouter } from "next/navigation";
export function ProductCard({ product }: { product: Product }) {
  const { state, mutate } = useDemo();
  const router = useRouter();
  const supplier = state.organizations.find((o) => o.id === product.supplierId);
  const key =
    state.session?.organizationId +
    ":" +
    state.session?.userId +
    ":" +
    product.id;
  const favorite = state.favorites.includes(key);
  function toggle() {
    if (state.session?.role !== "buyer") {
      router.push("/login?next=/marketplace");
      return;
    }
    mutate((s) => {
      s.favorites = favorite
        ? s.favorites.filter((id) => id !== key)
        : [...s.favorites, key];
    });
  }
  return (
    <article className="product-card">
      <div className="product-image">
        <Link href={"/products/" + product.slug}>
          <img
            src={product.image}
            alt={product.name + " · fotografía referencial"}
            loading="lazy"
          />
        </Link>
        <span className="origin-tag">
          PERÚ · {product.region.toUpperCase()}
        </span>
        <button
          onClick={toggle}
          aria-label={favorite ? "Quitar de favoritos" : "Guardar en favoritos"}
          aria-pressed={favorite}
          className={"favorite-button " + (favorite ? "selected" : "")}
        >
          <Heart size={18} fill={favorite ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="product-content">
        <div className="product-supplier">{supplier?.name}</div>
        <Link href={"/products/" + product.slug}>
          <h3>{product.name}</h3>
        </Link>
        <p className="product-spec">
          {product.presentation} <span>·</span> Mín. {product.minimum} kg
        </p>
        <div className="product-price">
          <div>
            <strong>{money(product.price)}</strong>
            <span> / kg</span>
            <small>Precio referencial</small>
          </div>
          <span
            className={"availability " + (!product.stock ? "unavailable" : "")}
          >
            {product.stock ? "Disponible" : "Bajo pedido"}
          </span>
        </div>
        <Link
          className="product-cta"
          href={"/products/" + product.slug + "?quote=1"}
        >
          Solicitar cotización <ArrowUpRight size={17} />
        </Link>
      </div>
    </article>
  );
}
export function SupplierCard({ supplier }: { supplier: Organization }) {
  const { state, mutate } = useDemo();
  const router = useRouter();
  const key =
    state.session?.organizationId +
    ":" +
    state.session?.userId +
    ":" +
    supplier.id;
  const saved = state.savedSuppliers.includes(key);
  return (
    <article className="supplier-card">
      <div className="row-between">
        <span className={"company-avatar " + supplier.color}>
          {supplier.initials}
        </span>
        <button
          className="icon-button"
          aria-label={
            saved ? "Dejar de guardar proveedor" : "Guardar proveedor"
          }
          aria-pressed={saved}
          onClick={() => {
            if (state.session?.role !== "buyer") return router.push("/login");
            mutate((s) => {
              s.savedSuppliers = saved
                ? s.savedSuppliers.filter((v) => v !== key)
                : [...s.savedSuppliers, key];
            });
          }}
        >
          <Bookmark size={19} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <p className="supplier-location">
        <MapPin size={13} />
        {supplier.city}, {supplier.country}
      </p>
      <h3>{supplier.name}</h3>
      <p>Ingredientes con origen. Relaciones que crecen.</p>
      <div className="tag-row">
        {supplier.certifications.map((c) => (
          <span className="tag" key={c}>
            {c} · demo
          </span>
        ))}
      </div>
      <Link href={"/suppliers/" + supplier.slug} className="text-link">
        Conocer proveedor <ArrowUpRight size={16} />
      </Link>
      <small className="demo-caption">Perfil de demostración</small>
    </article>
  );
}
