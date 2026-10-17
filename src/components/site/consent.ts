"use client";

import { CONSENT_STORAGE_KEY, VISITOR_STORAGE_KEY } from "@/shared/constants";

export type ConsentChoice = "accepted" | "refused";
export const CONSENT_CHANGE_EVENT = "has:consent-change";
export const CONSENT_OPEN_EVENT = "has:consent-open";

export function readConsent(): ConsentChoice | null {
  try {
    const v = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return v === "accepted" || v === "refused" ? v : null;
  } catch {
    return null;
  }
}

export function writeConsent(choice: ConsentChoice) {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
    // En cas de refus, on supprime l'identifiant de visiteur existant.
    if (choice === "refused") window.localStorage.removeItem(VISITOR_STORAGE_KEY);
  } catch {
    /* stockage indisponible (navigation privée) : on ignore */
  }
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: choice }));
}

/** Identifiant aléatoire et anonyme, créé seulement après consentement. */
export function getVisitorId(): string | null {
  try {
    let id = window.localStorage.getItem(VISITOR_STORAGE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(VISITOR_STORAGE_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}
