import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { hashToken, readCookie } from "@/server/auth/session";
import { rateLimit } from "@/server/http/rate-limit";
import { ALLOWED_TYPES, safeBaseName } from "@/server/storage/files";
import { escapeHtml } from "@/server/email/templates";

describe("mots de passe", () => {
  it("vérifie un mot de passe haché et refuse un mauvais", async () => {
    const hash = await hashPassword("Caroube2028!");
    expect(hash.startsWith("pbkdf2$")).toBe(true);
    expect(await verifyPassword("Caroube2028!", hash)).toBe(true);
    expect(await verifyPassword("mauvais", hash)).toBe(false);
    expect(await verifyPassword("x", "format-invalide")).toBe(false);
  });
});

describe("sessions", () => {
  it("ne stocke qu'un hash stable du jeton", () => {
    expect(hashToken("abc")).toHaveLength(64);
    expect(hashToken("abc")).toBe(hashToken("abc"));
  });
  it("lit un cookie", () => {
    expect(readCookie("a=1; has_session=tok%3D; b=2", "has_session")).toBe("tok=");
    expect(readCookie(null, "has_session")).toBeNull();
  });
});

describe("limitation de débit", () => {
  it("bloque au-delà de la limite", () => {
    const key = `test-${Math.random()}`;
    expect([1, 2, 3].map(() => rateLimit(key, 2, 60_000))).toEqual([true, true, false]);
  });
});

describe("fichiers envoyés", () => {
  it("reconnaît les signatures binaires", () => {
    const enc = (s: string) => new TextEncoder().encode(s);
    expect(ALLOWED_TYPES["image/jpeg"]!.magic(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe(true);
    expect(ALLOWED_TYPES["application/pdf"]!.magic(enc("%PDF-1.7"))).toBe(true);
    expect(ALLOWED_TYPES["image/png"]!.magic(enc("<html>"))).toBe(false);
  });
});

describe("noms de fichiers", () => {
  it("nettoie le nom d'origine", () => {
    expect(safeBaseName("Plan F4 – Étage 2.PDF")).toBe("plan-f4-etage-2");
    expect(safeBaseName("....jpg")).toBe("fichier");
  });
});

describe("e-mails", () => {
  it("échappe le HTML saisi par les visiteurs", () => {
    expect(escapeHtml(`<script>"x"&'y'</script>`)).toBe("&lt;script&gt;&quot;x&quot;&amp;&#39;y&#39;&lt;/script&gt;");
  });
});
