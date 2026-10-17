import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Toutes les pages sont rendues à la demande (contenu en base) : pas de cache ISR à configurer.
export default defineCloudflareConfig();
