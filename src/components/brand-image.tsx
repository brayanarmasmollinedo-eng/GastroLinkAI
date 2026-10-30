"use client";
import { useEffect, useState } from "react";
const key = "gastrolinkai.brand.image.v1";
export function useBrandImage() {
  const [image, setImage] = useState("");
  useEffect(() => {
    const refresh = () => {
      try {
        setImage(localStorage.getItem(key) ?? "");
      } catch {
        setImage("");
      }
    };
    refresh();
    window.addEventListener("gastrolink-brand", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("gastrolink-brand", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  return image;
}
export function BrandImage() {
  const image = useBrandImage();
  return image ? (
    <img
      className="brand-original"
      src={image}
      alt="GastroLinkAI — Peruvian Gastronomy AI Logistics"
    />
  ) : null;
}
export function BrandEditor() {
  const image = useBrandImage();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <section className="panel">
      <h2 style={{ fontSize: 24 }}>Tu identidad visual</h2>
      <p className="muted" style={{ margin: "15px 0" }}>
        Carga el logo original que compartiste: se conserva completo, con sus
        símbolos y colores. Se guarda solo en este navegador.
      </p>
      {image && (
        <img
          src={image}
          alt="Logo actual de GastroLinkAI"
          style={{
            maxWidth: 300,
            maxHeight: 200,
            objectFit: "contain",
            marginBottom: 20,
          }}
        />
      )}
      <label className="field">
        <span>Logo PNG, JPEG o WebP · máximo 2 MB</span>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          disabled={busy}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setBusy(true);
            setError("");
            try {
              if (
                file.size > 2 * 1024 * 1024 ||
                !["image/png", "image/jpeg", "image/webp"].includes(file.type)
              )
                throw new Error("Usa PNG, JPEG o WebP de hasta 2 MB.");
              const bitmap = await createImageBitmap(file);
              if (bitmap.width > 5000 || bitmap.height > 5000) {
                bitmap.close();
                throw new Error(
                  "La imagen debe medir menos de 5000 px por lado.",
                );
              }
              bitmap.close();
              const data = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(String(reader.result));
                reader.onerror = () =>
                  reject(new Error("No se pudo leer la imagen."));
                reader.readAsDataURL(file);
              });
              localStorage.setItem(key, data);
              window.dispatchEvent(new Event("gastrolink-brand"));
            } catch (err) {
              setError(
                err instanceof Error
                  ? err.message
                  : "No se pudo guardar el logo.",
              );
            } finally {
              setBusy(false);
              e.target.value = "";
            }
          }}
        />
      </label>
      {error && (
        <p role="alert" className="notice notice-error">
          {error}
        </p>
      )}
      {image && (
        <button
          className="button button-outline"
          onClick={() => {
            localStorage.removeItem(key);
            window.dispatchEvent(new Event("gastrolink-brand"));
          }}
        >
          Quitar logo cargado
        </button>
      )}
    </section>
  );
}
