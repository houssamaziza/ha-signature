const regionNames = new Intl.DisplayNames(["fr"], { type: "region" });

/** "DZ" → "Algérie" */
export function countryName(code: string | null): string {
  if (!code) return "Inconnu";
  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}

/** "DZ" → 🇩🇿 */
export function countryFlag(code: string | null): string {
  if (!code || !/^[A-Z]{2}$/.test(code)) return "🌐";
  return String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}
