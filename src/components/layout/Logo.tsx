import Link from "next/link";

type Props = { siteName: string; tagline: string; tone?: "dark" | "light"; stacked?: boolean };

/** Logo texte « H&A Signature » : la partie après « H&A » est en italique. */
export function Logo({ siteName, tagline, tone = "dark", stacked = false }: Props) {
  const [first, ...rest] = siteName.split(" ");
  return (
    <Link
      href="/"
      className={`flex no-underline ${stacked ? "flex-col gap-0.5" : "items-baseline gap-3"} ${tone === "dark" ? "text-ink" : "text-stone"}`}
      aria-label={`${siteName} — accueil`}
    >
      <span className="font-display text-2xl font-semibold leading-none md:text-[34px]">
        {first} {rest.length > 0 && <em className="font-normal italic">{rest.join(" ")}</em>}
      </span>
      <span className={`text-[10px] font-bold uppercase tracking-[0.2em] md:text-xs ${tone === "dark" ? "text-muted" : "text-[#a9b0a9]"}`}>
        {tagline}
      </span>
    </Link>
  );
}
