# Mise en ligne de H&A Signature

Guide pour le développeur. Durée : une demi-journée la première fois.

## 0. Avant de commencer (sur votre poste)

```bash
npm install                                   # génère package-lock.json (requis par le Dockerfile)
npm run typecheck && npm test && npm run build
npm run db:up && npx prisma migrate dev --name init
```

**Versionner `package-lock.json` et le dossier `prisma/migrations/`** : la production applique ces migrations (`prisma migrate deploy`), elle ne les crée pas.

## 1. Hébergement

- Un serveur virtuel Linux (Ubuntu 24.04 LTS), 2 vCPU, 2 à 4 Go de RAM, 40 Go de disque suffisent.
- **Loi 18-07 :** si les données (demandes de contact) sont hébergées hors d'Algérie, le transfert est soumis à l'autorisation préalable de l'ANPDP. Héberger en Algérie évite cette démarche ; sinon, l'anticiper. Indiquer le choix dans *Admin → Paramètres → Mentions légales*.

Préparer le serveur :

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER            # puis se reconnecter
sudo ufw allow OpenSSH && sudo ufw allow 80,443/tcp && sudo ufw enable
```

## 2. Domaine et Cloudflare

Dans Cloudflare (zone `hasignature.com`) :

| Réglage | Valeur |
|---|---|
| DNS | `A @ → IP du serveur` et `A www → IP du serveur`, **proxy activé** (nuage orange) |
| SSL/TLS | **Full (strict)** · Always Use HTTPS : activé |
| Rules → Managed Transforms | **Add visitor location headers** : activé (pays + ville pour les statistiques) |
| Cache Rules | Contourner le cache pour `/admin*` et `/api*` |

Le pays (`CF-IPCountry`) est toujours transmis ; la ville nécessite le Managed Transform ci-dessus.

> Si Caddy n'obtient pas son certificat derrière le proxy, passer temporairement les enregistrements en « DNS only », lancer la stack, puis réactiver le proxy. Alternative : certificat d'origine Cloudflare.

## 3. E-mails

Deux usages distincts :

1. **Boîte de réception `info@hasignature.com`** (lire et répondre) : Purelymail ou autre. Ajouter les enregistrements MX, SPF et DKIM fournis par ce service.
2. **Envoi automatique** (nouvelles demandes, réinitialisation du mot de passe) : **Resend** ou **Brevo** (offres gratuites suffisantes).
   - Ajouter le domaine chez le fournisseur et créer les enregistrements DNS qu'il indique (DKIM, et SPF / « return-path »).
   - **Un seul enregistrement SPF** sur un même nom : s'il en faut deux, les fusionner en un seul `v=spf1 include:… include:… ~all`.
   - Ajouter un DMARC : `TXT _dmarc → v=DMARC1; p=none; rua=mailto:info@hasignature.com` (passer à `quarantine` après quelques semaines sans problème).
   - Dans `.env` : `EMAIL_PROVIDER`, `EMAIL_API_KEY`, `EMAIL_FROM` (adresse du domaine vérifié).

## 4. Installation

```bash
git clone <dépôt> ha-signature && cd ha-signature
cp .env.production.example .env && nano .env      # mots de passe longs et aléatoires : openssl rand -base64 32
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml logs -f app
```

Au démarrage, le service `migrate` applique les migrations et le seed (données initiales + premier administrateur), puis `app` démarre.

Ensuite :
1. Ouvrir `https://www.hasignature.com/admin`, se connecter, **changer le mot de passe**.
2. Retirer `ADMIN_PASSWORD` du fichier `.env`.
3. Compléter *Paramètres → Mentions légales*, régler l'étape du chantier, ajouter les plans et les photos.
4. Envoyer une demande test depuis le formulaire et vérifier la réception de l'e-mail.

## 5. Mises à jour

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build    # migrations appliquées automatiquement
```

## 6. Sauvegardes

`scripts/backup.sh` sauvegarde la base et le dossier des fichiers envoyés (photos, plans), et garde 14 jours.

```bash
crontab -e
30 3 * * * /home/<utilisateur>/ha-signature/scripts/backup.sh >> /var/log/ha-backup.log 2>&1
```

**Copier aussi les sauvegardes hors du serveur** (autre machine, stockage objet). Tester une restauration au moins une fois :

```bash
docker compose -f docker-compose.prod.yml exec -T db pg_restore -U ha -d ha_signature --clean < backups/db_AAAA-MM-JJ_HHMM.dump
docker compose -f docker-compose.prod.yml exec -T app tar xzf - -C /app/uploads < backups/uploads_AAAA-MM-JJ_HHMM.tar.gz
```

## 7. Surveillance

- `GET /api/health` renvoie `{"status":"ok"}` si l'application et la base répondent : à brancher sur un service de surveillance (UptimeRobot, Better Stack…).
- Logs : `docker compose -f docker-compose.prod.yml logs --tail 200 app`.

## 8. Liste de vérification avant l'ouverture

- [ ] `npm run typecheck`, `npm test` et `npm run build` passent
- [ ] HTTPS actif, `hasignature.com` redirige vers `www.hasignature.com`
- [ ] Mentions légales complètes (plus aucun « [à compléter] »), relues par un juriste
- [ ] Délégué à la protection des données désigné, démarches ANPDP faites
- [ ] Bandeau cookies : « Refuser » n'envoie aucune statistique (vérifier l'onglet Réseau du navigateur)
- [ ] Formulaire : demande test reçue dans l'admin et par e-mail ; accusé de réception reçu
- [ ] Mot de passe oublié : e-mail reçu, lien fonctionnel
- [ ] WhatsApp et téléphone testés sur un vrai téléphone
- [ ] Statistiques : pays et ville visibles après une visite (Managed Transform Cloudflare)
- [ ] Sauvegarde exécutée et restauration testée
- [ ] Site déclaré dans Google Search Console avec `https://www.hasignature.com/sitemap.xml`
- [ ] Mot de passe administrateur changé, `ADMIN_PASSWORD` retiré de `.env`
