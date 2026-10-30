"use client";
import { useState, type FormEvent, type ReactNode } from "react";
import { useDemo } from "@/components/demo-provider";
import { PageHeader, FormField, Notice, StatusBadge } from "@/components/ui";
import {
  changePassword,
  saveCompany,
  saveContact,
} from "@/services/account-service";
import { hashPassword, newSalt } from "@/services/password";
import { errorMessage, passwordProblem } from "@/domain/validation";
import { categories } from "@/data/catalog";
import { PasswordInput } from "@/modules/auth/auth-page";
import {
  businessTypes,
  purchaseVolumes,
  supplierCertifications,
} from "@/domain/types";
type Result = { ok?: string; error?: string };
function useResult() {
  const [result, setResult] = useState<Result>({});
  const view = (
    <>
      {result.error && <Notice error>{result.error}</Notice>}
      {result.ok && <Notice>{result.ok}</Notice>}
    </>
  );
  return { setResult, view };
}
function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="panel profile-form" style={{ marginBottom: 22 }}>
      <p className="eyebrow">{title}</p>
      {children}
    </section>
  );
}
export default function ProfilePage() {
  const { state, mutate } = useDemo();
  const org = state.organizations.find(
    (o) => o.id === state.session?.organizationId,
  );
  const user = state.users.find((u) => u.id === state.session?.userId);
  const company = useResult();
  const contact = useResult();
  const security = useResult();
  if (!org || !user) return null;
  const supplier = org.kind === "supplier";
  function submit(
    e: FormEvent<HTMLFormElement>,
    target: ReturnType<typeof useResult>,
    action: (f: FormData) => void,
    ok: string,
  ) {
    e.preventDefault();
    try {
      action(new FormData(e.currentTarget));
      target.setResult({ ok });
    } catch (err) {
      target.setResult({ error: errorMessage(err) });
    }
  }
  return (
    <>
      <PageHeader
        eyebrow="TU IDENTIDAD COMERCIAL"
        title={supplier ? "Tu empresa proveedora." : "Un perfil para conectar."}
        description="Mantén al día los datos legales, comerciales y de contacto de tu empresa."
        action={<StatusBadge status={org.verification} />}
      />
      <Panel title="DATOS DE LA EMPRESA">
        <form
          onSubmit={(e) =>
            submit(
              e,
              company,
              (f) => {
                const get = (k: string) => String(f.get(k) ?? "");
                mutate((s) =>
                  saveCompany(s, {
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
              },
              "Datos de la empresa actualizados.",
            )
          }
        >
          <div className="form-grid">
            <FormField label="Nombre comercial">
              <input name="name" defaultValue={org.name} required minLength={3} maxLength={100} />
            </FormField>
            <FormField label="Razón social">
              <input name="legalName" defaultValue={org.details.legalName} required minLength={3} maxLength={150} />
            </FormField>
            <FormField label="Identificación fiscal" hint="RUC, NIF o CIF">
              <input name="taxId" defaultValue={org.details.taxId} required minLength={8} maxLength={15} />
            </FormField>
            <FormField label="Teléfono de la empresa">
              <input name="phone" type="tel" defaultValue={org.details.phone} required />
            </FormField>
            <FormField label="País">
              <input name="country" defaultValue={org.country} required minLength={2} maxLength={100} />
            </FormField>
            <FormField label="Ciudad">
              <input name="city" defaultValue={org.city} required minLength={2} maxLength={100} />
            </FormField>
          </div>
          <FormField label="Dirección fiscal">
            <input name="address" defaultValue={org.details.address} required minLength={5} maxLength={200} />
          </FormField>
          <FormField label="Sitio web (opcional)">
            <input name="website" type="url" defaultValue={org.details.website} maxLength={200} placeholder="https://" />
          </FormField>
          {supplier ? (
            <>
              <FormField label="Categorías que ofreces">
                <div className="check-grid">
                  {categories.map((c) => (
                    <label key={c.id}>
                      <input type="checkbox" name="categoryIds" value={c.id}
                        defaultChecked={org.categoryIds?.includes(c.id)} />
                      {c.name}
                    </label>
                  ))}
                </div>
              </FormField>
              <div className="form-grid">
                <FormField label="Capacidad mensual (kg)">
                  <input name="monthlyCapacityKg" type="number" min={1} step={1} required
                    defaultValue={org.monthlyCapacityKg ?? ""} />
                </FormField>
                <FormField label="Años de experiencia">
                  <input name="years" type="number" min={0} max={150} step={1} required
                    defaultValue={org.years} />
                </FormField>
              </div>
              <FormField label="Certificaciones">
                <div className="check-grid">
                  {supplierCertifications.map((c) => (
                    <label key={c}>
                      <input type="checkbox" name="certifications" value={c}
                        defaultChecked={org.certifications.includes(c)} />
                      {c}
                    </label>
                  ))}
                </div>
              </FormField>
            </>
          ) : (
            <div className="form-grid">
              <FormField label="Tipo de negocio">
                <select name="businessType" required defaultValue={org.businessType ?? ""}>
                  <option value="" disabled>Elige una opción</option>
                  {businessTypes.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Volumen de compra estimado">
                <select name="purchaseVolume" required defaultValue={org.purchaseVolume ?? ""}>
                  <option value="" disabled>Elige una opción</option>
                  {purchaseVolumes.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </FormField>
            </div>
          )}
          <FormField label="Descripción">
            <textarea name="description" defaultValue={org.description} maxLength={2000} />
          </FormField>
          {company.view}
          <button className="button">Guardar datos de la empresa</button>
        </form>
      </Panel>
      <Panel title="PERSONA DE CONTACTO">
        <form
          onSubmit={(e) =>
            submit(
              e,
              contact,
              (f) =>
                mutate((s) =>
                  saveContact(s, {
                    contactName: String(f.get("contactName") ?? ""),
                    position: String(f.get("position") ?? ""),
                    contactPhone: String(f.get("contactPhone") ?? ""),
                  }),
                ),
              "Datos de contacto actualizados.",
            )
          }
        >
          <div className="form-grid">
            <FormField label="Nombre y apellidos">
              <input name="contactName" defaultValue={user.name} required minLength={3} maxLength={100} />
            </FormField>
            <FormField label="Cargo">
              <input name="position" defaultValue={user.position} required minLength={2} maxLength={100} />
            </FormField>
            <FormField label="Teléfono de contacto">
              <input name="contactPhone" type="tel" defaultValue={user.phone} required />
            </FormField>
            <FormField label="Correo de acceso" hint="El correo identifica tu cuenta y no se puede cambiar en la demo.">
              <input readOnly value={user.email} />
            </FormField>
          </div>
          {contact.view}
          <button className="button">Guardar contacto</button>
        </form>
      </Panel>
      <Panel title="SEGURIDAD">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const f = new FormData(form);
            const next = String(f.get("next") ?? "");
            const problem = passwordProblem(next, String(f.get("confirm") ?? ""));
            if (problem) return security.setResult({ error: problem });
            try {
              const currentHash = await hashPassword(String(f.get("current") ?? ""), user.salt);
              const salt = newSalt();
              const newHash = await hashPassword(next, salt);
              mutate((s) => changePassword(s, { currentHash, newHash, newSalt: salt }));
              form.reset();
              security.setResult({ ok: "Contraseña actualizada." });
            } catch (err) {
              security.setResult({ error: errorMessage(err) });
            }
          }}
        >
          <FormField label="Contraseña actual">
            <PasswordInput name="current" autoComplete="current-password" />
          </FormField>
          <div className="form-grid">
            <FormField label="Nueva contraseña" hint="Mínimo 8 caracteres, con letras y números.">
              <PasswordInput name="next" autoComplete="new-password" />
            </FormField>
            <FormField label="Repite la nueva contraseña">
              <PasswordInput name="confirm" autoComplete="new-password" />
            </FormField>
          </div>
          {security.view}
          <button className="button">Cambiar contraseña</button>
        </form>
        <p className="demo-note">
          En esta demostración la contraseña se guarda cifrada (hash con sal) en
          tu navegador. La versión de producción validará el acceso en el
          servidor.
        </p>
      </Panel>
    </>
  );
}
