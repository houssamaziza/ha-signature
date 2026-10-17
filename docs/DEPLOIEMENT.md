# Mise en ligne de H&A Signature (Cloudflare)

Le site tourne sur **Cloudflare Workers** (Next.js via OpenNext), compte « Houssam.aziza@gmail.com's Account » :

| Ressource | Nom | Binding |
|---|---|---|
| Worker | `ha-signature` | — |
| Base D1 (SQLite) | `ha-signature` (`3b0f10cc-6b1f-4db9-98a3-e175224a054d`) | `DB` |
| KV (photos et plans envoyés) | `ha-signature-media` (`74b39905aa574d53ba82dd0c828e3f48`) | `MEDIA` |

Adresse provisoire : https://ha-signature.houssam-aziza-037.workers.dev

## Déploiement automatique

Le dépôt GitHub est relié à Cloudflare (Workers Builds). Chaque `git push` sur `main` :

1. lance la vérification GitHub Actions (`.github/workflows/verification.yml`) : installation, typage, tests, construction ;
2. déclenche la construction et la mise en ligne par Cloudflare.

Réglages Workers Builds :

| Champ | Valeur |
|---|---|
| Nom du Worker | `ha-signature` |
| Commande de build | `npx prisma generate && npx opennextjs-cloudflare build` |
| Commande de déploiement | `npx opennextjs-cloudflare deploy` |
| Dossier racine | `/` |
| Builds de prévisualisation | désactivés (la branche `ci-logs` est réservée aux journaux de vérification) |

## Base de données

- Les tables sont décrites dans `prisma/schema.prisma` ; le SQL est dans `migrations/`.
- Nouvelle migration : modifier le schéma, générer le SQL avec
  `npx prisma migrate diff --from-schema-datamodel <ancien> --to-schema-datamodel prisma/schema.prisma --script > migrations/0002_xxx.sql`,
  puis `npx wrangler d1 migrations apply ha-signature --remote` (ou coller le SQL dans la console D1 du tableau de bord).
- Données initiales : `ADMIN_EMAIL=… ADMIN_PASSWORD=… npx tsx scripts/seed-d1.ts > seed.sql` puis
  `npx wrangler d1 execute ha-signature --remote --file seed.sql` (idempotent).

## E-mails

`EMAIL_PROVIDER` vaut `console` (les e-mails sont seulement écrits dans les journaux du Worker).
Pour les envoyer vraiment : créer un compte Resend ou Brevo, vérifier le domaine, ajouter le secret
`EMAIL_API_KEY` (Worker → Settings → Variables and Secrets) et passer `EMAIL_PROVIDER` à `resend` ou `brevo` dans `wrangler.jsonc`.

## Domaine hasignature.com (plus tard)

Une fois le domaine sur Cloudflare : Workers & Pages → `ha-signature` → Settings → Domains & Routes →
ajouter `www.hasignature.com` et `hasignature.com`, puis mettre `SITE_URL` à `https://www.hasignature.com` dans `wrangler.jsonc`.
Activer aussi *Rules → Managed Transforms → Add visitor location headers* (ville des visiteurs dans les statistiques).

## Limites à connaître (offre gratuite)

- 10 ms de temps de calcul par requête (avec une tolérance ponctuelle) : si des erreurs 1102 apparaissent,
  passer au forfait Workers Paid (5 $/mois).
- KV gratuit : 1 000 écritures par jour (largement suffisant pour l'envoi de photos).
- Le limiteur de tentatives (connexion, formulaire) est en mémoire, par instance.
