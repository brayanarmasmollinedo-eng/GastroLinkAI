import { addSampleOrder } from "./sample-order";
import { ADMIN_EMAIL, demoEmails, organizations, products } from "./catalog";
import { DEMO_PASSWORD_HASH, DEMO_SALT } from "@/services/password";
import type { DemoState } from "@/domain/types";
// Contactos ficticios, en el mismo orden que `organizations` (6 proveedores, 4 compradores).
const contactNames = [
  "Lucía Quispe",
  "Diego Mamani",
  "Rosa Huamán",
  "Carlos Condori",
  "Ana Flores",
  "Jorge Ramos",
  "Marta Gómez",
  "Pau Ferrer",
  "Elena Martí",
  "Iker Etxeberria",
];
export function createSeed(): DemoState {
  const now = new Date();
  const future = (days: number) =>
    new Date(now.getTime() + days * 86400000).toISOString();
  const date = now.toISOString();
  return addSampleOrder(
    structuredClone({
      version: 2,
      organizations,
      products,
      users: [
        ...organizations.map((o, i) => ({
          id: `user-${o.id}`,
          name: contactNames[i] ?? `Equipo ${o.name}`,
          email: demoEmails[o.id],
          active: true,
          phone: o.details.phone,
          position:
            o.kind === "supplier" ? "Responsable comercial" : "Jefe de compras",
          passwordHash: DEMO_PASSWORD_HASH,
          salt: DEMO_SALT,
        })),
        {
          id: "admin-demo",
          name: "Administración Demo",
          email: ADMIN_EMAIL,
          active: true,
          phone: "",
          position: "Administración de la plataforma",
          passwordHash: DEMO_PASSWORD_HASH,
          salt: DEMO_SALT,
          platformAdmin: true,
        },
      ],
      members: organizations.map((o) => ({
        userId: `user-${o.id}`,
        organizationId: o.id,
        role: o.kind,
      })),
      session: null,
      favorites: [],
      savedSuppliers: [],
      requests: [
        {
          id: "rfq-demo-1",
          code: "RFQ-00124",
          buyerId: "buyer-1",
          productId: "product-1",
          supplierIds: ["supplier-1", "supplier-2", "supplier-3"],
          quantity: 200,
          unit: "kg",
          city: "Madrid",
          country: "España",
          requiredDate: future(40).slice(0, 10),
          comments:
            "Entrega para nuestra nueva carta de temporada. Presentación preferida: caja de 10 kg.",
          status: "OFERTADA",
          createdAt: date,
        },
      ],
      offers: [1, 2, 3].map((n) => ({
        id: `offer-demo-${n}`,
        requestId: "rfq-demo-1",
        supplierId: `supplier-${n}`,
        price: [4.2, 4.35, 4.1][n - 1],
        quantity: 200,
        leadDays: [18, 14, 23][n - 1],
        minimum: n === 2 ? 150 : 100,
        presentation: "Caja de 10 kg",
        conditions:
          "Condiciones DEMO. Transporte e impuestos no incluidos; pendientes de acuerdo.",
        validUntil: future(7),
        status: "EMITIDA",
        revision: 1,
        createdAt: date,
      })),
      orders: [],
      conversations: [
        {
          id: "conversation-demo",
          buyerId: "buyer-1",
          supplierId: "supplier-1",
          subject: "Presentaciones para nuestra cocina",
        },
      ],
      messages: [
        {
          id: "message-1",
          conversationId: "conversation-demo",
          senderId: "user-buyer-1",
          senderOrganizationId: "buyer-1",
          body: "¿Podrían trabajar una presentación de 5 kg?",
          createdAt: date,
        },
        {
          id: "message-2",
          conversationId: "conversation-demo",
          senderId: "user-supplier-1",
          senderOrganizationId: "supplier-1",
          body: "Sí, podemos incluirla en la cotización. Cuéntanos qué cantidad necesitas.",
          createdAt: date,
        },
      ],
      documents: organizations
        .filter((o) => o.kind === "supplier")
        .flatMap((o) =>
          [
            "Certificación sanitaria",
            "Ficha técnica",
            "Certificado de origen",
          ].map((name, i) => ({
            id: `doc-${o.id}-${i}`,
            supplierId: o.id,
            name,
            issuer: "Entidad ficticia DEMO",
            status: (
              ["Vigente", "Por vencer", "Pendiente de revisión"] as const
            )[i],
            expiresAt: future(i === 1 ? 14 : 180).slice(0, 10),
          })),
        ),
      activities: [
        {
          id: "activity-seed",
          label: "Entorno de demostración preparado",
          at: date,
        },
      ],
    } satisfies DemoState),
    now,
  );
}
