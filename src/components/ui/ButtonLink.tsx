import Link from "next/link";
import type { ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "accent" | "whatsapp" | "light-outline";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-ink text-stone hover:bg-ink-soft",
  secondary: "border border-ink text-ink hover:bg-ink hover:text-stone",
  accent: "bg-accent text-white hover:brightness-110",
  whatsapp: "bg-whatsapp text-whatsapp-ink hover:brightness-95",
  "light-outline": "border border-[#8c9690] text-stone hover:bg-ink-soft",
};

type Props = {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  block?: boolean;
  className?: string;
};

/** Lien stylé en bouton. Les liens internes passent par next/link. */
export function ButtonLink({ href, children, variant = "primary", block = false, className = "" }: Props) {
  const classes = [
    "inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-[2px] px-7 text-base font-bold no-underline transition",
    block ? "flex w-full" : "",
    variants[variant],
    className,
  ].join(" ");

  const isInternal = href.startsWith("/") && !href.startsWith("//");
  if (isInternal) {
    return <Link href={href} className={classes}>{children}</Link>;
  }
  const external = href.startsWith("http");
  return (
    <a href={href} className={classes} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {children}
    </a>
  );
}
