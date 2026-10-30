"use client";
import Link from "next/link";
import { ArrowUpRight, Check, PackageOpen, X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
export const money = (amount: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(
    amount,
  );
export const dateLabel = (date: string) =>
  new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={
        "badge " +
        (/ACEPTADA|ENTREGADO|CONFIRMADO|Vigente|VERIFICADO/.test(status)
          ? "badge-green"
          : /RECHAZADA|SUSPENDIDO/.test(status)
            ? "badge-red"
            : "badge-gold")
      }
    >
      {status.replaceAll("_", " ").toLowerCase()}
    </span>
  );
}
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
export function EmptyState({
  title = "Aún no hay resultados",
  description = "Prueba otros filtros o empieza una nueva operación.",
  href,
  label,
}: {
  title?: string;
  description?: string;
  href?: string;
  label?: string;
}) {
  return (
    <div className="empty-state">
      <PackageOpen size={38} />
      <h3>{title}</h3>
      <p>{description}</p>
      {href && (
        <Link className="button" href={href}>
          {label ?? "Explorar productos"}
          <ArrowUpRight size={16} />
        </Link>
      )}
    </div>
  );
}
export function LoadingState() {
  return (
    <div className="loading" role="status" aria-label="Cargando">
      <div className="skeleton" />
      <div className="skeleton" />
      <div className="skeleton" />
    </div>
  );
}
export function FormField({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
export function Notice({
  children,
  error = false,
}: {
  children: ReactNode;
  error?: boolean;
}) {
  return (
    <div
      className={error ? "notice notice-error" : "notice"}
      role={error ? "alert" : "status"}
    >
      {!error && <Check size={18} />}
      <span>{children}</span>
    </div>
  );
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog ref={ref} className="modal" onCancel={onClose}>
      <div className="modal-heading">
        <h2>{title}</h2>
        <button className="icon-button" aria-label="Cerrar" onClick={onClose}>
          <X />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function DashboardMetric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
}) {
  return (
    <div className="metric">
      <div className="metric-top">
        <span>{label}</span>
        {icon}
      </div>
      <strong>{value}</strong>
      <small>Datos de tu espacio demo</small>
    </div>
  );
}
export function DataTable({
  headings,
  children,
}: {
  headings: string[];
  children: ReactNode;
}) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            {headings.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
