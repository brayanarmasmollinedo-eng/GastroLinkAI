import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { Markdown, headings, slugify } from "@/modules/manual/markdown";
const manual = readFileSync("docs/MANUAL_USUARIO.md", "utf8");
const html = (source: string) => renderToStaticMarkup(<Markdown source={source} />);
describe("manual de usuario dentro de la app", () => {
  it("genera ids de título al estilo GitHub (con tildes)", () => {
    expect(slugify("1. Primeros pasos")).toBe("1-primeros-pasos");
    expect(slugify("8. Inteligencia artificial: qué hace y cómo funciona")).toBe(
      "8-inteligencia-artificial-qué-hace-y-cómo-funciona",
    );
  });
  it("cada enlace interno del manual apunta a un título existente", () => {
    const ids = new Set(headings(manual).map((h) => h.id));
    const links = [...manual.matchAll(/\]\(#([^)]+)\)/g)].map((m) => m[1]);
    expect(links.length).toBeGreaterThan(5);
    for (const id of links) expect(ids.has(id), id).toBe(true);
  });
  it("renderiza tablas, listas, citas y formato en línea", () => {
    const out = html(
      "## Título\n\n> **Aviso:** texto\n\n| A | B |\n| --- | --- |\n| `x` | y |\n\n- uno\n- *dos*\n\n1. primero\n2. segundo\n",
    );
    expect(out).toContain('<h2 id="título">');
    expect(out).toContain("<blockquote>");
    expect(out).toContain("<table>");
    expect(out).toContain("<code>x</code>");
    expect(out).toContain("<em>dos</em>");
    expect(out).toContain("<ol>");
  });
  it("no genera HTML crudo ni enlaces peligrosos", () => {
    const out = html("<script>alert(1)</script> [malo](javascript:alert(1))");
    expect(out).not.toContain("<script>");
    expect(out).not.toContain('href="javascript');
  });
  it("renderiza el manual completo con todas sus secciones", () => {
    const out = html(manual);
    expect(out).toContain("Inteligencia artificial");
    expect((out.match(/<h2 /g) ?? []).length).toBe(11);
  });
});
