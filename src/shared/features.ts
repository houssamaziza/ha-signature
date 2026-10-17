/** Les atouts sont stockés en JSON (tableau de textes) : on les lit prudemment. */
export function toFeatures(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}
