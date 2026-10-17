"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CONSENT_OPEN_EVENT, readConsent, writeConsent } from "./consent";

/** Bandeau de consentement à la mesure d'audience (loi 18-07). */
export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (readConsent() === null) setVisible(true);
    const open = () => setVisible(true);
    window.addEventListener(CONSENT_OPEN_EVENT, open);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, open);
  }, []);

  if (!visible) return null;

  const choose = (choice: "accepted" | "refused") => {
    writeConsent(choice);
    setVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="Mesure d’audience"
      className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-3xl border border-line bg-paper p-5 shadow-lg md:inset-x-6 md:bottom-6"
    >
      <p className="text-sm leading-relaxed text-body">
        Nous mesurons la fréquentation du site (pages vues, pays, type d’appareil) de façon anonyme pour
        l’améliorer. Aucune donnée n’est vendue. <Link href="/mentions-legales#audience">En savoir plus</Link>
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => choose("refused")}
          className="h-11 rounded-[2px] border border-ink px-5 text-sm font-bold text-ink"
        >
          Refuser
        </button>
        <button type="button" onClick={() => choose("accepted")} className="h-11 rounded-[2px] bg-ink px-5 text-sm font-bold text-stone">
          Accepter
        </button>
      </div>
    </div>
  );
}
