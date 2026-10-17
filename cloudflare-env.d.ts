// Types des bindings Cloudflare (voir wrangler.jsonc).
// Régénérable avec `npm run cf-typegen`.
interface CloudflareEnv {
  DB: D1Database;
  MEDIA: KVNamespace;
  ASSETS: Fetcher;
  SITE_URL: string;
  DEFAULT_PROJECT_SLUG: string;
  EMAIL_PROVIDER: string;
  EMAIL_FROM: string;
  EMAIL_API_KEY?: string;
  LEAD_NOTIFICATION_EMAILS: string;
  LEAD_ACKNOWLEDGEMENT: string;
}
