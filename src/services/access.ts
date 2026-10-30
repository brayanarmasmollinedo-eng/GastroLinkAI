import type { DemoState, Role } from "@/domain/types";
export function requireSession(state: DemoState, role?: Role) {
  const s = state.session;
  if (!s || (role && s.role !== role))
    throw new Error("Este perfil no puede realizar la acción.");
  const user = state.users.find((u) => u.id === s.userId);
  if (!user?.active) throw new Error("El usuario demo está desactivado.");
  if (
    s.role !== "admin" &&
    !state.members.some(
      (m) =>
        m.userId === s.userId &&
        m.organizationId === s.organizationId &&
        m.role === s.role,
    )
  )
    throw new Error("No perteneces a esta empresa.");
  return s;
}
export function requireSupplier(state: DemoState) {
  const s = requireSession(state, "supplier");
  if (
    state.organizations.find((o) => o.id === s.organizationId)?.verification ===
    "SUSPENDIDO"
  )
    throw new Error("Este proveedor está suspendido en la demo.");
  return s;
}
export function activity(state: DemoState, label: string) {
  state.activities.unshift({
    id: crypto.randomUUID(),
    label,
    at: new Date().toISOString(),
  });
  state.activities = state.activities.slice(0, 100);
}
