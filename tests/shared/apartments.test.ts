import { describe, expect, it } from "vitest";
import { apartmentOptionLabel, lowestPrice, summarize } from "@/shared/apartments";
import type { ApartmentDTO } from "@/shared/types/api";

const apt = (over: Partial<ApartmentDTO>): ApartmentDTO => ({
  id: 1, number: 1, type: "F4", surfaceM2: 135, floor: -1, view: "SEA", priceFromDa: 12_000_000,
  priceOnRequest: false, status: "AVAILABLE", hasTerrace: false, planUrl: null, ...over,
});

const residence: ApartmentDTO[] = [
  ...Array.from({ length: 10 }, (_, i) => apt({ id: i + 1, number: i + 1, view: i % 2 ? "CITY" : "SEA" })),
  apt({ id: 11, number: 11, type: "PENTHOUSE", surfaceM2: 235, floor: 3, priceFromDa: null, priceOnRequest: true }),
];

describe("apartments", () => {
  it("résume la résidence", () => {
    const s = summarize(residence);
    expect(s.total).toBe(11);
    expect(s.othersLabel).toBe("10 F4 de 135 m²");
    expect(s.othersTitle).toBe("10 appartements F4 de 135 m²");
    expect(s.penthouses).toHaveLength(1);
  });
  it("ignore les logements vendus et sans prix pour le prix minimum", () => {
    const list = [apt({ priceFromDa: 11_000_000, status: "SOLD" }), apt({ priceFromDa: 12_500_000 }), apt({ priceFromDa: null })];
    expect(lowestPrice(list)).toBe(12_500_000);
    expect(lowestPrice([])).toBeNull();
  });
  it("construit le libellé du formulaire", () => {
    expect(apartmentOptionLabel(apt({ number: 7, floor: 1 }))).toBe("Appt. 07 — F4 135 m² · 1er étage · vue sur mer");
  });
});
