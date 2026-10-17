import { describe, expect, it } from "vitest";
import { classifySource, getCity, getCountry, getDevice } from "@/server/http/request-meta";

describe("request-meta", () => {
  it("lit le pays Cloudflare et ignore les valeurs inconnues", () => {
    expect(getCountry(new Headers({ "cf-ipcountry": "dz" }))).toBe("DZ");
    expect(getCountry(new Headers({ "cf-ipcountry": "XX" }))).toBeNull();
    expect(getCountry(new Headers({ "cf-ipcountry": "T1" }))).toBeNull();
    expect(getCountry(new Headers())).toBeNull();
  });
  it("décode la ville", () => {
    expect(getCity(new Headers({ "x-vercel-ip-city": "Montr%C3%A9al" }))).toBe("Montréal");
  });
  it("détecte le type d'appareil", () => {
    expect(getDevice("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Mobile")).toBe("MOBILE");
    expect(getDevice("Mozilla/5.0 (iPad; CPU OS 17_0)")).toBe("TABLET");
    expect(getDevice("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBe("DESKTOP");
  });
  it("classe la provenance", () => {
    expect(classifySource("https://www.google.dz/", undefined, "www.hasignature.com").source).toBe("google");
    expect(classifySource("https://l.facebook.com/", undefined, null).source).toBe("social");
    expect(classifySource(undefined, "whatsapp", null).source).toBe("whatsapp");
    expect(classifySource(undefined, undefined, null).source).toBe("direct");
    expect(classifySource("https://hasignature.com/contact", undefined, "www.hasignature.com").source).toBe("direct");
  });
});
