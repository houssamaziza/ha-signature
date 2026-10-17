"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CONSENT_CHANGE_EVENT, getVisitorId, readConsent } from "./consent";

/** Envoie une page vue à l'API à chaque navigation, uniquement après consentement. */
export function PageViewTracker() {
  const pathname = usePathname();
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    setConsented(readConsent() === "accepted");
    const onChange = (e: Event) => setConsented((e as CustomEvent).detail === "accepted");
    window.addEventListener(CONSENT_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, onChange);
  }, []);

  useEffect(() => {
    if (!consented) return;
    const visitorId = getVisitorId();
    if (!visitorId) return;
    const params = new URLSearchParams(window.location.search);
    const body = JSON.stringify({
      path: pathname,
      referrer: document.referrer || undefined,
      visitorId,
      utmSource: params.get("utm_source") ?? undefined,
    });
    const url = "/api/v1/analytics/pageview";
    // sendBeacon n'envoie pas de JSON typé : on utilise fetch keepalive.
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
  }, [pathname, consented]);

  return null;
}
