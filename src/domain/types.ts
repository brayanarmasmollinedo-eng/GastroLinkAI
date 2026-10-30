export type Role = "buyer" | "supplier" | "admin";
export type Verification =
  "PENDIENTE_VERIFICACION" | "VERIFICADO" | "OBSERVADO" | "SUSPENDIDO";
export const businessTypes = [
  "Restaurante",
  "Hotel",
  "Catering",
  "Distribuidor",
  "Importador",
  "Tienda gourmet",
] as const;
export type BusinessType = (typeof businessTypes)[number];
export const purchaseVolumes = [
  "Menos de 500 kg/mes",
  "500 a 2.000 kg/mes",
  "Más de 2.000 kg/mes",
] as const;
export type PurchaseVolume = (typeof purchaseVolumes)[number];
export const supplierCertifications = [
  "HACCP",
  "Orgánico",
  "BPM",
  "GlobalG.A.P.",
  "Comercio Justo",
] as const;
/** Datos legales y de contacto comunes a compradores y proveedores. */
export interface CompanyDetails {
  legalName: string;
  taxId: string;
  address: string;
  phone: string;
  website: string;
}
export interface Organization {
  id: string;
  slug: string;
  name: string;
  kind: "buyer" | "supplier";
  city: string;
  country: string;
  description: string;
  initials: string;
  color: string;
  years: number;
  markets: string[];
  certifications: string[];
  verification: Verification;
  details: CompanyDetails;
  /** Solo compradores. */
  businessType?: BusinessType;
  purchaseVolume?: PurchaseVolume;
  /** Solo proveedores. */
  categoryIds?: string[];
  monthlyCapacityKg?: number;
}
export interface DemoUser {
  id: string;
  name: string;
  email: string;
  active: boolean;
  phone: string;
  position: string;
  /** PBKDF2-SHA256 en hex. Demo local: no sustituye una autenticación de servidor. */
  passwordHash: string;
  salt: string;
  platformAdmin?: boolean;
}
export interface OrganizationMember {
  userId: string;
  organizationId: string;
  role: "buyer" | "supplier";
}
export interface Session {
  userId: string;
  organizationId?: string;
  role: Role;
}
export interface Category {
  id: string;
  name: string;
  icon: string;
}
export interface Product {
  id: string;
  slug: string;
  name: string;
  supplierId: string;
  categoryId: string;
  description: string;
  region: string;
  image: string;
  presentation: string;
  price: number;
  minimum: number;
  stock: number;
  capacity: number;
  leadDays: number;
  certifications: string[];
  unit: "kg";
  published: boolean;
  updatedAt: string;
}
export type RequestStatus =
  "ENVIADA" | "EN_NEGOCIACION" | "OFERTADA" | "ACEPTADA" | "RECHAZADA";
export interface QuotationRequest {
  id: string;
  code: string;
  buyerId: string;
  productId: string;
  supplierIds: string[];
  quantity: number;
  unit: "kg";
  city: string;
  country: string;
  requiredDate: string;
  comments: string;
  status: RequestStatus;
  createdAt: string;
}
export interface QuotationOffer {
  id: string;
  requestId: string;
  supplierId: string;
  price: number;
  quantity: number;
  leadDays: number;
  minimum: number;
  presentation: string;
  conditions: string;
  validUntil: string;
  status: "EMITIDA" | "ACEPTADA" | "RECHAZADA" | "SUSTITUIDA";
  revision: number;
  createdAt: string;
}
export const orderStates = [
  "CONFIRMADO",
  "PREPARACION",
  "DOCUMENTACION",
  "DESPACHADO",
  "EN_TRANSITO",
  "ENTREGADO",
] as const;
export type OrderStatus = (typeof orderStates)[number];
export interface OrderHistory {
  status: OrderStatus;
  previous: OrderStatus | null;
  actorId: string;
  at: string;
  note: string;
}
export interface Order {
  id: string;
  code: string;
  requestId: string;
  offerId: string;
  buyerId: string;
  supplierId: string;
  productName: string;
  presentation: string;
  quantity: number;
  price: number;
  city: string;
  country: string;
  status: OrderStatus;
  createdAt: string;
  history: OrderHistory[];
}
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderOrganizationId: string;
  body: string;
  createdAt: string;
}
export interface Conversation {
  id: string;
  buyerId: string;
  supplierId: string;
  subject: string;
}
export interface DemoDocument {
  id: string;
  supplierId: string;
  name: string;
  issuer: string;
  status: "Vigente" | "Por vencer" | "Pendiente de revisión";
  expiresAt: string;
}
export interface Activity {
  id: string;
  label: string;
  at: string;
}
export interface DemoState {
  version: 2;
  users: DemoUser[];
  organizations: Organization[];
  members: OrganizationMember[];
  products: Product[];
  requests: QuotationRequest[];
  offers: QuotationOffer[];
  orders: Order[];
  conversations: Conversation[];
  messages: Message[];
  documents: DemoDocument[];
  favorites: string[];
  savedSuppliers: string[];
  activities: Activity[];
  session: Session | null;
}
