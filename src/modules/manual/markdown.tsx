import type { ReactNode } from "react";
// Renderizador mínimo de Markdown para el manual: títulos, párrafos, listas, tablas,
// citas, separadores y formato en línea. Produce nodos de React (nunca HTML crudo).
export const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[`*]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
export interface Heading {
  level: number;
  text: string;
  id: string;
}
export function headings(markdown: string): Heading[] {
  return markdown
    .split("\n")
    .map((line) => line.match(/^(#{2,3})\s+(.*)$/))
    .filter((m): m is RegExpMatchArray => !!m)
    .map((m) => ({
      level: m[1].length,
      text: m[2].replace(/[`*]/g, ""),
      id: slugify(m[2]),
    }));
}
const safeHref = (href: string) => /^(#|\/|https?:\/\/)/.test(href);
function inline(text: string, keyPrefix: string): ReactNode[] {
  return text
    .split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|\*[^*\s][^*]*\*)/g)
    .filter(Boolean)
    .map((part, i) => {
      const key = keyPrefix + i;
      if (part.startsWith("**") && part.endsWith("**") && part.length > 4)
        return <strong key={key}>{inline(part.slice(2, -2), key)}</strong>;
      if (part.startsWith("`") && part.endsWith("`") && part.length > 2)
        return <code key={key}>{part.slice(1, -1)}</code>;
      const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (link && safeHref(link[2]))
        return link[2].startsWith("http") ? (
          <a key={key} href={link[2]} target="_blank" rel="noopener noreferrer">
            {link[1]}
          </a>
        ) : (
          <a key={key} href={link[2]}>
            {link[1]}
          </a>
        );
      if (part.startsWith("*") && part.endsWith("*") && part.length > 2)
        return <em key={key}>{part.slice(1, -1)}</em>;
      return part;
    });
}
const cells = (line: string) =>
  line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
export function Markdown({ source }: { source: string }) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const out: ReactNode[] = [];
  let i = 0;
  let k = 0;
  while (i < lines.length) {
    const line = lines[i];
    const key = "b" + k++;
    if (!line.trim()) {
      i++;
      continue;
    }
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4";
      out.push(
        <Tag key={key} id={slugify(heading[2])}>
          {inline(heading[2], key)}
        </Tag>,
      );
      i++;
    } else if (/^-{3,}$/.test(line.trim())) {
      out.push(<hr key={key} />);
      i++;
    } else if (line.startsWith(">")) {
      const quote: string[] = [];
      while (i < lines.length && lines[i].startsWith(">"))
        quote.push(lines[i++].replace(/^>\s?/, ""));
      out.push(
        <blockquote key={key}>{inline(quote.join(" "), key)}</blockquote>,
      );
    } else if (line.trim().startsWith("|") && lines[i + 1]?.includes("---")) {
      const head = cells(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|"))
        rows.push(cells(lines[i++]));
      out.push(
        <div className="table-scroll" key={key}>
          <table>
            <thead>
              <tr>
                {head.map((c, n) => (
                  <th key={n}>{inline(c, key + "h" + n)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, r) => (
                <tr key={r}>
                  {row.map((c, n) => (
                    <td key={n}>{inline(c, key + r + "c" + n)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
    } else if (/^(-|\d+\.)\s+/.test(line)) {
      const ordered = /^\d+\./.test(line);
      const items: string[] = [];
      while (i < lines.length && /^(-|\d+\.)\s+/.test(lines[i]))
        items.push(lines[i++].replace(/^(-|\d+\.)\s+/, ""));
      const List = ordered ? "ol" : "ul";
      out.push(
        <List key={key}>
          {items.map((item, n) => (
            <li key={n}>{inline(item, key + n)}</li>
          ))}
        </List>,
      );
    } else {
      const paragraph: string[] = [];
      while (
        i < lines.length &&
        lines[i].trim() &&
        !/^(#{1,4}\s|>|-{3,}$|\|)/.test(lines[i].trim()) &&
        !/^(-|\d+\.)\s+/.test(lines[i])
      )
        paragraph.push(lines[i++].trim());
      out.push(<p key={key}>{inline(paragraph.join(" "), key)}</p>);
    }
  }
  return <>{out}</>;
}
