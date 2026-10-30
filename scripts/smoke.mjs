import assert from "node:assert/strict";
const base = process.env.DEMO_URL ?? "http://127.0.0.1:3100";
const routes = [
  "/",
  "/marketplace",
  "/products/aji-amarillo-congelado",
  "/suppliers",
  "/suppliers/andean-foods-export",
  "/how-it-works",
  "/manual",
  "/about",
  "/login",
  "/register",
  "/dashboard",
  "/dashboard/quotations",
  "/dashboard/quotations/rfq-demo-1",
  "/dashboard/quotations/rfq-demo-1/compare",
  "/dashboard/orders",
  "/dashboard/orders/order-history",
  "/dashboard/favorites",
  "/dashboard/messages",
  "/dashboard/profile",
  "/supplier",
  "/supplier/products",
  "/supplier/quotations",
  "/supplier/quotations/rfq-demo-1",
  "/supplier/orders",
  "/supplier/orders/order-history",
  "/supplier/inventory",
  "/supplier/documents",
  "/supplier/messages",
  "/supplier/company",
  "/admin",
  "/admin/users",
  "/admin/suppliers",
  "/admin/buyers",
  "/admin/products",
  "/admin/quotations",
  "/admin/quotations/rfq-demo-1/compare",
  "/admin/orders",
  "/admin/verifications",
  "/admin/settings",
];
for (const route of routes) {
  const response = await fetch(base + route);
  assert.equal(response.status, 200, route);
  assert.match(response.headers.get("content-type") ?? "", /text\/html/, route);
  const html = await response.text();
  assert.ok(!html.includes("Internal Server Error"), route);
  if (route === "/") {
    assert.ok(html.includes("Productos peruanos."));
    assert.ok(html.includes("quinoa-illustration.png"));
  }
}
for (const path of [
  "hero.jpg",
  "peppers.jpg",
  "quinoa-illustration.png",
  "coffee.jpg",
  "cacao.jpg",
  "mango.jpg",
  "avocado.jpg",
  "corn.jpg",
]) {
  const response = await fetch(base + "/images/" + path);
  assert.equal(response.status, 200, path);
  assert.match(response.headers.get("content-type") ?? "", /^image\//, path);
  assert.ok((await response.arrayBuffer()).byteLength > 1000, path);
}
const missing = await fetch(base + "/ruta-inexistente");
assert.equal(missing.status, 404, "ruta desconocida");
console.log(
  routes.length +
    " rutas HTML, 8 imágenes locales y 1 respuesta 404 verificadas.",
);
console.log(
  "Esta prueba comprueba HTTP/SSR, no interacciones ni layout de navegador.",
);
