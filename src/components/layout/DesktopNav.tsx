"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isActive } from "./nav";

export function DesktopNav() {
  const pathname = usePathname();
  const links = NAV_ITEMS.filter((item) => item.href !== "/contact");
  return (
    <nav aria-label="Navigation principale" className="hidden items-center gap-10 text-[15px] font-medium lg:flex">
      {links.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`text-ink no-underline ${active ? "border-b-2 border-accent pb-1 font-bold" : "hover:text-accent"}`}
          >
            {item.label}
          </Link>
        );
      })}
      <Link
        href="/contact"
        aria-current={isActive(pathname, "/contact") ? "page" : undefined}
        className="inline-flex h-12 items-center rounded-[2px] bg-accent px-6 font-bold text-white no-underline hover:brightness-110"
      >
        Nous contacter
      </Link>
    </nav>
  );
}
