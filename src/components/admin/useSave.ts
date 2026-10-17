"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiClientError } from "./client-api";

/** Gère l'état d'un enregistrement : en cours, succès, erreurs par champ. */
export function useSave() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[] | undefined>>({});

  async function run<T>(action: () => Promise<T>, successText = "Modifications enregistrées et publiées.") {
    setSaving(true);
    setNotice(null);
    setFieldErrors({});
    try {
      const result = await action();
      setNotice({ tone: "success", text: successText });
      router.refresh();
      return result;
    } catch (e) {
      if (e instanceof ApiClientError) {
        setFieldErrors(e.fieldErrors);
        setNotice({ tone: "error", text: e.message });
      } else {
        setNotice({ tone: "error", text: "Une erreur est survenue." });
      }
      return undefined;
    } finally {
      setSaving(false);
    }
  }

  const fieldError = (name: string) => fieldErrors[name]?.[0];
  return { saving, notice, setNotice, run, fieldError };
}
