"use client";
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  FileText,
  Package,
  Building2,
  Heart,
  MessageSquare,
  UserRound,
  Boxes,
  FolderCheck,
  Users,
  BadgeCheck,
  Settings,
  Menu,
  X,
  ArrowLeft,
  LogOut,
  Bell,
  BookOpen,
} from "lucide-react";
import { useDemo } from "./demo-provider";
import { Brand } from "./site-shell";
import { EmptyState, LoadingState } from "./ui";
import type { Role } from "@/domain/types";
export const roleBase = (role: Role) =>
  role === "buyer"
    ? "/dashboard"
    : role === "supplier"
      ? "/supplier"
      : "/admin";
export function WorkspaceShell({
  role,
  children,
}: {
  role: Role;
  children: ReactNode;
}) {
  const { state, ready, mutate } = useDemo();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const base = roleBase(role);
  const company = state.organizations.find(
    (o) => o.id === state.session?.organizationId,
  );
  const user = state.users.find((u) => u.id === state.session?.userId);
  const items =
    role === "buyer"
      ? [
          ["", "Dashboard", LayoutDashboard],
          ["/marketplace", "Marketplace", Store],
          ["quotations", "Mis cotizaciones", FileText],
          ["orders", "Mis pedidos", Package],
          ["/suppliers", "Proveedores", Building2],
          ["favorites", "Favoritos", Heart],
          ["messages", "Mensajes", MessageSquare],
          ["profile", "Perfil", UserRound],
        ]
      : role === "supplier"
        ? [
            ["", "Dashboard", LayoutDashboard],
            ["products", "Productos", Store],
            ["quotations", "Cotizaciones", FileText],
            ["orders", "Pedidos", Package],
            ["inventory", "Inventario", Boxes],
            ["documents", "Documentos", FolderCheck],
            ["messages", "Mensajes", MessageSquare],
            ["company", "Empresa", Building2],
          ]
        : [
            ["", "Dashboard", LayoutDashboard],
            ["users", "Usuarios", Users],
            ["suppliers", "Proveedores", Building2],
            ["buyers", "Compradores", UserRound],
            ["products", "Productos", Store],
            ["quotations", "Cotizaciones", FileText],
            ["orders", "Pedidos", Package],
            ["verifications", "Verificaciones", BadgeCheck],
            ["settings", "Configuración", Settings],
          ];
  if (!ready) return <LoadingState />;
  if (
    state.session?.role !== role ||
    !state.users.find((u) => u.id === state.session?.userId)?.active
  )
    return (
      <main className="container section">
        <Brand />
        <EmptyState
          title="Inicia sesión para continuar"
          description={
            "Este espacio es para cuentas de tipo " +
            (role === "buyer"
              ? "comprador"
              : role === "supplier"
                ? "proveedor"
                : "administrador") +
            ". Entra con tu correo y contraseña o usa una cuenta de demostración."
          }
          href={"/login?role=" + role}
          label="Iniciar sesión"
        />
      </main>
    );
  return (
    <div className="workspace">
      <aside className={"sidebar " + (open ? "open" : "")}>
        <button
          className="icon-button sidebar-close"
          aria-label="Cerrar navegación"
          onClick={() => setOpen(false)}
        >
          <X />
        </button>
        <Brand />
        <p className="workspace-label">
          {role === "buyer"
            ? "ESPACIO COMPRADOR"
            : role === "supplier"
              ? "ESPACIO PROVEEDOR"
              : "ADMINISTRACIÓN"}
        </p>
        <nav aria-label="Navegación del espacio">
          {items.map(([part, label, Icon]) => {
            const p = String(part);
            const href = p.startsWith("/") ? p : base + (p ? "/" + p : "");
            const I = Icon as typeof Store;
            const active = p ? pathname.startsWith(href) : pathname === base;
            return (
              <Link
                key={href}
                href={href}
                className={active ? "active" : ""}
                onClick={() => setOpen(false)}
              >
                <I size={17} />
                {String(label)}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-demo">
            <b>Tu espacio de demostración</b>Explora los flujos con empresas
            ficticias. Todo se guarda en este navegador.
          </div>
          <Link href="/login">
            <Users size={16} />
            Cambiar de cuenta
          </Link>
          <Link href="/manual">
            <BookOpen size={16} />
            Manual de usuario
          </Link>
          <Link href="/">
            <ArrowLeft size={16} />
            Volver al inicio
          </Link>
        </div>
      </aside>
      <div className="workspace-main">
        <header className="workspace-topbar">
          <div className="row-between">
            <button
              className="icon-button mobile-menu"
              aria-label="Abrir navegación"
              onClick={() => setOpen(true)}
            >
              <Menu size={21} />
            </button>
            <span className="topbar-title">
              GastroLinkAI <span style={{ padding: "0 10px" }}>/</span> Tu
              conexión con el origen
            </span>
          </div>
          <div className="workspace-account">
            <Link
              href={base}
              className="icon-button"
              aria-label="Ver actividad"
            >
              <Bell size={18} />
            </Link>
            <span className={"company-avatar " + (company?.color ?? "olive")}>
              {company?.initials ?? "AD"}
            </span>
            <div>
              <b>{company?.name ?? "Administración"}</b>
              <small>
                {user?.name}
                {user?.position ? " · " + user.position : ""}
              </small>
            </div>
            <button
              className="icon-button"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              onClick={() => {
                mutate((s) => {
                  s.session = null;
                });
                router.push("/login");
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>
        <main className="workspace-content">{children}</main>
      </div>
    </div>
  );
}
