// Hash de contraseñas con Web Crypto (navegador y Node 22). En esta demo los datos viven
// en localStorage, así que esto evita guardar contraseñas en claro, pero no es seguridad
// de servidor: el MVP debe autenticar en backend.
const ITERATIONS = 100_000;
const toHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, "0")).join(
    "",
  );
export async function hashPassword(password: string, salt: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: encoder.encode(salt), iterations: ITERATIONS },
    key,
    256,
  );
  return toHex(bits);
}
export function newSalt() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return toHex(bytes.buffer);
}
/** Contraseña común de las cuentas de demostración precargadas. */
export const DEMO_PASSWORD = "Demo2026!";
export const DEMO_SALT = "gastrolinkai-demo";
// hashPassword(DEMO_PASSWORD, DEMO_SALT), precalculado porque la semilla es síncrona.
export const DEMO_PASSWORD_HASH =
  "1a98f526dcca014b9ff405aa49ad4e85467271252abe42444c53d5b6afd99e59";
