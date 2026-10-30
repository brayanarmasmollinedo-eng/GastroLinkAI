"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import type { Product } from "@/domain/types";
import { useDemo } from "@/components/demo-provider";
import { FormField, Notice } from "@/components/ui";
import { createRequest } from "@/services/quotation-service";
import { errorMessage } from "@/domain/validation";
export function RequestForm({
  product,
  initial,
}: {
  product: Product;
  initial?: {
    quantity: number | null;
    city: string | null;
    country: string | null;
    requiredDate: string | null;
    comments: string;
  };
}) {
  const { state, mutate } = useDemo();
  const [error, setError] = useState("");
  const [created, setCreated] = useState("");
  const [minDate] = useState(() =>
    new Date(Date.now() + 86400000).toISOString().slice(0, 10),
  );
  const buyer = state.organizations.find(
    (o) => o.id === state.session?.organizationId,
  );
  if (created)
    return (
      <div className="empty-state">
        <CheckCircle2 size={40} />
        <h3>Solicitud enviada</h3>
        <p>
          El proveedor podrá revisar tu solicitud y enviarte una propuesta
          comercial.
        </p>
        <Link className="button" href={"/dashboard/quotations/" + created}>
          Ver mi solicitud <ArrowUpRight size={17} />
        </Link>
        <Link
          className="text-link"
          href={"/login?role=supplier&org=" + product.supplierId}
        >
          Continuar demo como proveedor
        </Link>
      </div>
    );
  if (state.session?.role !== "buyer")
    return (
      <div>
        <Notice>
          Entra como restaurante o comprador para enviar una solicitud de
          demostración.
        </Notice>
        <Link
          className="button"
          href={
            "/login?next=" +
            encodeURIComponent("/products/" + product.slug + "?quote=1")
          }
        >
          Entrar como comprador
        </Link>
      </div>
    );
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError("");
        const f = new FormData(e.currentTarget);
        try {
          setCreated(
            mutate((s) =>
              createRequest(s, {
                productId: product.id,
                quantity: f.get("quantity"),
                city: String(f.get("city")),
                country: String(f.get("country")),
                requiredDate: String(f.get("date")),
                comments: String(f.get("comments")),
              }),
            ),
          );
        } catch (err) {
          setError(errorMessage(err));
        }
      }}
    >
      <p className="muted" style={{ marginBottom: 20 }}>
        {product.name} · {product.presentation}
      </p>
      <div className="form-grid">
        <FormField
          label="Cantidad (kg)"
          hint={"Pedido mínimo: " + product.minimum + " kg"}
        >
          <input
            name="quantity"
            type="number"
            min={product.minimum}
            max={1000000}
            step="0.01"
            defaultValue={
              initial
                ? (initial.quantity ?? "")
                : Math.max(200, product.minimum)
            }
            required
          />
        </FormField>
        <FormField label="Unidad">
          <input value="Kilogramos (kg)" readOnly />
        </FormField>
        <FormField label="Ciudad destino">
          <input
            name="city"
            defaultValue={
              initial ? (initial.city ?? "") : (buyer?.city ?? "Madrid")
            }
            required
            maxLength={100}
          />
        </FormField>
        <FormField label="País destino">
          <input
            name="country"
            defaultValue={
              initial ? (initial.country ?? "") : (buyer?.country ?? "España")
            }
            required
            maxLength={100}
          />
        </FormField>
        <FormField label="Fecha requerida">
          <input
            name="date"
            type="date"
            required
            min={minDate}
            defaultValue={initial?.requiredDate ?? ""}
          />
        </FormField>
      </div>
      <FormField label="Comentarios y requisitos adicionales">
        <textarea
          name="comments"
          defaultValue={initial?.comments ?? ""}
          maxLength={2000}
          placeholder="Presentación, condiciones de entrega, requisitos de tu negocio…"
        />
      </FormField>
      {error && <Notice error>{error}</Notice>}
      <button className="button" type="submit">
        Enviar solicitud <ArrowUpRight size={16} />
      </button>
      <p className="demo-note">
        Operación DEMO. No se envía email ni se contacta a empresas reales.
      </p>
    </form>
  );
}
