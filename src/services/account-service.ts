import type { DemoState, Role, Verification } from "@/domain/types";
import { requireSession, requireSupplier, activity } from "./access";
import {
  buyerProfileSchema,
  companyDetailsSchema,
  contactSchema,
  emailSchema,
  productSchema,
  supplierProfileSchema,
  type BuyerProfileInput,
  type CompanyDetailsInput,
  type ContactInput,
  type ProductInput,
  type SupplierProfileInput,
} from "@/domain/validation";
import { categories } from "@/data/catalog";
import { DEMO_SALT } from "./password";
const roleLabel = (role: Role) =>
  role === "buyer"
    ? "Empresa compradora"
    : role === "supplier"
      ? "Proveedor"
      : "Administrador";
/** Sal con la que calcular el hash antes de iniciar sesión. Para correos desconocidos
 *  devuelve una sal fija, así la pantalla no revela qué cuentas existen. */
export function loginSalt(state: DemoState, email: string) {
  const normalized = email.trim().toLowerCase();
  return state.users.find((u) => u.email === normalized)?.salt ?? DEMO_SALT;
}
/** Inicio de sesión con correo y contraseña (hash calculado con `loginSalt`). */
export function loginWithPassword(
  state: DemoState,
  input: { email: string; passwordHash: string; role: Role },
) {
  const email = input.email.trim().toLowerCase();
  const user = state.users.find((u) => u.email === email);
  if (!user || user.passwordHash !== input.passwordHash)
    throw new Error("Correo o contraseña incorrectos.");
  if (!user.active)
    throw new Error(
      "Esta cuenta está desactivada. Contacta con la administración de la plataforma.",
    );
  const member = state.members.find((m) => m.userId === user.id);
  const actual: Role = user.platformAdmin ? "admin" : (member?.role ?? "buyer");
  if (actual !== input.role)
    throw new Error(
      `Esta cuenta es de tipo «${roleLabel(actual)}». Cambia a esa pestaña para entrar.`,
    );
  state.session =
    actual === "admin"
      ? { userId: user.id, role: "admin" }
      : {
          userId: user.id,
          organizationId: member!.organizationId,
          role: actual,
        };
  activity(state, "Inicio de sesión: " + user.name);
}
/** Acceso directo a un perfil demo (botones de acceso rápido y pruebas). */
export function loginDemo(
  state: DemoState,
  role: Role,
  organizationId?: string,
) {
  if (role === "admin") {
    state.session = { userId: "admin-demo", role };
    return;
  }
  const member = state.members.find(
    (m) => m.organizationId === organizationId && m.role === role,
  );
  if (!member || !state.users.find((u) => u.id === member.userId)?.active)
    throw new Error("Este perfil no está disponible.");
  state.session = { userId: member.userId, organizationId, role };
}
export interface RegistrationInput {
  role: "buyer" | "supplier";
  company: CompanyDetailsInput;
  contact: ContactInput;
  email: string;
  /** Hash y sal calculados en el cliente con `hashPassword`; nunca la contraseña en claro. */
  passwordHash: string;
  salt: string;
  acceptTerms: boolean;
  buyer?: BuyerProfileInput;
  supplier?: SupplierProfileInput;
}
function initials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return (
    words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2)
  ).toUpperCase();
}
function validCategories(ids: string[]) {
  if (!ids.every((id) => categories.some((c) => c.id === id)))
    throw new Error("Categoría de producto inválida.");
  return [...new Set(ids)];
}
export function registerDemo(state: DemoState, input: RegistrationInput) {
  if (!input.acceptTerms)
    throw new Error("Debes aceptar las condiciones de uso de la demostración.");
  if (!/^[0-9a-f]{64}$/.test(input.passwordHash) || !input.salt)
    throw new Error("No se pudo proteger la contraseña. Inténtalo de nuevo.");
  const company = companyDetailsSchema.parse(input.company);
  const contact = contactSchema.parse(input.contact);
  const email = emailSchema.parse(input.email);
  if (state.users.some((u) => u.email.toLowerCase() === email))
    throw new Error("Ya existe una cuenta con ese correo.");
  const taxId = company.taxId;
  if (state.organizations.some((o) => o.details.taxId === taxId))
    throw new Error(
      "Ya hay una empresa registrada con esa identificación fiscal.",
    );
  const buyer =
    input.role === "buyer" ? buyerProfileSchema.parse(input.buyer) : undefined;
  const supplier =
    input.role === "supplier"
      ? supplierProfileSchema.parse(input.supplier)
      : undefined;
  const id = crypto.randomUUID();
  const userId = crypto.randomUUID();
  state.users.push({
    id: userId,
    name: contact.contactName,
    email,
    active: true,
    phone: contact.contactPhone,
    position: contact.position,
    passwordHash: input.passwordHash,
    salt: input.salt,
  });
  state.organizations.push({
    id,
    slug: "empresa-" + id,
    name: company.name,
    kind: input.role,
    city: company.city,
    country: company.country,
    description:
      company.description ||
      (input.role === "supplier"
        ? "Proveedor de ingredientes peruanos registrado en la demostración."
        : "Empresa gastronómica registrada en la demostración."),
    initials: initials(company.name),
    color: input.role === "supplier" ? "clay" : "olive",
    years: supplier?.years ?? 0,
    markets: [company.country],
    certifications: supplier?.certifications ?? [],
    verification: "PENDIENTE_VERIFICACION",
    details: {
      legalName: company.legalName,
      taxId,
      address: company.address,
      phone: company.phone,
      website: company.website,
    },
    ...(buyer ?? {}),
    ...(supplier
      ? {
          categoryIds: validCategories(supplier.categoryIds),
          monthlyCapacityKg: supplier.monthlyCapacityKg,
        }
      : {}),
  });
  state.members.push({ userId, organizationId: id, role: input.role });
  state.session = { userId, organizationId: id, role: input.role };
  activity(state, "Empresa registrada: " + company.name);
}
/** Actualiza los datos de la empresa del perfil activo. */
export function saveCompany(
  state: DemoState,
  input: {
    company: CompanyDetailsInput;
    buyer?: BuyerProfileInput;
    supplier?: SupplierProfileInput;
  },
) {
  const s = requireSession(state);
  const org = state.organizations.find((o) => o.id === s.organizationId);
  if (!org) throw new Error("Empresa no encontrada.");
  const company = companyDetailsSchema.parse(input.company);
  if (
    state.organizations.some(
      (o) => o.id !== org.id && o.details.taxId === company.taxId,
    )
  )
    throw new Error("Otra empresa ya usa esa identificación fiscal.");
  org.name = company.name;
  org.city = company.city;
  org.country = company.country;
  if (company.description) org.description = company.description;
  org.initials = initials(company.name);
  org.details = {
    legalName: company.legalName,
    taxId: company.taxId,
    address: company.address,
    phone: company.phone,
    website: company.website,
  };
  if (org.kind === "buyer" && input.buyer)
    Object.assign(org, buyerProfileSchema.parse(input.buyer));
  if (org.kind === "supplier" && input.supplier) {
    const supplier = supplierProfileSchema.parse(input.supplier);
    org.categoryIds = validCategories(supplier.categoryIds);
    org.monthlyCapacityKg = supplier.monthlyCapacityKg;
    org.certifications = supplier.certifications;
    org.years = supplier.years;
  }
  activity(state, "Perfil empresarial actualizado");
}
export function saveContact(state: DemoState, input: ContactInput) {
  const s = requireSession(state);
  const user = state.users.find((u) => u.id === s.userId);
  if (!user) throw new Error("Usuario no encontrado.");
  const contact = contactSchema.parse(input);
  user.name = contact.contactName;
  user.position = contact.position;
  user.phone = contact.contactPhone;
  activity(state, "Datos de contacto actualizados");
}
/** Cambia la contraseña del perfil activo; los hashes se calculan antes en el cliente. */
export function changePassword(
  state: DemoState,
  input: { currentHash: string; newHash: string; newSalt: string },
) {
  const s = requireSession(state);
  const user = state.users.find((u) => u.id === s.userId);
  if (!user) throw new Error("Usuario no encontrado.");
  if (user.passwordHash !== input.currentHash)
    throw new Error("La contraseña actual no es correcta.");
  if (!/^[0-9a-f]{64}$/.test(input.newHash) || !input.newSalt)
    throw new Error("No se pudo proteger la nueva contraseña.");
  user.passwordHash = input.newHash;
  user.salt = input.newSalt;
  activity(state, "Contraseña actualizada");
}
export function saveProduct(
  state: DemoState,
  input: ProductInput,
  id?: string,
) {
  const s = requireSupplier(state);
  const data = productSchema.parse(input);
  if (!categories.some((c) => c.id === data.categoryId))
    throw new Error("Categoría inválida.");
  if (id) {
    const product = state.products.find(
      (p) => p.id === id && p.supplierId === s.organizationId,
    );
    if (!product) throw new Error("No puedes editar este producto.");
    const { image, ...rest } = data;
    Object.assign(product, rest, { updatedAt: new Date().toISOString() });
    if (image) product.image = image;
  } else {
    const id = crypto.randomUUID();
    state.products.unshift({
      ...data,
      id,
      slug: "producto-" + id,
      supplierId: s.organizationId!,
      certifications: [],
      unit: "kg",
      image: data.image || "/images/peppers.jpg",
      published: true,
      updatedAt: new Date().toISOString(),
    });
  }
  activity(state, "Catálogo actualizado: " + data.name);
}
export function toggleProduct(state: DemoState, id: string) {
  const s = requireSession(state);
  const p = state.products.find((p) => p.id === id);
  if (
    !p ||
    (s.role !== "admin" &&
      (s.role !== "supplier" || p.supplierId !== s.organizationId))
  )
    throw new Error("Acción no permitida.");
  p.published = !p.published;
  activity(state, "Publicación actualizada: " + p.name);
}
export function verifySupplier(
  state: DemoState,
  id: string,
  verification: Verification,
) {
  requireSession(state, "admin");
  const o = state.organizations.find(
    (o) => o.id === id && o.kind === "supplier",
  );
  if (!o) throw new Error("Proveedor no encontrado.");
  o.verification = verification;
  activity(state, "Verificación DEMO actualizada: " + o.name);
}
export function toggleUser(state: DemoState, id: string) {
  const s = requireSession(state, "admin");
  if (id === s.userId)
    throw new Error("No puedes desactivar tu propio perfil.");
  const u = state.users.find((u) => u.id === id);
  if (u) {
    u.active = !u.active;
    activity(state, "Estado de usuario actualizado: " + u.name);
  }
}
