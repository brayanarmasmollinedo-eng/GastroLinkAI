import { describe, it, expect } from "vitest";
import { createSeed } from "@/data/seed";
import {
  changePassword,
  loginDemo,
  loginSalt,
  loginWithPassword,
  registerDemo,
  saveProduct,
  type RegistrationInput,
} from "@/services/account-service";
import { DEMO_PASSWORD, hashPassword, newSalt } from "@/services/password";
import { passwordProblem } from "@/domain/validation";
import {
  createRequest,
  issueOffer,
  visibleRequests,
  rejectOffer,
} from "@/services/quotation-service";
import {
  acceptOffer,
  advanceOrder,
  visibleOrders,
} from "@/services/order-service";
import { sendMessage } from "@/services/message-service";
import { ProductService } from "@/services/catalog-service";
const requestInput = {
  productId: "product-1",
  quantity: 200,
  city: "Madrid",
  country: "España",
  requiredDate: new Date(Date.now() + 40 * 86400000).toISOString().slice(0, 10),
  comments: "Entrega para carta de otoño.",
};
const offerInput = {
  price: 4.2,
  leadDays: 18,
  minimum: 100,
  validDays: 7,
  presentation: "Caja de 10 kg",
  conditions: "Demo. Transporte e impuestos no incluidos.",
};
const HASH = "a".repeat(64);
const registration = (
  overrides: Partial<RegistrationInput> = {},
): RegistrationInput => ({
  role: "buyer",
  email: "compras@demo.test",
  passwordHash: HASH,
  salt: "sal-de-prueba",
  acceptTerms: true,
  company: {
    name: "Comprador de prueba",
    legalName: "Comprador de prueba S.L.",
    taxId: "B99887766",
    country: "España",
    city: "Madrid",
    address: "Calle Falsa 123, Madrid",
    phone: "+34 910 000 000",
    website: "",
    description: "",
  },
  contact: {
    contactName: "Laura Pérez",
    position: "Compras",
    contactPhone: "+34 600 000 000",
  },
  buyer: { businessType: "Restaurante", purchaseVolume: "Menos de 500 kg/mes" },
  ...overrides,
});
describe("identidad y organizaciones demo", () => {
  it("separa usuarios, empresas y membresías", () => {
    const s = createSeed();
    registerDemo(s, registration());
    expect(s.session?.userId).not.toBe(s.session?.organizationId);
    expect(s.members).toContainEqual({
      userId: s.session?.userId,
      organizationId: s.session?.organizationId,
      role: "buyer",
    });
  });
  it("rechaza una identidad sin membresía", () => {
    const s = createSeed();
    expect(() => loginDemo(s, "supplier", "buyer-1")).toThrow();
  });
  it("rechaza usuarios desactivados", () => {
    const s = createSeed();
    s.users.find((u) => u.id === "user-buyer-1")!.active = false;
    expect(() => loginDemo(s, "buyer", "buyer-1")).toThrow();
  });
  it("no permite registrar correos ni identificaciones fiscales repetidos", () => {
    const s = createSeed();
    expect(() =>
      registerDemo(s, registration({ email: "compras@costamadrid.example" })),
    ).toThrow(/correo/);
    const taken = s.organizations[0].details.taxId;
    expect(() =>
      registerDemo(
        s,
        registration({ company: { ...registration().company, taxId: taken } }),
      ),
    ).toThrow(/fiscal/);
  });
  it("guarda los datos legales, el contacto y solo el hash de la contraseña", () => {
    const s = createSeed();
    registerDemo(s, registration());
    const user = s.users.find((u) => u.id === s.session?.userId)!;
    const org = s.organizations.find((o) => o.id === s.session?.organizationId)!;
    expect(user).toMatchObject({ email: "compras@demo.test", position: "Compras", passwordHash: HASH });
    expect(JSON.stringify(user)).not.toContain("Demo2026");
    expect(org.details).toMatchObject({ legalName: "Comprador de prueba S.L.", taxId: "B99887766" });
    expect(org.businessType).toBe("Restaurante");
  });
  it("exige condiciones, perfil comercial y categorías válidas", () => {
    const s = createSeed();
    expect(() => registerDemo(s, registration({ acceptTerms: false }))).toThrow();
    expect(() => registerDemo(s, registration({ buyer: undefined }))).toThrow();
    expect(() =>
      registerDemo(
        s,
        registration({
          role: "supplier",
          supplier: { categoryIds: [], monthlyCapacityKg: 100, certifications: [], years: 1 },
        }),
      ),
    ).toThrow(/categoría/);
    registerDemo(
      s,
      registration({
        role: "supplier",
        email: "ventas@nuevo.test",
        company: { ...registration().company, taxId: "20123456789" },
        supplier: { categoryIds: ["cafe"], monthlyCapacityKg: "800", certifications: ["HACCP"], years: "3" },
      }),
    );
    const org = s.organizations.find((o) => o.id === s.session?.organizationId)!;
    expect(org).toMatchObject({ kind: "supplier", categoryIds: ["cafe"], monthlyCapacityKg: 800, verification: "PENDIENTE_VERIFICACION" });
  });
});
describe("inicio de sesión con contraseña", () => {
  it("las cuentas demo entran con la contraseña común y el tipo correcto", async () => {
    const s = createSeed();
    const email = "compras@costamadrid.example";
    const passwordHash = await hashPassword(DEMO_PASSWORD, loginSalt(s, email));
    loginWithPassword(s, { email: email.toUpperCase(), passwordHash, role: "buyer" });
    expect(s.session).toMatchObject({ organizationId: "buyer-1", role: "buyer" });
    expect(() => loginWithPassword(s, { email, passwordHash, role: "supplier" })).toThrow(/Empresa compradora/);
  });
  it("rechaza contraseñas incorrectas y cuentas desactivadas con mensajes claros", async () => {
    const s = createSeed();
    const email = "ventas@andeanfoods.example";
    const wrong = await hashPassword("otra-clave1", loginSalt(s, email));
    expect(() => loginWithPassword(s, { email, passwordHash: wrong, role: "supplier" })).toThrow("Correo o contraseña incorrectos.");
    expect(() => loginWithPassword(s, { email: "nadie@x.test", passwordHash: wrong, role: "supplier" })).toThrow("Correo o contraseña incorrectos.");
    s.users.find((u) => u.email === email)!.active = false;
    const right = await hashPassword(DEMO_PASSWORD, loginSalt(s, email));
    expect(() => loginWithPassword(s, { email, passwordHash: right, role: "supplier" })).toThrow(/desactivada/);
  });
  it("el administrador entra solo por la pestaña de administración", async () => {
    const s = createSeed();
    const email = "admin@gastrolinkai.example";
    const passwordHash = await hashPassword(DEMO_PASSWORD, loginSalt(s, email));
    expect(() => loginWithPassword(s, { email, passwordHash, role: "buyer" })).toThrow();
    loginWithPassword(s, { email, passwordHash, role: "admin" });
    expect(s.session).toEqual({ userId: "admin-demo", role: "admin" });
  });
  it("cambia la contraseña solo si la actual es correcta", async () => {
    const s = createSeed();
    loginDemo(s, "buyer", "buyer-1");
    const user = s.users.find((u) => u.id === s.session?.userId)!;
    const current = await hashPassword(DEMO_PASSWORD, user.salt);
    const salt = newSalt();
    const next = await hashPassword("NuevaClave9", salt);
    expect(() => changePassword(s, { currentHash: next, newHash: next, newSalt: salt })).toThrow(/actual/);
    changePassword(s, { currentHash: current, newHash: next, newSalt: salt });
    expect(user).toMatchObject({ passwordHash: next, salt });
  });
  it("valida la fortaleza y la confirmación de la contraseña", () => {
    expect(passwordProblem("corta1")).toMatch(/8/);
    expect(passwordProblem("solamenteletras")).toMatch(/letras y números/);
    expect(passwordProblem("Clave12345", "Clave12346")).toMatch(/coinciden/);
    expect(passwordProblem("Clave12345", "Clave12345")).toBeNull();
  });
});
describe("cotizaciones y aislamiento", () => {
  it("valida mínimo, fecha futura y cantidades positivas", () => {
    const s = createSeed();
    loginDemo(s, "buyer", "buyer-1");
    expect(() => createRequest(s, { ...requestInput, quantity: 50 })).toThrow();
    expect(() => createRequest(s, { ...requestInput, quantity: -1 })).toThrow();
    expect(() =>
      createRequest(s, { ...requestInput, requiredDate: "2020-01-01" }),
    ).toThrow();
  });
  it("no expone solicitudes de otros compradores", () => {
    const s = createSeed();
    loginDemo(s, "buyer", "buyer-2");
    expect(visibleRequests(s).every((r) => r.buyerId === "buyer-2")).toBe(true);
    expect(() => acceptOffer(s, "offer-demo-1")).toThrow();
  });
  it("solo un proveedor destinatario puede ofertar", () => {
    const s = createSeed();
    loginDemo(s, "buyer", "buyer-1");
    const id = createRequest(s, requestInput);
    loginDemo(s, "supplier", "supplier-2");
    expect(() => issueOffer(s, id, offerInput)).toThrow();
  });
  it("una nueva revisión sustituye la oferta previa", () => {
    const s = createSeed();
    loginDemo(s, "supplier", "supplier-1");
    const id = issueOffer(s, "rfq-demo-1", offerInput);
    expect(s.offers.find((o) => o.id === "offer-demo-1")?.status).toBe(
      "SUSTITUIDA",
    );
    expect(s.offers.find((o) => o.id === id)?.revision).toBe(2);
  });
  it("un rechazo no cierra las ofertas de competidores", () => {
    const s = createSeed();
    loginDemo(s, "buyer", "buyer-1");
    rejectOffer(s, "offer-demo-1");
    expect(s.requests[0].status).toBe("OFERTADA");
    expect(s.offers.find((o) => o.id === "offer-demo-2")?.status).toBe(
      "EMITIDA",
    );
  });
  it("no acepta ofertas vencidas ni sustituidas", () => {
    const s = createSeed();
    loginDemo(s, "buyer", "buyer-1");
    s.offers[0].validUntil = "2020-01-01";
    expect(() => acceptOffer(s, s.offers[0].id)).toThrow();
    s.offers[1].status = "SUSTITUIDA";
    expect(() => acceptOffer(s, s.offers[1].id)).toThrow();
  });
  it("un proveedor suspendido no puede emitir ofertas", () => {
    const s = createSeed();
    loginDemo(s, "supplier", "supplier-1");
    s.organizations[0].verification = "SUSPENDIDO";
    expect(() => issueOffer(s, "rfq-demo-1", offerInput)).toThrow();
  });
});
describe("pedidos y trazabilidad", () => {
  it("aceptar dos veces devuelve el mismo pedido", () => {
    const s = createSeed();
    loginDemo(s, "buyer", "buyer-1");
    const before = s.orders.length;
    const id = acceptOffer(s, "offer-demo-1");
    expect(acceptOffer(s, "offer-demo-1")).toBe(id);
    expect(s.orders).toHaveLength(before + 1);
    expect(() => acceptOffer(s, "offer-demo-2")).toThrow();
  });
  it("conserva producto y precio al editar catálogo", () => {
    const s = createSeed();
    loginDemo(s, "buyer", "buyer-1");
    const id = acceptOffer(s, "offer-demo-1");
    s.products[0].name = "Otro nombre";
    s.products[0].price = 999;
    const order = s.orders.find((o) => o.id === id)!;
    expect(order.productName).toBe("Ají amarillo congelado");
    expect(order.price).toBe(4.2);
  });
  it("solo su proveedor avanza el pedido y registra actor y estado", () => {
    const s = createSeed();
    loginDemo(s, "buyer", "buyer-1");
    const id = acceptOffer(s, "offer-demo-1");
    expect(() => advanceOrder(s, id, "")).toThrow();
    loginDemo(s, "supplier", "supplier-2");
    expect(() => advanceOrder(s, id, "")).toThrow();
    loginDemo(s, "supplier", "supplier-1");
    advanceOrder(s, id, "En preparación");
    const order = s.orders.find((o) => o.id === id)!;
    expect(order.status).toBe("PREPARACION");
    expect(order.history[1]).toMatchObject({
      previous: "CONFIRMADO",
      status: "PREPARACION",
      actorId: "user-supplier-1",
      note: "En preparación",
    });
  });
  it("no admite transiciones después de entregar", () => {
    const s = createSeed();
    loginDemo(s, "buyer", "buyer-1");
    const id = acceptOffer(s, "offer-demo-1");
    loginDemo(s, "supplier", "supplier-1");
    for (let i = 0; i < 5; i++) advanceOrder(s, id, "Etapa demo");
    expect(() => advanceOrder(s, id, "")).toThrow();
    loginDemo(s, "buyer", "buyer-3");
    expect(visibleOrders(s).some((o) => o.id === id)).toBe(false);
  });
});
describe("catálogo y mensajería", () => {
  it("busca sin distinguir tildes y combina filtros", () => {
    const s = createSeed();
    const service = new ProductService(s);
    expect(
      service.list({
        search: "aji amarillo",
        supplier: "supplier-1",
        available: true,
      }),
    ).toHaveLength(1);
    expect(service.list({ maxPrice: 4, category: "cafe" })).toHaveLength(0);
  });
  it("impide editar el catálogo de otro proveedor", () => {
    const s = createSeed();
    loginDemo(s, "supplier", "supplier-2");
    expect(() =>
      saveProduct(
        s,
        { ...s.products[0], name: "Nuevo nombre" },
        s.products[0].id,
      ),
    ).toThrow();
  });
  it("impide escribir en conversaciones ajenas y rechaza texto vacío", () => {
    const s = createSeed();
    loginDemo(s, "buyer", "buyer-2");
    expect(() => sendMessage(s, "conversation-demo", "Hola")).toThrow();
    loginDemo(s, "buyer", "buyer-1");
    expect(() => sendMessage(s, "conversation-demo", "   ")).toThrow();
  });
});
