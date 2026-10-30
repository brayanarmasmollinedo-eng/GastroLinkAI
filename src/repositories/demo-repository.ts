import type { DemoState } from "@/domain/types";
import { createSeed } from "@/data/seed";
export interface DemoRepository {
  load(): DemoState;
  save(state: DemoState): void;
}
// v2: cuentas con contraseña y datos legales de empresa. Los datos v1 se ignoran.
export const STORAGE_KEY = "gastrolinkai.demo.v2";
export class BrowserDemoRepository implements DemoRepository {
  load(): DemoState {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createSeed();
    const value = JSON.parse(raw) as DemoState;
    if (
      value.version !== 2 ||
      !Array.isArray(value.products) ||
      !Array.isArray(value.members) ||
      ![
        value.orders,
        value.users,
        value.organizations,
        value.requests,
        value.offers,
        value.conversations,
        value.messages,
        value.documents,
        value.favorites,
        value.savedSuppliers,
        value.activities,
      ].every(Array.isArray)
    )
      throw new Error(
        "Los datos locales no son compatibles. Restablece la demostración.",
      );
    return value;
  }
  save(state: DemoState) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}
export class MemoryDemoRepository implements DemoRepository {
  constructor(private state = createSeed()) {}
  load() {
    return structuredClone(this.state);
  }
  save(state: DemoState) {
    this.state = structuredClone(state);
  }
}
