"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="empty-state">
      <h1>No pudimos cargar esta página</h1>
      <p>Intenta de nuevo. Tus datos demo permanecen en este navegador.</p>
      <button className="button" onClick={reset}>
        Reintentar
      </button>
    </main>
  );
}
