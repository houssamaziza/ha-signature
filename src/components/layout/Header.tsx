import { getSettings } from "@/server/services/settings.service";
import { telLink, whatsappLink } from "@/shared/format";
import { DesktopNav } from "./DesktopNav";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";

export async function Header() {
  const s = await getSettings();
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 md:h-24 md:px-10 xl:px-20">
        <div className="lg:hidden">
          <Logo siteName={s.siteName} tagline={s.tagline} stacked />
        </div>
        <div className="hidden lg:block">
          <Logo siteName={s.siteName} tagline={s.tagline} />
        </div>
        <DesktopNav />
        <MobileMenu
          siteName={s.siteName}
          tagline={s.tagline}
          phone={s.phone}
          phoneHref={telLink(s.phone)}
          whatsappHref={whatsappLink(s.whatsappNumber, s.whatsappMessage)}
          email={s.email}
          officeAddress={s.officeAddress}
        />
      </div>
    </header>
  );
}
