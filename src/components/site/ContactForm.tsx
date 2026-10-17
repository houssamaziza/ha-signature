"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { createLeadSchema } from "@/shared/schemas/lead";
import type { ApiResponse } from "@/shared/types/api";

export type ApartmentOption = { number: number; label: string };

type Props = {
  apartments: ApartmentOption[];
  defaultApartment?: number;
  /** Disposition compacte (une colonne) pour mobile et colonnes étroites. */
  compact?: boolean;
};

type FieldErrors = Partial<Record<string, string[]>>;
type Status = "idle" | "submitting" | "success" | "error";

const fieldClass =
  "h-[52px] w-full rounded-[2px] border border-[#8c8578] bg-paper px-4 text-base font-medium text-ink outline-none focus:border-accent";
const labelClass = "flex flex-col gap-2 text-sm font-bold";

export function ContactForm({ apartments, defaultApartment, compact = false }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      email: String(fd.get("email") ?? ""),
      apartmentNumber: fd.get("apartmentNumber") ? Number(fd.get("apartmentNumber")) : undefined,
      message: String(fd.get("message") ?? ""),
      consent: fd.get("consent") === "on",
      website: String(fd.get("website") ?? ""),
    };

    // Validation côté client avec le même schéma que le serveur.
    const local = createLeadSchema.safeParse(payload);
    if (!local.success && !payload.website) {
      setErrors(z.flattenError(local.error).fieldErrors);
      setStatus("error");
      setMessage("Merci de corriger les champs indiqués.");
      return;
    }

    setStatus("submitting");
    setErrors({});
    setMessage(null);
    try {
      const res = await fetch("/api/v1/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as ApiResponse<{ id: number }>;
      if (res.ok && "data" in json) {
        setStatus("success");
        form.reset();
        return;
      }
      if ("error" in json) {
        setErrors((json.error.details as FieldErrors) ?? {});
        setMessage(json.error.message);
      }
      setStatus("error");
    } catch {
      setStatus("error");
      setMessage("Connexion impossible. Vérifiez votre réseau ou appelez-nous directement.");
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="flex flex-col gap-3 border border-card-line bg-paper p-6">
        <p className="font-display text-2xl">Merci, votre demande est bien envoyée.</p>
        <p className="text-body">Un conseiller vous rappelle rapidement pour vous donner toutes les informations.</p>
        <button type="button" onClick={() => setStatus("idle")} className="self-start text-sm font-bold text-accent underline">
          Envoyer une autre demande
        </button>
      </div>
    );
  }

  const err = (name: string) =>
    errors[name]?.[0] ? (
      <span id={`${name}-error`} className="text-sm font-medium text-[#a1361b]">
        {errors[name]?.[0]}
      </span>
    ) : null;
  const describedBy = (name: string) => (errors[name]?.[0] ? `${name}-error` : undefined);

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <div className={`grid gap-5 ${compact ? "" : "md:grid-cols-2"}`}>
        <label className={labelClass}>
          Nom
          <input name="name" type="text" autoComplete="name" required className={fieldClass} aria-invalid={!!errors.name} aria-describedby={describedBy("name")} />
          {err("name")}
        </label>
        <label className={labelClass}>
          Téléphone
          <input name="phone" type="tel" autoComplete="tel" inputMode="tel" required className={fieldClass} aria-invalid={!!errors.phone} aria-describedby={describedBy("phone")} />
          {err("phone")}
        </label>
      </div>
      <label className={labelClass}>
        E-mail <span className="font-medium text-muted">(facultatif)</span>
        <input name="email" type="email" autoComplete="email" className={fieldClass} aria-invalid={!!errors.email} aria-describedby={describedBy("email")} />
        {err("email")}
      </label>
      <label className={labelClass}>
        Appartement qui vous intéresse
        <select name="apartmentNumber" defaultValue={defaultApartment ?? ""} className={fieldClass}>
          <option value="">Je ne sais pas encore</option>
          {apartments.map((a) => (
            <option key={a.number} value={a.number}>
              {a.label}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        Message
        <textarea name="message" rows={4} className={`${fieldClass} h-auto py-3.5`} aria-invalid={!!errors.message} />
        {err("message")}
      </label>

      {/* Champ piège pour les robots : invisible pour les visiteurs. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Site web
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label className="flex items-start gap-2.5 text-[13px] leading-relaxed text-body">
        <input name="consent" type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-ink" aria-invalid={!!errors.consent} aria-describedby={describedBy("consent")} />
        <span>
          J’accepte que mes données soient utilisées par H&amp;A Signature pour répondre à ma demande, conformément à la loi 18-07.{" "}
          <Link href="/mentions-legales#donnees">En savoir plus</Link>
        </span>
      </label>
      {err("consent")}

      {message && status === "error" && (
        <p role="alert" className="text-sm font-bold text-[#a1361b]">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="h-14 rounded-[2px] bg-accent text-base font-bold text-white transition hover:brightness-110 disabled:opacity-60"
      >
        {status === "submitting" ? "Envoi en cours…" : "Envoyer ma demande"}
      </button>
    </form>
  );
}
