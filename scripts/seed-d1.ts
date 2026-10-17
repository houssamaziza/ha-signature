/**
 * Génère le SQL des données initiales pour Cloudflare D1 :
 * paramètres, contenus, photos, programme La Caroube 2, 11 logements,
 * 5 étapes du chantier et (si ADMIN_EMAIL + ADMIN_PASSWORD) le premier administrateur.
 *
 *   ADMIN_EMAIL=… ADMIN_PASSWORD=… npx tsx scripts/seed-d1.ts > seed.sql
 *   npx wrangler d1 execute ha-signature --remote --file seed.sql
 *
 * Idempotent (INSERT OR IGNORE) : peut être relancé sans doublons ni écrasement.
 */
import { DEFAULT_SETTINGS } from "../src/shared/defaults";
import { CONTENT_DEFAULTS } from "../src/shared/schemas/content";
import { hashPassword } from "../src/server/auth/password";

const now = new Date().toISOString();
const q = (v: unknown): string => {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "boolean") return v ? "1" : "0";
  if (typeof v === "number") return String(v);
  return `'${String(v).replace(/'/g, "''")}'`;
};
const insert = (table: string, row: Record<string, unknown>) =>
  `INSERT OR IGNORE INTO "${table}" (${Object.keys(row).map((k) => `"${k}"`).join(", ")}) VALUES (${Object.values(row).map(q).join(", ")});`;

async function main() {
  const sql: string[] = [];

  sql.push(insert("SiteSettings", { id: 1, ...DEFAULT_SETTINGS, legal: "{}", updatedAt: now }));

  for (const [key, data] of Object.entries(CONTENT_DEFAULTS)) {
    sql.push(insert("ContentBlock", { key, data: JSON.stringify(data), isVisible: true, updatedAt: now }));
  }

  const photos = [
    { id: 1, url: "/images/facade-avant.jpg", filename: "facade-avant.jpg", sizeBytes: 169228, width: 755, height: 1199, alt: "Façade avant de la résidence H&A Signature à la tombée de la nuit" },
    { id: 2, url: "/images/facade-garage.jpg", filename: "facade-garage.jpg", sizeBytes: 155775, width: 766, height: 1024, alt: "Façade de la résidence avec l’entrée du garage en sous-sol" },
    { id: 3, url: "/images/facade-laterale.jpg", filename: "facade-laterale.jpg", sizeBytes: 88350, width: 540, height: 1199, alt: "Vue latérale de la résidence avec ses balcons vitrés" },
  ];
  for (const p of photos) sql.push(insert("Media", { ...p, mimeType: "image/jpeg", category: "FACADE", createdAt: now }));

  sql.push(
    insert("Project", {
      id: 1,
      slug: "la-caroube-2",
      name: "Résidence La Caroube 2",
      district: "Sidi Aïssa, La Caroube 2",
      city: "Annaba",
      deliveryLabel: "janvier 2028",
      currentPhaseOrder: 2, // à mettre à jour depuis l'administration
      features: JSON.stringify([
        "Vue sur mer pour 5 logements",
        "Garage en sous-sol",
        "Bâche à eau de 85 000 L",
        "Ascenseur",
        "Livré en semi-fini ou selon vos finitions",
      ]),
      coverMediaId: 2,
      createdAt: now,
      updatedAt: now,
    }),
  );

  const phases = [
    ["Terrassement et fondations", "Préparation du terrain, excavation du sous-sol et coulage des fondations."],
    ["Gros œuvre", "Élévation de la structure, des planchers et des murs, étage par étage."],
    ["Second œuvre", "Électricité, plomberie, menuiseries, ascenseur et cloisons."],
    ["Finitions", "Revêtements, peintures, façades et aménagements extérieurs."],
    ["Livraison", "Remise des clés prévue en janvier 2028."],
  ];
  phases.forEach(([name, description], i) => sql.push(insert("ConstructionPhase", { projectId: 1, order: i + 1, name, description })));

  // Répartition validée : 4 vue mer (un par niveau, de l'entresol au 2e) + penthouse au 3e.
  const layout: [number, "SEA" | "CITY"][] = [
    [-1, "SEA"], [-1, "CITY"], [-1, "CITY"], [-1, "CITY"],
    [0, "SEA"], [0, "CITY"],
    [1, "SEA"], [1, "CITY"],
    [2, "SEA"], [2, "CITY"],
  ];
  layout.forEach(([floor, view], i) =>
    sql.push(
      insert("Apartment", {
        projectId: 1, number: i + 1, type: "F4", surfaceM2: 135, floor, view, priceFromDa: 12_000_000,
        priceOnRequest: false, status: "AVAILABLE", hasTerrace: false, isPublished: true, createdAt: now, updatedAt: now,
      }),
    ),
  );
  sql.push(
    insert("Apartment", {
      projectId: 1, number: 11, type: "PENTHOUSE", surfaceM2: 235, floor: 3, view: "SEA", priceFromDa: null,
      priceOnRequest: true, status: "AVAILABLE", hasTerrace: true, isPublished: true, createdAt: now, updatedAt: now,
    }),
  );

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    if (password.length < 10) throw new Error("ADMIN_PASSWORD doit faire au moins 10 caractères.");
    sql.push(
      insert("User", {
        email, name: process.env.ADMIN_NAME ?? "Administrateur", passwordHash: await hashPassword(password),
        role: "ADMIN", isActive: true, createdAt: now, updatedAt: now,
      }),
    );
  } else {
    console.error("ADMIN_EMAIL / ADMIN_PASSWORD absents : aucun compte administrateur dans le SQL.");
  }

  process.stdout.write(sql.join("\n") + "\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
