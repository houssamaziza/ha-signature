/**
 * Hachage des mots de passe avec PBKDF2-SHA256 (Web Crypto : identique sous
 * Node et sur Cloudflare Workers, aucune dépendance).
 * Format stocké : pbkdf2$<itérations>$<selBase64>$<hashBase64>
 */
const ITERATIONS = 100_000;
const KEY_BITS = 256;

const b64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function derive(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations }, key, KEY_BITS);
  return new Uint8Array(bits);
}

/** Comparaison à temps constant. */
function equal(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i]! ^ b[i]!;
  return diff === 0;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(password, salt, ITERATIONS);
  return ["pbkdf2", ITERATIONS, b64(salt), b64(hash)].join("$");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iterations = Number(parts[1]);
  if (!Number.isInteger(iterations) || iterations < 10_000 || iterations > 1_000_000) return false;
  try {
    const expected = unb64(parts[3]!);
    return equal(await derive(password, unb64(parts[2]!), iterations), expected);
  } catch {
    return false;
  }
}

/** Hash factice pour garder un temps de réponse constant quand l'e-mail est inconnu. */
export const DUMMY_HASH = `pbkdf2$${ITERATIONS}$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=`;
