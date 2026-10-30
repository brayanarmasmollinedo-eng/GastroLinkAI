"use client";
import { useState } from "react";
import { BrandEditor } from "@/components/brand-image";
import Link from "next/link";
import { useDemo } from "@/components/demo-provider";
import {
  PageHeader,
  DataTable,
  StatusBadge,
  Notice,
  Modal,
  dateLabel,
} from "@/components/ui";
import { verifySupplier, toggleUser } from "@/services/account-service";
import { errorMessage } from "@/domain/validation";
import type { Verification } from "@/domain/types";
export default function AdminPages({ section }: { section: string }) {
  const { state, mutate, reset } = useDemo();
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(false);
  function act(fn: () => void) {
    try {
      fn();
      setError("");
    } catch (e) {
      setError(errorMessage(e));
    }
  }
  const titles: Record<string, string> = {
    users: "Personas que dan vida a la plataforma.",
    suppliers: "Proveedores y sus conexiones.",
    buyers: "Compradores, nuevas oportunidades.",
    verifications: "Revisión de perfiles demo.",
    settings: "Configuración de la demostración.",
  };
  const organizations = state.organizations.filter(
    (o) => o.kind === (section === "buyers" ? "buyer" : "supplier"),
  );
  return (
    <>
      <PageHeader
        eyebrow="ADMINISTRACIÓN · ENTORNO FICTICIO"
        title={titles[section] ?? "Administración"}
        description="Gestiona información de ejemplo. Ninguna acción representa una verificación comercial real."
      />
      {error && <Notice error>{error}</Notice>}
      {section === "settings" && <BrandEditor />}
      {section === "users" ? (
        <section className="panel">
          <DataTable
            headings={[
              "Usuario",
              "Correo de acceso",
              "Empresa / perfil",
              "Estado",
              "Acción",
            ]}
          >
            {state.users.map((u) => (
              <tr key={u.id}>
                <td>
                  <b>{u.name}</b>
                  {u.position && <small style={{ display: "block" }}>{u.position}</small>}
                </td>
                <td>{u.email}</td>
                <td>
                  {state.organizations.find((o) =>
                    state.members.some(
                      (m) => m.userId === u.id && m.organizationId === o.id,
                    ),
                  )?.name ?? "Administración"}
                </td>
                <td>
                  <StatusBadge status={u.active ? "Activo" : "Desactivado"} />
                </td>
                <td>
                  {u.id !== state.session?.userId && (
                    <button
                      className="table-action"
                      onClick={() =>
                        act(() => mutate((s) => toggleUser(s, u.id)))
                      }
                    >
                      {u.active ? "Desactivar" : "Activar"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </DataTable>
        </section>
      ) : section === "settings" ? (
        <section className="panel profile-form">
          <h2 style={{ fontSize: 23 }}>
            Un entorno listo para volver a empezar.
          </h2>
          <p className="muted" style={{ margin: "20px 0" }}>
            La demostración guarda sus datos en este navegador. Puedes
            restablecer el catálogo, los perfiles y las operaciones iniciales.
          </p>
          <div className="summary-strip">
            <span>
              Idioma<b>Español</b>
            </span>
            <span>
              Moneda demo<b>EUR</b>
            </span>
            <span>
              Origen inicial<b>Perú → España</b>
            </span>
          </div>
          <button
            className="button button-outline"
            onClick={() => setConfirm(true)}
          >
            Restablecer datos demo
          </button>
          <p className="demo-note">
            Pagos y emails permanecen simulados. La IA requiere activación en el servidor; consulta docs/AI.md.
          </p>
        </section>
      ) : (
        <section className="panel">
          {section === "verifications" && (
            <Notice>
              “Verificado” es únicamente un estado simulado. Todos los perfiles
              públicos siguen identificados como demostración.
            </Notice>
          )}
          <DataTable
            headings={[
              "Empresa",
              "Datos legales",
              "Ubicación",
              ...(section === "buyers"
                ? ["Perfil comercial"]
                : ["Estado de revisión", "Acciones"]),
            ]}
          >
            {organizations.map((o) => (
              <tr key={o.id}>
                <td>
                  <div className="mini-product">
                    <span className={"company-avatar " + o.color}>
                      {o.initials}
                    </span>
                    <div>
                      <b>{o.name}</b>
                      <small className="demo-caption">Empresa ficticia</small>
                    </div>
                  </div>
                </td>
                <td>
                  {o.details.legalName}
                  <small style={{ display: "block" }}>
                    {o.details.taxId} · {o.details.phone}
                  </small>
                </td>
                <td>
                  {o.city}, {o.country}
                </td>
                {section === "buyers" ? (
                  <td>
                    <span className="tag">{o.businessType ?? "Comprador"}</span>
                    {o.purchaseVolume && (
                      <small style={{ display: "block" }}>{o.purchaseVolume}</small>
                    )}
                  </td>
                ) : (
                  <>
                    <td>
                      <StatusBadge status={o.verification} />
                    </td>
                    <td>
                      <select
                        style={{ width: 190, fontSize: 11 }}
                        aria-label={"Estado demo de " + o.name}
                        value={o.verification}
                        onChange={(e) =>
                          act(() =>
                            mutate((s) =>
                              verifySupplier(
                                s,
                                o.id,
                                e.target.value as Verification,
                              ),
                            ),
                          )
                        }
                      >
                        {(
                          [
                            "PENDIENTE_VERIFICACION",
                            "VERIFICADO",
                            "OBSERVADO",
                            "SUSPENDIDO",
                          ] as Verification[]
                        ).map((v) => (
                          <option value={v} key={v}>
                            {v.replaceAll("_", " ")}
                          </option>
                        ))}
                      </select>
                      <Link
                        className="table-action"
                        href={"/suppliers/" + o.slug}
                      >
                        Ver perfil
                      </Link>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </DataTable>
        </section>
      )}
      {section === "users" && (
        <section className="panel">
          <h3>Últimos registros demo</h3>
          <ul className="activity-list">
            {state.activities
              .filter((a) => a.label.includes("registrada"))
              .slice(0, 5)
              .map((a) => (
                <li key={a.id}>
                  {a.label}
                  <small>{dateLabel(a.at)}</small>
                </li>
              ))}
            <li>
              {state.users.length} perfiles disponibles en esta demostración.
            </li>
          </ul>
        </section>
      )}
      {confirm && (
        <Modal
          title="Restablecer todos los datos demo"
          onClose={() => setConfirm(false)}
        >
          <p>
            Las solicitudes, pedidos y perfiles creados en este navegador se
            sustituirán por los datos iniciales. Se cerrará la sesión demo.
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
              }}
            >
              Restablecer
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
