"use client";
import { useDemo } from "@/components/demo-provider";
import { ProductCard, SupplierCard } from "@/components/catalog-cards";
import { EmptyState, PageHeader } from "@/components/ui";
import { ProductService, SupplierService } from "@/services/catalog-service";
export default function FavoritesPage() {
  const { state } = useDemo();
  const prefix =
    state.session?.organizationId + ":" + state.session?.userId + ":";
  const products = new ProductService(state)
    .list()
    .filter((p) => state.favorites.includes(prefix + p.id));
  const suppliers = new SupplierService(state)
    .list()
    .filter((s) => state.savedSuppliers.includes(prefix + s.id));
  return (
    <>
      <PageHeader
        eyebrow="IDEAS PARA TU PRÓXIMA OPERACIÓN"
        title="Lo bueno, bien guardado."
        description="Tu selección personal de productos y aliados para volver cuando los necesites."
      />
      <div className="section-heading">
        <h2>Productos favoritos</h2>
      </div>
      <div className="product-grid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
        {!products.length && (
          <EmptyState
            title="Guarda ingredientes que te inspiren"
            description="Usa el corazón de cada producto para añadirlo a tu selección."
            href="/marketplace"
          />
        )}
      </div>
      <section className="section">
        <div className="section-heading">
          <h2>Proveedores guardados</h2>
        </div>
        <div className="supplier-grid">
          {suppliers.map((s) => (
            <SupplierCard key={s.id} supplier={s} />
          ))}
          {!suppliers.length && (
            <EmptyState
              title="Encuentra tus próximos aliados"
              href="/suppliers"
              label="Conocer proveedores"
            />
          )}
        </div>
      </section>
    </>
  );
}
