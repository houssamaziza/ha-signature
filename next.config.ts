import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  /** Requis par OpenNext pour embarquer le client Prisma dans le Worker. */
  serverExternalPackages: ["@prisma/client", ".prisma/client"],
  /** Les images sont servies telles quelles (pas d'optimisation payante Cloudflare Images). */
  images: { unoptimized: true },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;

// Donne accès aux bindings (D1, KV) pendant `next dev`.
initOpenNextCloudflareForDev();
