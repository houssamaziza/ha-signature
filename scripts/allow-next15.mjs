// Exécuté après `npm install` / `npm ci` (script "postinstall").
//
// Depuis octobre 2026, OpenNext refuse de construire les sites en Next.js 15
// (« version plus supportée par l'équipe Next.js ») sauf avec l'option
// --dangerouslyUseUnsupportedNextVersion. La commande de build de Cloudflare
// (Workers Builds) est réglée dans le tableau de bord ; pour ne pas dépendre de
// ce réglage, on active l'option par défaut dans l'outil installé.
//
// À retirer lors du passage à Next.js 16.
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const file = "node_modules/@opennextjs/cloudflare/dist/cli/commands/build.js";
const from = "args.dangerouslyUseUnsupportedNextVersion)";
const to = "args.dangerouslyUseUnsupportedNextVersion || true)";

if (!existsSync(file)) {
  console.log("[allow-next15] OpenNext absent, rien à faire.");
} else {
  const src = readFileSync(file, "utf8");
  if (src.includes(to)) {
    console.log("[allow-next15] déjà appliqué.");
  } else if (src.includes(from)) {
    writeFileSync(file, src.replace(from, to));
    console.log("[allow-next15] option --dangerouslyUseUnsupportedNextVersion activée par défaut.");
  } else {
    console.warn("[allow-next15] motif introuvable : vérifier la version d'OpenNext.");
  }
}
