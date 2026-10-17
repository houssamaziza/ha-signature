import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ConsentBanner } from "@/components/site/ConsentBanner";
import { PageViewTracker } from "@/components/site/PageViewTracker";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#contenu" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-paper focus:p-3">
        Aller au contenu
      </a>
      <Header />
      <main id="contenu" className="flex-1">
        {children}
      </main>
      <Footer />
      <ConsentBanner />
      <PageViewTracker />
    </div>
  );
}
