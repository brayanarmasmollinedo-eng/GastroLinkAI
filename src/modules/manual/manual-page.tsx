"use client";
import Link from "next/link";
import { BookOpen, ArrowUpRight } from "lucide-react";
import { PublicShell } from "@/components/site-shell";
import { Markdown, headings } from "./markdown";
export default function ManualPage({ markdown }: { markdown: string }) {
  const toc = headings(markdown).filter((h) => h.level === 2);
  return (
    <PublicShell>
      <div className="container manual-layout">
        <aside className="manual-toc" aria-label="Índice del manual">
          <p className="eyebrow">
            <BookOpen size={15} /> MANUAL DE USUARIO
          </p>
          <nav>
            {toc.map((h) => (
              <a key={h.id} href={"#" + h.id}>
                {h.text}
              </a>
            ))}
          </nav>
          <Link className="button button-small" href="/login">
            Entrar a la demo <ArrowUpRight size={15} />
          </Link>
        </aside>
        <article className="manual-body">
          <Markdown source={markdown} />
        </article>
      </div>
    </PublicShell>
  );
}
