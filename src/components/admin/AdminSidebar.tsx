"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";
import { api } from "./client-api";

const NAV = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/statistiques", label: "Statistiques" },
  { href: "/admin/contenus", label: "Pages du site" },
  { href: "/admin/appartements", label: "Appartements" },
  { href: "/admin/avancement", label: "Avancement" },
  { href: "/admin/medias", label: "Médias" },
  { href: "/admin/demandes", label: "Demandes" },
  { href: "/admin/parametres", label: "Paramètres" },
] as const;

type Props = { userName: string; role: "ADMIN" | "EDITOR"; newLeads: number };

export function AdminSidebar({ userName, role, newLeads }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await api("/auth/logout", { method: "POST" }).catch(() => {});
    router.replace("/admin/connexion");
    router.refresh();
  }

  const links = (
    <nav aria-label="Administration" className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            aria-current={active ? "page" : undefined}
            className={`flex h-11 items-center gap-3 rounded px-3.5 text-[15px] no-underline ${active ? "bg-ink-soft font-bold text-white" : "font-medium text-[#c9c4b8] hover:bg-ink-soft"}`}
          >
            {item.label}
            {item.href === "/admin/demandes" && newLeads > 0 && (
              <span className="ml-auto inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-accent px-1.5 text-xs font-bold text-white">
                {newLeads}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="mt-auto flex flex-col gap-1 border-t border-ink-soft pt-4">
      <a href="/" target="_blank" className="flex h-11 items-center px-3.5 text-[15px] text-[#c9c4b8] no-underline">Voir le site ↗</a>
      <div className="flex items-center gap-3 px-3.5 py-2.5">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-ink-soft text-sm font-bold">{userName.slice(0, 1).toUpperCase()}</span>
        <span className="flex flex-col">
          <span className="text-sm font-bold">{userName}</span>
          <span className="text-xs text-[#8c9690]">{role === "ADMIN" ? "Administrateur" : "Éditeur"}</span>
        </span>
      </div>
      <button type="button" onClick={logout} className="h-10 rounded px-3.5 text-left text-sm text-[#a9b0a9] underline">
        Se déconnecter
      </button>
    </div>
  );

  const brand = (
    <div className="flex flex-col gap-1 px-2.5">
      <span className="font-display text-2xl font-semibold">H&amp;A <em className="font-normal italic">Signature</em></span>
      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8c9690]">Administration</span>
    </div>
  );

  return (
    <>
      {/* Barre mobile */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between bg-ink px-4 text-stone lg:hidden">
        <span className="font-display text-xl font-semibold">H&amp;A <em className="font-normal italic">Admin</em></span>
        <button type="button" aria-label="Ouvrir le menu" aria-expanded={open} onClick={() => setOpen(true)} className="flex h-11 w-11 items-center justify-center">
          <MenuIcon />
        </button>
      </div>
      {open && (
        <div role="dialog" aria-modal="true" aria-label="Menu d’administration" className="fixed inset-0 z-40 flex flex-col gap-6 overflow-y-auto bg-ink p-4 text-stone lg:hidden">
          <div className="flex items-center justify-between">
            {brand}
            <button type="button" aria-label="Fermer le menu" onClick={() => setOpen(false)} className="flex h-11 w-11 items-center justify-center"><CloseIcon /></button>
          </div>
          {links}
          {footer}
        </div>
      )}
      {/* Barre latérale ordinateur */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-7 bg-ink px-4 py-6 text-stone lg:flex">
        {brand}
        {links}
        {footer}
      </aside>
    </>
  );
}
