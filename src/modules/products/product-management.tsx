"use client";
import { useState } from "react";
import { Plus, Pencil, Package, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useDemo } from "@/components/demo-provider";
import {
  PageHeader,
  DataTable,
  StatusBadge,
  money,
  Modal,
  FormField,
  Notice,
  EmptyState,
} from "@/components/ui";
import { categories } from "@/data/catalog";
import { saveProduct, toggleProduct } from "@/services/account-service";
import { errorMessage } from "@/domain/validation";
import type { Product } from "@/domain/types";
function ProductForm({
  product,
  onDone,
}: {
  product?: Product;
  onDone: () => void;
}) {
  const { mutate } = useDemo();
  const [error, setError] = useState("");
  const [image, setImage] = useState("");
  const preview = image || product?.image || "/images/peppers.jpg";
  async function pickImage(file: File) {
    try {
      if (
        file.size > 5 * 1024 * 1024 ||
        !["image/png", "image/jpeg", "image/webp"].includes(file.type)
      )
        throw new Error("Usa PNG, JPEG o WebP de hasta 5 MB.");
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, 800 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      canvas
        .getContext("2d")!
        .drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      setImage(canvas.toDataURL("image/jpeg", 0.8));
      setError("");
    } catch (err) {
      setError(errorMessage(err));
    }
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        try {
          mutate((s) =>
            saveProduct(
              s,
              {
                name: String(f.get("name")),
                categoryId: String(f.get("categoryId")),
                description: String(f.get("description")),
                region: String(f.get("region")),
                presentation: String(f.get("presentation")),
                price: f.get("price"),
                minimum: f.get("minimum"),
                stock: f.get("stock"),
                capacity: f.get("capacity"),
                leadDays: f.get("leadDays"),
                image,
              },
              product?.id,
            ),
          );
          onDone();
        } catch (err) {
          setError(errorMessage(err));
        }
      }}
    >
      <FormField label="Imagen del producto">
        <div className="mini-product">
          <img
            src={preview}
            alt="Vista previa"
            style={{ width: 96, height: 96, objectFit: "cover" }}
          />
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void pickImage(file);
              e.target.value = "";
            }}
          />
        </div>
      </FormField>
      <FormField label="Nombre del producto">
        <input
          name="name"
          defaultValue={product?.name}
          required
          minLength={3}
          maxLength={120}
        />
      </FormField>
      <div className="form-grid">
        <FormField label="Categoría">
          <select
            name="categoryId"
            defaultValue={product?.categoryId ?? "ajies"}
          >
            {categories.map((c) => (
              <option value={c.id} key={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Región de origen">
          <input
            name="region"
            defaultValue={product?.region ?? "Lima"}
            required
            minLength={2}
            maxLength={100}
          />
        </FormField>
        <FormField label="Presentación">
          <input
            name="presentation"
            defaultValue={product?.presentation ?? "Caja de 10 kg"}
            required
            minLength={3}
            maxLength={120}
          />
        </FormField>
        <FormField label="Precio referencial €/kg">
          <input
            name="price"
            type="number"
            step=".01"
            min=".01"
            max={100000}
            defaultValue={product?.price ?? 4.5}
            required
          />
        </FormField>
        <FormField label="Pedido mínimo (kg)">
          <input
            name="minimum"
            type="number"
            min="1"
            max={1000000}
            defaultValue={product?.minimum ?? 100}
            required
          />
        </FormField>
        <FormField label="Stock (kg)">
          <input
            name="stock"
            type="number"
            min="0"
            max={10000000}
            defaultValue={product?.stock ?? 1000}
            required
          />
        </FormField>
        <FormField label="Capacidad mensual (kg)">
          <input
            name="capacity"
            type="number"
            min="1"
            max={10000000}
            defaultValue={product?.capacity ?? 5000}
            required
          />
        </FormField>
        <FormField label="Plazo estimado (días)">
          <input
            name="leadDays"
            type="number"
            min="1"
            max="365"
            defaultValue={product?.leadDays ?? 18}
            required
          />
        </FormField>
      </div>
      <FormField label="Descripción">
        <textarea
          name="description"
          defaultValue={
            product?.description ??
            "Ingrediente peruano para cocinas profesionales. Información de demostración."
          }
          minLength={10}
          maxLength={3000}
          required
        />
      </FormField>
      {error && <Notice error>{error}</Notice>}
      <button className="button">Guardar producto</button>
      <p className="demo-note">
        Si no subes una imagen, se usa una fotografía ilustrativa. Las imágenes
        se guardan solo en este navegador (demo). Múltiples presentaciones
        pendientes para el MVP.
      </p>
    </form>
  );
}
export default function ProductManagement({
  inventory = false,
  admin = false,
}: {
  inventory?: boolean;
  admin?: boolean;
}) {
  const { state, mutate } = useDemo();
  const [edit, setEdit] = useState<Product | null | undefined>(undefined);
  const [error, setError] = useState("");
  const products = state.products.filter(
    (p) => admin || p.supplierId === state.session?.organizationId,
  );
  return (
    <>
      <PageHeader
        eyebrow="TU CATÁLOGO, TU IDENTIDAD"
        title={
          inventory
            ? "Inventario y disponibilidad."
            : admin
              ? "Catálogo de la plataforma."
              : "Ingredientes que abren puertas."
        }
        description={
          inventory
            ? "Actualiza el stock referencial y la capacidad de suministro de tus productos."
            : "Gestiona la información comercial que ven tus futuros compradores."
        }
        action={
          !admin ? (
            <button className="button" onClick={() => setEdit(null)}>
              <Plus size={17} />
              Nuevo producto
            </button>
          ) : undefined
        }
      />
      {error && <Notice error>{error}</Notice>}
      <section className="panel">
        <DataTable
          headings={
            inventory
              ? [
                  "Producto",
                  "Stock (kg)",
                  "Capacidad / mes",
                  "Disponibilidad",
                  "Acción",
                ]
              : [
                  "Producto",
                  "Presentación",
                  "Precio / kg",
                  "Estado",
                  "Acciones",
                ]
          }
        >
          {products.map((p) => (
            <tr key={p.id}>
              <td>
                <div className="mini-product">
                  <img src={p.image} alt="" />
                  <div>
                    <b>{p.name}</b>
                    {admin && (
                      <small style={{ display: "block" }}>
                        {
                          state.organizations.find((o) => o.id === p.supplierId)
                            ?.name
                        }
                      </small>
                    )}
                  </div>
                </div>
              </td>
              <td>
                {inventory ? p.stock.toLocaleString("es-ES") : p.presentation}
              </td>
              <td>
                {inventory
                  ? p.capacity.toLocaleString("es-ES") + " kg"
                  : money(p.price)}
              </td>
              <td>
                <StatusBadge
                  status={
                    inventory
                      ? p.stock
                        ? "Disponible"
                        : "Bajo pedido"
                      : p.published
                        ? "Publicado"
                        : "Archivado"
                  }
                />
              </td>
              <td>
                <div className="button-row" style={{ margin: 0 }}>
                  {!admin && (
                    <button
                      className="icon-button"
                      aria-label={"Editar " + p.name}
                      onClick={() => setEdit(p)}
                    >
                      {inventory ? <Package size={16} /> : <Pencil size={16} />}
                    </button>
                  )}
                  {p.published && (
                    <Link
                      className="icon-button"
                      href={"/products/" + p.slug}
                      aria-label={"Ver " + p.name}
                    >
                      <ArrowUpRight size={16} />
                    </Link>
                  )}
                  {!inventory && (
                    <button
                      className="table-action"
                      onClick={() => {
                        try {
                          mutate((s) => toggleProduct(s, p.id));
                          setError("");
                        } catch (err) {
                          setError(errorMessage(err));
                        }
                      }}
                    >
                      {p.published ? "Archivar" : "Publicar"}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
        {!products.length && (
          <EmptyState
            title="Tu catálogo está por comenzar"
            description="Crea tu primer producto para mostrarlo en el marketplace."
          />
        )}
      </section>
      {inventory && (
        <Notice>
          Inventario referencial DEMO: la aceptación de ofertas no reserva ni
          descuenta stock. La gestión de reservas pertenece al futuro MVP.
        </Notice>
      )}
      {edit !== undefined && (
        <Modal
          title={edit ? "Editar producto" : "Nuevo producto"}
          onClose={() => setEdit(undefined)}
        >
          <ProductForm
            product={edit ?? undefined}
            onDone={() => setEdit(undefined)}
          />
        </Modal>
      )}
    </>
  );
}
