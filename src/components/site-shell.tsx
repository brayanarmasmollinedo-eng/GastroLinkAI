"use client";
import Link from "next/link";
import { BrandImage, useBrandImage } from "./brand-image";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight, Globe2, Menu, Sprout, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useDemo } from "./demo-provider";
import { Modal } from "./ui";
export function Brand({ light = false }: { light?: boolean }) {
  const image = useBrandImage();
  if (image)
    return (
      <Link href="/" className="brand brand-with-image">
        <BrandImage />
      </Link>
    );
  return (
    <Link href="/" className={"brand " + (light ? "brand-light" : "")}>
      <span className="brand-symbol">
        <Sprout size={24} />
      </span>
      <span>
        GastroLink<span className="brand-ai">AI</span>
        <small>DEL ORIGEN A TU COCINA</small>
      </span>
    </Link>
  );
}
export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const { state } = useDemo();
  const path = usePathname();
  const dashboard =
    state.session?.role === "supplier"
      ? "/supplier"
      : state.session?.role === "admin"
        ? "/admin"
        : "/dashboard";
  return (
    <>
      <div className="demo-strip">
        <span>PERÚ → EL MUNDO</span>
        <span>Un nuevo origen para tus mejores ideas.</span>
        <span className="demo-pill">Datos de demostración</span>
      </div>
      <header className="public-header">
        <div className="container nav-inner">
          <Brand />
          <nav
            className={open ? "public-nav is-open" : "public-nav"}
            aria-label="Navegación principal"
          >
            {[
              ["/marketplace", "Marketplace"],
              ["/suppliers", "Proveedores"],
              ["/how-it-works", "Cómo funciona"],
              ["/manual", "Manual"],
              ["/about", "Nosotros"],
            ].map(([href, label]) => (
              <Link
                onClick={() => setOpen(false)}
                className={path === href ? "active" : ""}
                key={href}
                href={href}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="nav-actions">
            <Link
              className="login-link"
              href={state.session ? dashboard : "/login"}
            >
              {state.session ? "Mi espacio" : "Iniciar sesión"}
            </Link>
            <Link className="button button-small" href="/register">
              Crear cuenta <ArrowUpRight size={15} />
            </Link>
          </div>
          <button
            className="mobile-menu icon-button"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </header>
    </>
  );
}
export function Footer() {
  const router = useRouter();
  const { reset } = useDemo();
  const [confirm, setConfirm] = useState(false);
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-main">
          <div>
            <Brand light />
            <p>
              El origen nos conecta.
              <br />
              Las oportunidades nos llevan más lejos.
            </p>
          </div>
          <div>
            <b>Descubre</b>
            <Link href="/marketplace">Marketplace</Link>
            <Link href="/suppliers">Proveedores</Link>
            <Link href="/how-it-works">Cómo funciona</Link>
            <Link href="/manual">Manual de usuario</Link>
          </div>
          <div>
            <b>Tu próximo paso</b>
            <Link href="/register?role=supplier">Quiero vender</Link>
            <Link href="/login">Explorar la demo</Link>
            <Link href="/about">Sobre GastroLinkAI</Link>
          </div>
          <div className="footer-world">
            <Globe2 size={42} />
            <span>
              Desde Perú.
              <br />
              Para nuevas mesas.
            </span>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © 2026 GastroLinkAI · Prototipo. Empresas y operaciones ficticias.
          </span>
          <button onClick={() => setConfirm(true)}>
            Restablecer datos demo
          </button>
        </div>
      </div>
      {confirm && (
        <Modal
          title="Restablecer la demostración"
          onClose={() => setConfirm(false)}
        >
          <p>
            Se eliminarán las operaciones creadas en este navegador y se
            recuperarán los datos iniciales.
          </p>
          <div className="button-row">
            <button
              className="button button-outline"
              onClick={() => setConfirm(false)}
            >
              Cancelar
            </button>
            <button
              className="button"
              onClick={() => {
                reset();
                setConfirm(false);
                router.push("/");
              }}
            >
              Restablecer demo
            </button>
          </div>
        </Modal>
      )}
    </footer>
  );
}
export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <>
      <PublicHeader />
      <main>{children}</main>
      <Footer />
    </>
  );
}
