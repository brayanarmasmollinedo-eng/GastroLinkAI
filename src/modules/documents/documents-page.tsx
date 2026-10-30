"use client";
import { useState } from "react";
import { FileCheck2, Eye } from "lucide-react";
import { useDemo } from "@/components/demo-provider";
import {
  PageHeader,
  StatusBadge,
  dateLabel,
  Modal,
  Notice,
  EmptyState,
} from "@/components/ui";
import type { DemoDocument } from "@/domain/types";
export default function DocumentsPage() {
  const { state } = useDemo();
  const [document, setDocument] = useState<DemoDocument | null>(null);
  const documents = state.documents.filter(
    (d) => d.supplierId === state.session?.organizationId,
  );
  return (
    <>
      <PageHeader
        eyebrow="INFORMACIÓN QUE ACOMPAÑA TUS PRODUCTOS"
        title="Tus documentos, organizados."
        description="Consulta el estado y la vigencia de los documentos de demostración."
      />
      <Notice>
        Ejemplos ficticios. Este catálogo no establece qué documentos son
        legalmente obligatorios.
      </Notice>
      <div className="document-grid">
        {documents.map((d) => (
          <article className="document-card" key={d.id}>
            <FileCheck2 size={30} />
            <h3>{d.name}</h3>
            <StatusBadge status={d.status} />
            <p>Vencimiento demo: {dateLabel(d.expiresAt)}</p>
            <p>{d.issuer}</p>
            <button className="text-link" onClick={() => setDocument(d)}>
              <Eye size={16} />
              Ver documento demo
            </button>
          </article>
        ))}
      </div>
      {!documents.length && (
        <EmptyState
          title="No hay documentos en esta empresa demo"
          description="Los perfiles iniciales incluyen documentos de ejemplo. La carga de archivos se incorporará en el MVP."
        />
      )}
      {document && (
        <Modal
          title={document.name + " · DEMO"}
          onClose={() => setDocument(null)}
        >
          <Notice>DOCUMENTO FICTICIO — SIN VALIDEZ COMERCIAL O LEGAL</Notice>
          <div className="panel">
            <p className="eyebrow">GASTROLINKAI / DOCUMENTACIÓN DE EJEMPLO</p>
            <h3>{document.name}</h3>
            <p style={{ marginTop: 15 }}>
              Empresa:{" "}
              {
                state.organizations.find((o) => o.id === document.supplierId)
                  ?.name
              }
            </p>
            <p>Entidad: {document.issuer}</p>
            <p>Vencimiento: {dateLabel(document.expiresAt)}</p>
            <p style={{ marginTop: 15 }}>
              Esta vista simula la consulta de un documento. No contiene un
              certificado real ni representa una aprobación administrativa
              válida.
            </p>
          </div>
        </Modal>
      )}
    </>
  );
}
