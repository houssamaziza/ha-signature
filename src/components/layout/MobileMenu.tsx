"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CloseIcon, MenuIcon, PhoneIcon, ChatIcon } from "@/components/ui/icons";
import { NAV_ITEMS, isActive } from "./nav";

type Props = {
  siteName: string;
  tagline: string;
  phone: string;
  phoneHref: string;
  whatsappHref: string;
  email: string;
  officeAddress: string;
};

/** Menu plein écran pour mobile et tablette. */
export function MobileMenu(props: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [first, ...rest] = props.siteName.split(" ");

  // Ferme le menu à chaque changement de page.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Ouvrir le menu"
        aria-expanded={open}
        aria-controls="menu-mobile"
        onClick={() => setOpen(true)}
        className="flex h-12 w-12 items-center justify-center lg:hidden"
      >
        <MenuIcon />
      </button>

      {open && (
        <div
          id="menu-mobile"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-ink text-stone lg:hidden"
        >
          <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-ink-soft px-5">
            <span className="flex flex-col gap-0.5">
              <span className="font-display text-2xl font-semibold leading-none">
                {first} <em className="font-normal italic">{rest.join(" ")}</em>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a9b0a9]">{props.tagline}</span>
            </span>
            <button
              ref={closeRef}
              type="button"
              aria-label="Fermer le menu"
              onClick={() => setOpen(false)}
              className="flex h-12 w-12 items-center justify-center"
            >
              <CloseIcon />
            </button>
          </div>

          <nav aria-label="Navigation principale" className="flex flex-col px-5 pt-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center justify-between gap-3 border-b border-ink-soft py-4 no-underline ${active ? "text-copper" : "text-stone"}`}
                >
                  <span className="flex flex-col gap-1">
                    <span className="font-display text-[30px] leading-tight">{item.label}</span>
                    <span className="text-sm text-[#a9b0a9]">{item.description}</span>
                  </span>
                  {active ? (
                    <span className="text-xs font-bold uppercase tracking-[0.12em] text-copper">Vous êtes ici</span>
                  ) : (
                    <span aria-hidden className="text-[22px] text-[#8c9690]">→</span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto flex flex-col gap-2.5 px-5 pb-7 pt-5">
            <p className="mb-1 text-sm text-[#a9b0a9]">Bureau de vente · {props.officeAddress}</p>
            <a href={props.phoneHref} className="flex h-[52px] items-center justify-center gap-2.5 rounded-[2px] bg-accent font-bold text-white no-underline">
              <PhoneIcon /> Appeler le {props.phone}
            </a>
            <a
              href={props.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-[52px] items-center justify-center gap-2.5 rounded-[2px] bg-whatsapp font-bold text-whatsapp-ink no-underline"
            >
              <ChatIcon /> WhatsApp
            </a>
            <a href={`mailto:${props.email}`} className="flex h-[52px] items-center justify-center rounded-[2px] border border-[#8c9690] font-bold text-stone no-underline">
              {props.email}
            </a>
          </div>
        </div>
      )}
    </>
  );
}
