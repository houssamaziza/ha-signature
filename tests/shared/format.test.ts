import { describe, expect, it } from "vitest";
import { formatApartmentNumber, formatInternationalDz, formatPriceDa, telLink, whatsappLink } from "@/shared/format";
import { floorLabel } from "@/shared/constants";

describe("format", () => {
  it("formate les prix en dinars", () => {
    expect(formatPriceDa(12_000_000).replace(/\s/g, " ")).toBe("12 000 000 DA");
  });
  it("numérote les appartements sur deux chiffres", () => {
    expect(formatApartmentNumber(7)).toBe("07");
    expect(formatApartmentNumber(11)).toBe("11");
  });
  it("construit le lien WhatsApp avec le message encodé", () => {
    expect(whatsappLink("+213 550 33 37 69", "Bonjour à tous")).toBe("https://wa.me/213550333769?text=Bonjour%20%C3%A0%20tous");
  });
  it("convertit un numéro local algérien en lien tel: international", () => {
    expect(telLink("0550 33 37 69")).toBe("tel:+213550333769");
    expect(telLink("+213550333769")).toBe("tel:+213550333769");
  });
  it("affiche un numéro international lisible", () => {
    expect(formatInternationalDz("+213550333769")).toBe("+213 550 33 37 69");
  });
  it("nomme les étages", () => {
    expect([-1, 0, 1, 2, 3].map(floorLabel)).toEqual(["Entresol", "Rez-de-chaussée", "1er étage", "2e étage", "3e étage"]);
  });
});
