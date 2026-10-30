"use client";
import { WorkspaceShell } from "@/components/workspace-shell";
import { EmptyState } from "@/components/ui";
import Marketplace from "@/modules/marketplace/marketplace";
import { ProductDetail, Suppliers } from "@/modules/marketplace/details";
import InfoPage from "@/modules/marketplace/info-page";
import AuthPage from "@/modules/auth/auth-page";
import Dashboard from "@/modules/workspace/dashboard";
import {
  QuotationList,
  QuotationDetail,
} from "@/modules/quotations/quotation-pages";
import OrderPages from "@/modules/orders/order-pages";
import MessagesPage from "@/modules/messages/messages-page";
import DocumentsPage from "@/modules/documents/documents-page";
import ProductManagement from "@/modules/products/product-management";
import ProfilePage from "@/modules/workspace/profile-page";
import FavoritesPage from "@/modules/workspace/favorites-page";
import AdminPages from "@/modules/admin/admin-pages";
import type { Role } from "@/domain/types";
export default function RouteView({ path }: { path: string[] }) {
  const [root, section, id, action] = path;
  if (root === "marketplace") return <Marketplace />;
  if (root === "products" && section) return <ProductDetail slug={section} />;
  if (root === "suppliers") return <Suppliers slug={section} />;
  if (root === "login" || root === "register")
    return <AuthPage register={root === "register"} />;
  if (root === "how-it-works" || root === "about")
    return <InfoPage about={root === "about"} />;
  const role: Role =
    root === "supplier" ? "supplier" : root === "admin" ? "admin" : "buyer";
  let content;
  if (!section) content = <Dashboard role={role} />;
  else if (section === "quotations")
    content = id ? (
      <QuotationDetail role={role} id={id} compare={action === "compare"} />
    ) : (
      <QuotationList role={role} />
    );
  else if (section === "orders") content = <OrderPages role={role} id={id} />;
  else if (section === "messages") content = <MessagesPage />;
  else if (section === "documents") content = <DocumentsPage />;
  else if (section === "products" || section === "inventory")
    content = (
      <ProductManagement
        inventory={section === "inventory"}
        admin={role === "admin"}
      />
    );
  else if (section === "profile" || section === "company")
    content = <ProfilePage />;
  else if (section === "favorites") content = <FavoritesPage />;
  else if (role === "admin") content = <AdminPages section={section} />;
  else content = <EmptyState title="Sección no encontrada" />;
  return <WorkspaceShell role={role}>{content}</WorkspaceShell>;
}
