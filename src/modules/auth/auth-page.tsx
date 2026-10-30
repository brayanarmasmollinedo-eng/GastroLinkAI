"use client";
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowUpRight, Eye, EyeOff, Globe2, KeyRound } from "lucide-react";
import { PublicHeader } from "@/components/site-shell";
import { FormField, Notice } from "@/components/ui";
import { useDemo } from "@/components/demo-provider";
import {
  loginSalt,
  loginWithPassword,
  registerDemo,
} from "@/services/account-service";
import {
  DEMO_PASSWORD,
  DEMO_SALT,
  hashPassword,
  newSalt,
} from "@/services/password";
import { errorMessage, passwordProblem } from "@/domain/validation";
import { categories } from "@/data/catalog";
import {
  businessTypes,
  purchaseVolumes,
  supplierCertifications,
  type Role,
} from "@/domain/types";
const roleNames: Record<Role, string> = {
  buyer: "Empresa compradora",
  supplier: "Proveedor",
  admin: "Administrador",
};
const home = (role: Role) =>
  role === "supplier" ? "/supplier" : role === "admin" ? "/admin" : "/dashboard";
function useDestination() {
  const params = useSearchParams();
  const router = useRouter();
  return (role: Role) => {
    const next = params.get("next");
    router.push(
      next?.startsWith("/") && !next.startsWith("//") ? next : home(role),
    );
  };
}
export function PasswordInput(props: {
  name: string;
  autoComplete: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="password-field">
      <input
        name={props.name}
        type={visible ? "text" : "password"}
        autoComplete={props.autoComplete}
        required
        maxLength={128}
        placeholder={props.placeholder}
        {...(props.onChange
          ? {
              value: props.value,
              onChange: (e) => props.onChange!(e.target.value),
            }
          : {})}
      />
      <button
        type="button"
        className="icon-button"
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        onClick={() => setVisible(!visible)}
      >
        {visible ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );
}
function RoleTabs({
  roles,
  role,
  onChange,
}: {
  roles: Role[];
  role: Role;
  onChange: (role: Role) => void;
}) {
  return (
    <div className="role-tabs" role="tablist" aria-label="Tipo de cuenta">
      {roles.map((r) => (
        <button
          type="button"
          role="tab"
          aria-selected={role === r}
          key={r}
          className={role === r ? "active" : ""}
          onClick={() => onChange(r)}
        >
          {roleNames[r]}
        </button>
      ))}
    </div>
  );
}
function LoginForm() {
  const { state, mutate, ready } = useDemo();
  const params = useSearchParams();
  const go = useDestination();
  const param = params.get("role");
  const [role, setRole] = useState<Role>(
    param === "supplier" || param === "admin" ? param : "buyer",
  );
  // ?org=… (enlaces «continuar como proveedor») rellena el correo de esa empresa.
  const orgUser = state.members.find(
    (m) => m.organizationId === params.get("org"),
  )?.userId;
  const [email, setEmail] = useState(
    () => state.users.find((u) => u.id === orgUser)?.email ?? "",
  );
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const accounts = state.users.filter((u) => {
    if (u.salt !== DEMO_SALT || !u.active) return false;
    if (role === "admin") return !!u.platformAdmin;
    return state.members.some((m) => m.userId === u.id && m.role === role);
  });
  return (
    <>
      <p className="eyebrow">BIENVENIDO A GASTROLINKAI</p>
      <h2>Inicia sesión en tu cuenta.</h2>
      <p>Elige el tipo de cuenta y entra con tu correo y contraseña.</p>
      <RoleTabs
        roles={["buyer", "supplier", "admin"]}
        role={role}
        onChange={(r) => {
          setRole(r);
          setError("");
        }}
      />
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          try {
            const passwordHash = await hashPassword(
              password,
              loginSalt(state, email),
            );
            mutate((s) => loginWithPassword(s, { email, passwordHash, role }));
            go(role);
          } catch (err) {
            setError(errorMessage(err));
            setBusy(false);
          }
        }}
      >
        <FormField label="Correo electrónico">
          <input
            name="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={
              role === "supplier"
                ? "ventas@tuempresa.com"
                : role === "admin"
                  ? "admin@gastrolinkai.example"
                  : "compras@tuempresa.com"
            }
          />
        </FormField>
        <FormField label="Contraseña">
          <PasswordInput
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={setPassword}
          />
        </FormField>
        {error && <Notice error>{error}</Notice>}
        <button className="button" disabled={!ready || busy}>
          {busy ? "Verificando…" : "Iniciar sesión como " + roleNames[role].toLowerCase()}
          <ArrowUpRight size={18} />
        </button>
      </form>
      {role !== "admin" && (
        <p style={{ marginTop: 20, textAlign: "center" }}>
          ¿Aún no tienes cuenta?{" "}
          <Link
            className="text-link"
            href={"/register" + (role === "supplier" ? "?role=supplier" : "")}
          >
            Registra tu {role === "supplier" ? "empresa proveedora" : "empresa"}
          </Link>
        </p>
      )}
      <section className="demo-accounts" aria-label="Cuentas de demostración">
        <div className="row-between">
          <b>
            <KeyRound size={15} /> Cuentas de demostración
          </b>
          <span className="tag">
            Contraseña: <code>{DEMO_PASSWORD}</code>
          </span>
        </div>
        <p className="demo-note">
          Para presentar la plataforma. Pulsa una cuenta para rellenar el
          formulario y luego «Iniciar sesión».
        </p>
        <ul>
          {accounts.map((u) => {
            const org = state.organizations.find(
              (o) =>
                o.id ===
                state.members.find((m) => m.userId === u.id)?.organizationId,
            );
            return (
              <li key={u.id}>
                <button
                  type="button"
                  onClick={() => {
                    setEmail(u.email);
                    setPassword(DEMO_PASSWORD);
                    setError("");
                  }}
                >
                  <span>
                    <b>{org?.name ?? u.name}</b>
                    <small>
                      {u.email}
                      {org ? " · " + org.city : ""}
                    </small>
                  </span>
                  <span className="demo-accounts-use">Usar</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="form-section">
      <legend>{title}</legend>
      {children}
    </fieldset>
  );
}
function RegisterForm() {
  const { mutate, ready } = useDemo();
  const params = useSearchParams();
  const go = useDestination();
  const [role, setRole] = useState<"buyer" | "supplier">(
    params.get("role") === "supplier" ? "supplier" : "buyer",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const supplier = role === "supplier";
  return (
    <>
      <p className="eyebrow">REGISTRO DE EMPRESA</p>
      <h2>Tu próxima conexión empieza aquí.</h2>
      <p>
        {supplier
          ? "Registra tu empresa proveedora para publicar productos y responder cotizaciones."
          : "Registra tu empresa para descubrir proveedores y solicitar cotizaciones."}
      </p>
      <RoleTabs
        roles={["buyer", "supplier"]}
        role={role}
        onChange={(r) => {
          setRole(r as "buyer" | "supplier");
          setError("");
        }}
      />
      <form
        key={role}
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          const f = new FormData(e.currentTarget);
          const get = (k: string) => String(f.get(k) ?? "");
          const problem = passwordProblem(get("password"), get("confirm"));
          if (problem) return setError(problem);
          setBusy(true);
          try {
            const salt = newSalt();
            const passwordHash = await hashPassword(get("password"), salt);
            mutate((s) =>
              registerDemo(s, {
                role,
                email: get("email"),
                passwordHash,
                salt,
                acceptTerms: f.get("terms") === "on",
                company: {
                  name: get("name"),
                  legalName: get("legalName"),
                  taxId: get("taxId"),
                  country: get("country"),
                  city: get("city"),
                  address: get("address"),
                  phone: get("phone"),
                  website: get("website"),
                  description: get("description"),
                },
                contact: {
                  contactName: get("contactName"),
                  position: get("position"),
                  contactPhone: get("contactPhone"),
                },
                ...(supplier
                  ? {
                      supplier: {
                        categoryIds: f.getAll("categoryIds").map(String),
                        monthlyCapacityKg: get("monthlyCapacityKg"),
                        certifications: f
                          .getAll("certifications")
                          .map(String) as (typeof supplierCertifications)[number][],
                        years: get("years"),
                      },
                    }
                  : {
                      buyer: {
                        businessType: get("businessType") as never,
                        purchaseVolume: get("purchaseVolume") as never,
                      },
                    }),
              }),
            );
            go(role);
          } catch (err) {
            setError(errorMessage(err));
            setBusy(false);
          }
        }}
      >
        <Section title="1. Datos de la empresa">
          <div className="form-grid">
            <FormField label="Nombre comercial">
              <input name="name" required minLength={3} maxLength={100}
                placeholder={supplier ? "Andes Export" : "Restaurante La Huerta"} />
            </FormField>
            <FormField label="Razón social">
              <input name="legalName" required minLength={3} maxLength={150}
                placeholder={supplier ? "Andes Export S.A.C." : "La Huerta Gastro S.L."} />
            </FormField>
            <FormField
              label="Identificación fiscal"
              hint={supplier ? "RUC (Perú) u otro registro" : "NIF / CIF u otro registro"}
            >
              <input name="taxId" required minLength={8} maxLength={15}
                pattern="[A-Za-z0-9\-]{8,15}"
                placeholder={supplier ? "20601234567" : "B12345678"} />
            </FormField>
            <FormField label="Teléfono de la empresa">
              <input name="phone" type="tel" required autoComplete="tel"
                placeholder={supplier ? "+51 1 700 1234" : "+34 910 000 000"} />
            </FormField>
            <FormField label="País">
              <input name="country" required minLength={2} maxLength={100}
                defaultValue={supplier ? "Perú" : "España"} autoComplete="country-name" />
            </FormField>
            <FormField label="Ciudad">
              <input name="city" required minLength={2} maxLength={100}
                defaultValue={supplier ? "Lima" : "Madrid"} autoComplete="address-level2" />
            </FormField>
          </div>
          <FormField label="Dirección fiscal">
            <input name="address" required minLength={5} maxLength={200}
              autoComplete="street-address" placeholder="Calle, número y distrito" />
          </FormField>
          <FormField label="Sitio web (opcional)">
            <input name="website" type="url" maxLength={200} placeholder="https://" />
          </FormField>
        </Section>
        <Section title="2. Perfil comercial">
          {supplier ? (
            <>
              <FormField label="Categorías que ofreces">
                <div className="check-grid">
                  {categories.map((c) => (
                    <label key={c.id}>
                      <input type="checkbox" name="categoryIds" value={c.id} />
                      {c.name}
                    </label>
                  ))}
                </div>
              </FormField>
              <div className="form-grid">
                <FormField label="Capacidad mensual (kg)">
                  <input name="monthlyCapacityKg" type="number" min={1} step={1}
                    required placeholder="5000" />
                </FormField>
                <FormField label="Años de experiencia">
                  <input name="years" type="number" min={0} max={150} step={1}
                    required defaultValue={0} />
                </FormField>
              </div>
              <FormField label="Certificaciones (opcional)">
                <div className="check-grid">
                  {supplierCertifications.map((c) => (
                    <label key={c}>
                      <input type="checkbox" name="certifications" value={c} />
                      {c}
                    </label>
                  ))}
                </div>
              </FormField>
              <FormField label="Descripción de la empresa (opcional)">
                <textarea name="description" maxLength={2000}
                  placeholder="Origen de tus productos, mercados a los que exportas, presentaciones…" />
              </FormField>
            </>
          ) : (
            <div className="form-grid">
              <FormField label="Tipo de negocio">
                <select name="businessType" required defaultValue="">
                  <option value="" disabled>Elige una opción</option>
                  {businessTypes.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Volumen de compra estimado">
                <select name="purchaseVolume" required defaultValue="">
                  <option value="" disabled>Elige una opción</option>
                  {purchaseVolumes.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </FormField>
            </div>
          )}
        </Section>
        <Section title="3. Persona de contacto">
          <div className="form-grid">
            <FormField label="Nombre y apellidos">
              <input name="contactName" required minLength={3} maxLength={100}
                autoComplete="name" />
            </FormField>
            <FormField label="Cargo">
              <input name="position" required minLength={2} maxLength={100}
                placeholder={supplier ? "Responsable comercial" : "Jefe de compras"}
                autoComplete="organization-title" />
            </FormField>
          </div>
          <FormField label="Teléfono de contacto">
            <input name="contactPhone" type="tel" required autoComplete="tel" />
          </FormField>
        </Section>
        <Section title="4. Datos de acceso">
          <FormField label="Correo electrónico" hint="Será tu usuario para iniciar sesión.">
            <input name="email" type="email" required autoComplete="email"
              placeholder={supplier ? "ventas@tuempresa.com" : "compras@tuempresa.com"} />
          </FormField>
          <div className="form-grid">
            <FormField label="Contraseña" hint="Mínimo 8 caracteres, con letras y números.">
              <PasswordInput name="password" autoComplete="new-password" />
            </FormField>
            <FormField label="Repite la contraseña">
              <PasswordInput name="confirm" autoComplete="new-password" />
            </FormField>
          </div>
          <label className="check-line">
            <input type="checkbox" name="terms" required />
            <span>
              Acepto las condiciones de uso. Entiendo que es una demostración y
              que no debo introducir datos reales ni confidenciales.
            </span>
          </label>
        </Section>
        {supplier && (
          <p className="demo-note">
            Las empresas proveedoras nuevas quedan «pendientes de verificación»
            hasta que la administración revise su documentación.
          </p>
        )}
        {error && <Notice error>{error}</Notice>}
        <button className="button" disabled={!ready || busy}>
          {busy ? "Creando cuenta…" : "Crear cuenta de " + roleNames[role].toLowerCase()}
          <ArrowUpRight size={18} />
        </button>
      </form>
      <p style={{ marginTop: 20, textAlign: "center" }}>
        ¿Ya tienes cuenta?{" "}
        <Link className="text-link" href={"/login?role=" + role}>
          Inicia sesión
        </Link>
      </p>
    </>
  );
}
export default function AuthPage({ register = false }: { register?: boolean }) {
  return (
    <>
      <PublicHeader />
      <main className="auth-page">
        <section className="auth-story">
          <p className="eyebrow" style={{ color: "#c9ba95" }}>
            <Globe2 size={19} />
            EL ORIGEN NOS CONECTA
          </p>
          <h1>
            Buenas relaciones.
            <br />
            Extraordinarios
            <br />
            <em>ingredientes.</em>
          </h1>
          <p>
            Compradores gastronómicos y proveedores peruanos en un mismo
            espacio: catálogo, cotizaciones, pedidos y mensajes.
          </p>
          <img src="/images/hero.jpg" alt="Inspiración gastronómica" />
        </section>
        <section className="auth-form">
          {register ? <RegisterForm /> : <LoginForm />}
          <p className="demo-note" style={{ marginTop: 20 }}>
            Entorno de demostración: los datos se guardan solo en este
            navegador, con empresas ficticias. No se envían correos ni se
            realizan operaciones reales.
          </p>
        </section>
      </main>
    </>
  );
}
