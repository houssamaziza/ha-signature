import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.SITE_URL ?? "http://localhost:3000";
  const now = new Date();
  return ["", "/appartements", "/avancement", "/contact", "/mentions-legales"].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "/avancement" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
