import { getCloudflareContext } from "@opennextjs/cloudflare";
import { PrismaD1 } from "@prisma/adapter-d1";
import { PrismaClient } from "@prisma/client";
import { cache } from "react";

/**
 * Client Prisma relié à la base Cloudflare D1 (binding `DB`, voir wrangler.jsonc).
 * Sur Workers, un client ne doit pas être partagé entre requêtes : on en crée un
 * par requête (mémorisé pendant la requête grâce à `cache`).
 */
const createClient = cache(() => {
  const { env } = getCloudflareContext();
  return new PrismaClient({ adapter: new PrismaD1(env.DB) });
});

/**
 * Accès transparent : `prisma.lead.findMany()` fonctionne comme avant,
 * le client réel est créé à la première utilisation dans la requête.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = createClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
