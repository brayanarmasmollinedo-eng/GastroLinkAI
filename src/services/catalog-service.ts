import type { DemoState, Product } from "@/domain/types";
export interface ProductFilters {
  search?: string;
  category?: string;
  supplier?: string;
  maxPrice?: number;
  available?: boolean;
  presentation?: string;
  certification?: string;
  region?: string;
  maxDays?: number;
}
export const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
export class ProductService {
  constructor(private readonly state: DemoState) {}
  list(f: ProductFilters = {}): Product[] {
    return this.state.products.filter(
      (p) =>
        p.published &&
        this.state.organizations.find((o) => o.id === p.supplierId)
          ?.verification !== "SUSPENDIDO" &&
        (!f.search || normalize(p.name).includes(normalize(f.search))) &&
        (!f.category || p.categoryId === f.category) &&
        (!f.supplier || p.supplierId === f.supplier) &&
        (!f.maxPrice || p.price <= f.maxPrice) &&
        (!f.available || p.stock > 0) &&
        (!f.presentation || p.presentation === f.presentation) &&
        (!f.certification || p.certifications.includes(f.certification)) &&
        (!f.region || p.region === f.region) &&
        (!f.maxDays || p.leadDays <= f.maxDays),
    );
  }
  find(slug: string) {
    return this.list().find((p) => p.slug === slug);
  }
}
export class SupplierService {
  constructor(private readonly state: DemoState) {}
  list() {
    return this.state.organizations.filter(
      (o) => o.kind === "supplier" && o.verification !== "SUSPENDIDO",
    );
  }
  find(slug: string) {
    return this.list().find((o) => o.slug === slug);
  }
}
export interface AiSearchProvider {
  parse(text: string): { search: string; explanation: string };
}
export class DemoAiSearchProvider implements AiSearchProvider {
  parse(text: string) {
    const clean = normalize(text);
    const keyword = [
      "aji amarillo",
      "quinua",
      "cafe",
      "cacao",
      "mango",
      "palta",
      "maiz",
      "rocoto",
    ].find((k) => clean.includes(k));
    return {
      search: keyword ?? text.trim(),
      explanation:
        "Función demostrativa: búsqueda por palabras clave, sin inteligencia artificial. Las cantidades y fechas no se interpretan automáticamente.",
    };
  }
}
