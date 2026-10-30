import { readFile } from "node:fs/promises";
import path from "node:path";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import RouteView from "@/modules/route-view";
import { LoadingState } from "@/components/ui";
import ManualPage from "@/modules/manual/manual-page";
const workspaceSections: Record<string, string[]> = {
  dashboard: ["quotations", "orders", "favorites", "messages", "profile"],
  supplier: [
    "products",
    "quotations",
    "orders",
    "inventory",
    "documents",
    "messages",
    "company",
  ],
  admin: [
    "users",
    "suppliers",
    "buyers",
    "products",
    "quotations",
    "orders",
    "verifications",
    "settings",
  ],
};
function valid(segments: string[]) {
  const [root, section, id, action] = segments;
  if (
    [
      "marketplace",
      "login",
      "register",
      "about",
      "how-it-works",
      "manual",
    ].includes(root)
  )
    return segments.length === 1;
  if (root === "products") return segments.length === 2;
  if (root === "suppliers") return segments.length <= 2;
  if (!(root in workspaceSections)) return false;
  if (!section) return true;
  if (!workspaceSections[root].includes(section)) return false;
  if (segments.length === 2) return true;
  if (!["quotations", "orders"].includes(section) || !id) return false;
  return (
    segments.length === 3 ||
    (section === "quotations" &&
      action === "compare" &&
      root !== "supplier" &&
      segments.length === 4)
  );
}
export default async function Page({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const { path: segments } = await params;
  if (!valid(segments)) notFound();
  if (segments[0] === "manual") {
    // Fuente única: el mismo archivo que se publica en docs/.
    const markdown = await readFile(
      path.join(process.cwd(), "docs", "MANUAL_USUARIO.md"),
      "utf8",
    );
    return <ManualPage markdown={markdown} />;
  }
  return (
    <Suspense fallback={<LoadingState />}>
      <RouteView key={segments.join("/")} path={segments} />
    </Suspense>
  );
}
