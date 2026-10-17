import { describe, expect, it } from "vitest";
import { CONTENT_DEFAULTS, CONTENT_SCHEMAS } from "@/shared/schemas/content";
import { createLeadSchema } from "@/shared/schemas/lead";
import { passwordSchema, updateSettingsSchema } from "@/shared/schemas/admin";

const validLead = { name: "Nom Prénom", phone: "0550 33 37 69", consent: true };

describe("createLeadSchema", () => {
  it("accepte une demande minimale", () => {
    expect(createLeadSchema.safeParse(validLead).success).toBe(true);
  });
  it("exige le consentement (loi 18-07)", () => {
    expect(createLeadSchema.safeParse({ ...validLead, consent: false }).success).toBe(false);
  });
  it("refuse un téléphone invalide", () => {
    expect(createLeadSchema.safeParse({ ...validLead, phone: "abc" }).success).toBe(false);
  });
  it("transforme un e-mail vide en undefined", () => {
    const r = createLeadSchema.parse({ ...validLead, email: "" });
    expect(r.email).toBeUndefined();
  });
  it("convertit le numéro d'appartement", () => {
    expect(createLeadSchema.parse({ ...validLead, apartmentNumber: "7" }).apartmentNumber).toBe(7);
  });
});

describe("contenus", () => {
  it("les valeurs par défaut respectent leurs schémas", () => {
    for (const [key, schema] of Object.entries(CONTENT_SCHEMAS)) {
      expect(schema.safeParse(CONTENT_DEFAULTS[key as keyof typeof CONTENT_DEFAULTS]).success, key).toBe(true);
    }
  });
});

describe("administration", () => {
  it("impose un mot de passe solide", () => {
    expect(passwordSchema.safeParse("court1").success).toBe(false);
    expect(passwordSchema.safeParse("sanschiffreici").success).toBe(false);
    expect(passwordSchema.safeParse("Caroube2028!").success).toBe(true);
  });
  it("valide le numéro WhatsApp au format international", () => {
    expect(updateSettingsSchema.safeParse({ whatsappNumber: "+213550333769" }).success).toBe(true);
    expect(updateSettingsSchema.safeParse({ whatsappNumber: "0550333769" }).success).toBe(false);
  });
});
