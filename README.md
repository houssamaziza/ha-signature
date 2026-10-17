# H&A Signature — site et API

Site vitrine de la résidence **La Caroube 2** (Sidi Aïssa, Annaba) et API réutilisable par la future application mobile.

**État : étapes 1 à 3 terminées** — site public, API, espace administrateur, e-mails, tests et déploiement.
Mise en ligne : voir **[docs/DEPLOIEMENT.md](docs/DEPLOIEMENT.md)**.

> ⚠️ Ce code a été écrit sans pouvoir être exécuté (pas d'accès réseau pour installer les dépendances).
> Seuls les modules sans dépendance (formats, en-têtes, mots de passe, limiteur, e-mails) ont pu être exécutés.
> Lancer `npm install`, `npm run typecheck`, `npm test` et `npm run build`, puis corriger les éventuelles erreurs avant toute mise en ligne.

## Pile technique

| Couche | Choix |
|---|---|
| Web | Next.js 15 (App Router), React 19, TypeScript strict, Tailwind CSS 4 |
| API | Route handlers Next.js sous `/api/v1` (JSON, versionnée) |
| Données | PostgreSQL 16 + Prisma 6 |
| Validation | Zod 4 — mêmes schémas côté client et serveur |

Dépendances d'exécution volontairement limitées à : `next`, `react`, `react-dom`, `@prisma/client`, `zod`.

## Démarrage

```bash
cp .env.example .env          # puis adapter les valeurs
npm install
npm run db:up                 # PostgreSQL via Docker (ou votre propre instance)
npm run db:migrate            # crée les tables (nommer la migration « init »)
npm run db:seed               # paramètres, contenus, 11 logements, étapes + 1er compte admin (ADMIN_EMAIL/ADMIN_PASSWORD)
npm run dev                   # site : http://localhost:3000 · admin : http://localhost:3000/admin
```

Les pages sont rendues à la demande (`dynamic = "force-dynamic"`) : le contenu modifié dans l'administration est visible immédiatement, et le build (Docker) ne nécessite pas la base.

Tests : `npm test` (Vitest, sans base de données).

## Architecture

```
prisma/
  schema.prisma        Modèle de données (programmes, logements, demandes, visites, comptes…)
  seed.ts              Données initiales
src/
  app/
    (site)/            Pages publiques : / · /appartements · /avancement · /contact · /mentions-legales
    api/v1/            API publique (voir plus bas)
  components/
    ui/                Briques génériques (bouton-lien, badge, photo, icônes)
    layout/            En-tête, menu mobile, pied de page
    site/              Composants métier (carte logement, frise du chantier, formulaire, consentement…)
  server/              ⚠️ code serveur uniquement
    db.ts              Client Prisma unique
    http/              Réponses/erreurs normalisées, limitation de débit, métadonnées de requête
    services/          Logique métier (aucune dépendance à l'interface)
    notifications/     Point d'extension e-mail (étape 3)
  shared/              Code sans dépendance serveur, partageable avec l'app Expo
    constants.ts       Énumérations et libellés FR
    format.ts          Prix, liens WhatsApp / tel:
    schemas/           Schémas Zod (demande de contact, page vue, contenus, infos légales)
    types/api.ts       Types des réponses de l'API (DTO)
```

Règles :
- Les pages et les routes API appellent les **services** ; seuls les services parlent à Prisma.
- Les services renvoient des **DTO** (`src/shared/types/api.ts`), jamais des objets Prisma bruts.
- Tout ce qui est dans `src/shared` doit rester importable par React Native. Quand l'app démarre, ce dossier peut devenir un paquet de monorepo (`packages/shared`).

## API v1

Format commun — succès : `{ "data": … }` · erreur : `{ "error": { "code", "message", "details?" } }`.

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/v1/settings` | Coordonnées et identité publiques |
| GET | `/api/v1/projects/:slug` | Programme complet : logements, étapes, photos |
| GET | `/api/v1/apartments?project=&status=&view=` | Logements filtrés (`status` : AVAILABLE/RESERVED/SOLD, `view` : SEA/CITY) |
| POST | `/api/v1/leads` | Demande de contact. En-tête `X-Client: mobile-app` pour l'application |
| POST | `/api/v1/analytics/pageview` | Page vue (envoyée seulement après consentement) |

Codes d'erreur : `VALIDATION_ERROR` (422, `details` = erreurs par champ), `NOT_FOUND` (404), `RATE_LIMITED` (429), `INVALID_JSON` (400), `INTERNAL_ERROR` (500).

Exemple :

```http
POST /api/v1/leads
Content-Type: application/json

{ "name": "Nom Prénom", "phone": "0550 00 00 00", "apartmentNumber": 7, "message": "Visite samedi ?", "consent": true }
```

## Données personnelles et audience (loi 18-07)

- Formulaire : consentement obligatoire (`consent: true`), date stockée dans `Lead.consentAt`. Champ piège anti-robots et limite de 5 envois / 10 min par client.
- Audience : envoyée seulement si le visiteur accepte le bandeau. **Aucune IP n'est enregistrée.** Le pays et la ville viennent des en-têtes du CDN :
  - Cloudflare : `CF-IPCountry` (automatique) et `CF-IPCity` (activer *Managed Transforms → Add visitor location headers*).
  - Vercel : `x-vercel-ip-country` / `x-vercel-ip-city`.
- Les informations légales (RC, NIF, agrément, FGCMPI…) sont stockées dans `SiteSettings.legal` ; tant qu'elles manquent, la page des mentions légales affiche « [à compléter] ».

## Administration (`/admin`)

| Écran | Rôle |
|---|---|
| `/admin/connexion` | Connexion (limite : 8 essais / 15 min) |
| `/admin` | Tableau de bord |
| `/admin/statistiques` | Visiteurs, pays, villes, pages, appareils, sources (aujourd'hui / 7 j / 30 j / 12 mois) |
| `/admin/contenus` | Haut de l'accueil (textes, boutons, liens, photo, visibilité) et étapes d'achat |
| `/admin/appartements` | Prix, statut (disponible/réservé/vendu), vue, étage, plan (PDF/image), visibilité |
| `/admin/avancement` | Étape en cours, date de livraison, atouts, photos du chantier datées |
| `/admin/medias` | Médiathèque : import, texte alternatif, catégorie, suppression (bloquée si la photo est utilisée) |
| `/admin/demandes` | Demandes par statut, appel / WhatsApp, export CSV pour Excel |
| `/admin/parametres` | Coordonnées, WhatsApp, couleur, SEO, mentions légales, mot de passe, comptes |

Rôles : **ADMIN** (tout) et **EDITOR** (contenu, logements, avancement, médias, demandes — pas les paramètres ni les comptes).

Chaque enregistrement appelle `revalidatePath("/", "layout")` : le site public est à jour immédiatement.

### Sécurité

- Mots de passe : `scrypt` natif Node (aucune dépendance), comparaison à temps constant, message identique si l'e-mail est inconnu.
- Sessions opaques en base (seul le SHA-256 du jeton est stocké) : cookie `httpOnly` + `SameSite=Lax` + `Secure` en production pour le web ; `Authorization: Bearer` pour le mobile (connexion avec l'en-tête `X-Client: mobile-app`, le jeton est renvoyé dans la réponse).
- CSRF : toute écriture authentifiée par cookie doit avoir un en-tête `Origin` du même hôte.
- `middleware.ts` redirige vers la connexion sans cookie ; la vérification réelle est faite dans le layout `(panel)` et dans **chaque** route `/api/v1/admin/*` (`requireAuth`).
- Changer de mot de passe ou désactiver un compte supprime ses sessions.
- Fichiers envoyés : JPG, PNG, WebP, PDF uniquement, 10 Mo max, type vérifié par signature binaire, nom aléatoire, stockés dans `UPLOAD_DIR` (hors `/public`) et servis par `/media/<fichier>`. **Sauvegarder ce dossier avec la base.**

### API d'administration (`/api/v1`)

| Méthode | Route | Accès |
|---|---|---|
| POST | `/auth/login` · `/auth/logout` · `/auth/password` · GET `/auth/me` | — / connecté |
| POST | `/auth/password-reset/request` · `/auth/password-reset/confirm` | — (limité) |
| GET | `/api/health` | — (surveillance) |
| GET | `/admin/dashboard` · `/admin/stats?period=` | connecté |
| GET · PUT | `/admin/content/:key` (`home.hero`, `home.steps`) | connecté |
| GET · POST | `/admin/apartments` · PATCH `/admin/apartments/:id` | connecté |
| GET · PATCH | `/admin/project` · POST `/admin/project/photos` | connecté |
| PATCH · DELETE | `/admin/progress-photos/:id` | connecté |
| GET · POST (multipart) | `/admin/media` · PATCH · DELETE `/admin/media/:id` | connecté |
| GET | `/admin/leads?status=&page=` · PATCH `/admin/leads/:id` · GET `/admin/leads/export` | connecté |
| GET · PUT | `/admin/settings` | lecture : connecté · écriture : ADMIN |
| GET · POST | `/admin/users` · PATCH `/admin/users/:id` | ADMIN |

Les schémas Zod des corps de requête sont dans `src/shared/schemas/admin.ts` (réutilisables par l'app mobile).

## E-mails

- Nouvelle demande → e-mail à `LEAD_NOTIFICATION_EMAILS` (ou à l'e-mail du site), envoyé après la réponse HTTP (`after()`), sans jamais faire échouer le formulaire.
- Accusé de réception au client s'il a laissé son e-mail (`LEAD_ACKNOWLEDGEMENT=true`).
- Mot de passe oublié : `/admin/mot-de-passe-oublie` → lien valable 1 h, usage unique (table `PasswordResetToken`), déconnexion de tous les appareils après changement.
- Fournisseurs : Resend ou Brevo par simple appel HTTP (aucune dépendance) ; `console` en développement.

## Tests

`npm test` couvre, sans base de données : formats (prix, WhatsApp, téléphone), résumés des logements, schémas Zod (formulaire, mots de passe, paramètres, contenus par défaut), en-têtes Cloudflare / appareil / provenance, hachage des mots de passe, sessions, limitation de débit, signatures des fichiers, échappement HTML des e-mails.

Prochaine étape conseillée : tests d'intégration des services avec une base PostgreSQL de test (`docker compose`), puis tests de bout en bout (Playwright) du formulaire et de la connexion.

Points à connaître :
- Les textes des pages Appartements / Avancement / Contact (hors données) sont encore dans le code ; ils peuvent devenir des blocs `ContentBlock` en ajoutant un schéma dans `src/shared/schemas/content.ts`.
- Le limiteur de débit est en mémoire : adapté à un seul serveur (configuration Docker fournie). Avec plusieurs instances, le remplacer par Redis ou une table PostgreSQL.
- Statistiques « Aujourd'hui » : minuit calculé à l'heure du serveur (régler le serveur sur `Africa/Algiers` ou affiner `periodStart`).
