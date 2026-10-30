import Link from "next/link";
import {
  Search,
  FileText,
  Handshake,
  PackageCheck,
  ArrowUpRight,
} from "lucide-react";
import { PublicShell } from "@/components/site-shell";
export default function InfoPage({ about = false }: { about?: boolean }) {
  return (
    <PublicShell>
      <article className="container info-article">
        <p className="eyebrow">
          {about ? "NUESTRA VISIÓN" : "DE LA INSPIRACIÓN A LA OPERACIÓN"}
        </p>
        <h1>
          {about
            ? "El origen nos conecta."
            : "Tu próximo pedido empieza con una buena conexión."}
        </h1>
        <p>
          {about
            ? "GastroLinkAI nace de una idea sencilla: acercar la riqueza de los ingredientes peruanos a las cocinas y negocios que pueden darles un nuevo destino."
            : "Explora el catálogo, encuentra proveedores y recorre todo el proceso comercial desde un solo lugar."}
        </p>
        {about ? (
          <>
            <h2>Perú, gastronomía y nuevas oportunidades.</h2>
            <p>
              Queremos facilitar relaciones directas entre proveedores,
              restaurantes, distribuidores e importadores, con información clara
              y espacio para negociar las condiciones de cada operación.
            </p>
            <h2>Una visión que estamos construyendo.</h2>
            <p>
              Esta versión es un prototipo funcional. Todas las empresas,
              certificaciones y operaciones son ficticias. La búsqueda
              GastroLink AI permite preparar compras con IA cuando el servicio está configurado. Siempre requiere revisión humana antes de enviar una solicitud.
            </p>
          </>
        ) : (
          <div className="steps-grid">
            {[
              [
                Search,
                "01",
                "Descubre productos",
                "Busca un ingrediente, explora presentaciones y consulta el perfil de su proveedor.",
              ],
              [
                FileText,
                "02",
                "Solicita una cotización",
                "Indica cantidad, destino, fecha requerida y los requisitos de tu negocio.",
              ],
              [
                Handshake,
                "03",
                "Compara y conversa",
                "El proveedor responde desde su perfil demo. Revisa el precio, la entrega y las condiciones.",
              ],
              [
                PackageCheck,
                "04",
                "Acepta y sigue tu pedido",
                "Al aceptar una oferta se genera un pedido. El proveedor actualiza su seguimiento.",
              ],
            ].map(([Icon, num, title, text]) => {
              const I = Icon as typeof Search;
              return (
                <section className="step" key={String(num)}>
                  <div>
                    <I size={25} />
                    <span>{String(num)}</span>
                  </div>
                  <h3>{String(title)}</h3>
                  <p>{String(text)}</p>
                </section>
              );
            })}
          </div>
        )}
        <div className="button-row">
          <Link className="button" href="/marketplace">
            Explorar productos <ArrowUpRight size={17} />
          </Link>
          <Link className="button button-outline" href="/login">
            Recorrer la demo
          </Link>
        </div>
      </article>
    </PublicShell>
  );
}
