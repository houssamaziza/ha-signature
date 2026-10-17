import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { getSettings } from "@/server/services/settings.service";
import "./globals.css";

/**
 * Rendu à la demande : le contenu vient de la base et change depuis l'administration.
 * Cela permet aussi de construire l'application (Docker) sans accès à la base.
 */
export const dynamic = "force-dynamic";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
    title: { default: settings.seoTitle, template: `%s — ${settings.siteName}` },
    description: settings.seoDescription,
    openGraph: {
      type: "website",
      locale: "fr_DZ",
      siteName: settings.siteName,
      title: settings.seoTitle,
      description: settings.seoDescription,
      images: [{ url: "/images/facade-avant.jpg" }],
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#1d2422",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <html lang="fr" className={`${fraunces.variable} ${manrope.variable}`}>
      <body style={{ ["--accent" as string]: settings.accentColor }}>{children}</body>
    </html>
  );
}
