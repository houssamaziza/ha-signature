"use client";

import { CONSENT_OPEN_EVENT } from "./consent";

export function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(CONSENT_OPEN_EVENT))}
      className="text-accent underline"
    >
      Gérer les cookies
    </button>
  );
}
