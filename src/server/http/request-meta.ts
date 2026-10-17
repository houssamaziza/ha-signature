/**
 * Métadonnées de requête sans stocker d'adresse IP :
 * le pays/la ville viennent des en-têtes ajoutés par le CDN.
 *  - Cloudflare : CF-IPCountry (toujours) et CF-IPCity (option « Add visitor location headers »)
 *  - Vercel : x-vercel-ip-country / x-vercel-ip-city
 */

export function clientKey(headers: Headers): string {
  // Utilisé uniquement en mémoire pour la limitation de débit, jamais enregistré.
  return (
    headers.get("cf-connecting-ip") ??
    headers.get("x-real-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

export function getCountry(headers: Headers): string | null {
  const raw = headers.get("cf-ipcountry") ?? headers.get("x-vercel-ip-country");
  if (!raw) return null;
  const code = raw.trim().toUpperCase();
  // XX = inconnu, T1 = Tor (Cloudflare)
  return /^[A-Z]{2}$/.test(code) && code !== "XX" && code !== "T1" ? code : null;
}

export function getCity(headers: Headers): string | null {
  const raw = headers.get("cf-ipcity") ?? headers.get("x-vercel-ip-city");
  if (!raw) return null;
  try {
    return decodeURIComponent(raw).slice(0, 80);
  } catch {
    return raw.slice(0, 80);
  }
}

export type Device = "MOBILE" | "TABLET" | "DESKTOP";

export function getDevice(userAgent: string | null): Device {
  const ua = userAgent ?? "";
  if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua)) return "TABLET";
  if (/Mobi|iPhone|iPod|Android|IEMobile|Opera Mini/i.test(ua)) return "MOBILE";
  return "DESKTOP";
}

/** Classe la provenance : google | social | whatsapp | direct | <domaine>. */
export function classifySource(referrer: string | undefined, utmSource: string | undefined, ownHost: string | null) {
  const utm = utmSource?.toLowerCase();
  if (utm) {
    if (utm.includes("whatsapp")) return { source: "whatsapp", referrerHost: null };
    if (/(facebook|instagram|fb|ig|meta)/.test(utm)) return { source: "social", referrerHost: null };
    if (utm.includes("google")) return { source: "google", referrerHost: null };
  }
  if (!referrer) return { source: utm ?? "direct", referrerHost: null };
  let host: string;
  try {
    host = new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return { source: "direct", referrerHost: null };
  }
  if (ownHost && host === ownHost.replace(/^www\./, "")) return { source: "direct", referrerHost: null };
  if (/(^|\.)google\./.test(host)) return { source: "google", referrerHost: host };
  if (/(facebook|instagram|fb\.com|l\.messenger)/.test(host)) return { source: "social", referrerHost: host };
  if (/(whatsapp|wa\.me)/.test(host)) return { source: "whatsapp", referrerHost: host };
  return { source: host, referrerHost: host };
}
