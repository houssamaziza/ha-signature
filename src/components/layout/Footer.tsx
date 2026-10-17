import Link from "next/link";
import { getSettings } from "@/server/services/settings.service";
import { CookieSettingsButton } from "@/components/site/CookieSettingsButton";

export async function Footer() {
  const s = await getSettings();
  const [first, ...rest] = s.siteName.split(" ");
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-5 py-8 text-sm text-muted md:flex-row md:items-center md:justify-between md:px-10 md:py-12 xl:px-20">
        <span>
          <span className="font-display text-xl font-semibold text-ink">
            {first} <em className="font-normal italic">{rest.join(" ")}</em>
          </span>
          {"  ·  "}
          {s.tagline}
        </span>
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>© {year} {s.siteName}</span>·
          <a href={`mailto:${s.email}`}>{s.email}</a>·
          <Link href="/mentions-legales">Mentions légales</Link>·
          <CookieSettingsButton />
        </span>
      </div>
    </footer>
  );
}
