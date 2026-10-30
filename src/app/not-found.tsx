import Link from "next/link";
export default function NotFound() {
  return (
    <main className="empty-state">
      <h1>No encontramos esta página</h1>
      <p>La dirección no existe en esta demostración.</p>
      <Link className="button" href="/marketplace">
        Volver al marketplace
      </Link>
    </main>
  );
}
