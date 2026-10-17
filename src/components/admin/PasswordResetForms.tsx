"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ApiClientError, api } from "./client-api";
import { Field, Notice, inputClass } from "./ui";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api("/auth/password-reset/request", { method: "POST", json: { email: new FormData(e.currentTarget).get("email") } });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Envoi impossible.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return <Notice tone="success">Si un compte existe avec cette adresse, un lien de réinitialisation vient d’être envoyé. Il est valable 1 heure.</Notice>;
  }
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <Field label="E-mail du compte"><input name="email" type="email" autoComplete="username" required className={inputClass} /></Field>
      {error && <Notice tone="error">{error}</Notice>}
      <button type="submit" disabled={loading} className="h-12 rounded bg-accent font-bold text-white disabled:opacity-60">
        {loading ? "Envoi…" : "Recevoir le lien"}
      </button>
      <Link href="/admin/connexion" className="text-sm font-bold">← Retour à la connexion</Link>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (fd.get("password") !== fd.get("confirm")) return setError("Les deux mots de passe ne correspondent pas.");
    setLoading(true);
    setError(null);
    try {
      await api("/auth/password-reset/confirm", { method: "POST", json: { token, newPassword: fd.get("password") } });
      setDone(true);
    } catch (err) {
      if (err instanceof ApiClientError) setError(err.fieldErrors.newPassword?.[0] ?? err.message);
      else setError("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col gap-4">
        <Notice tone="success">Mot de passe modifié. Vous pouvez vous connecter.</Notice>
        <Link href="/admin/connexion" className="font-bold">Se connecter →</Link>
      </div>
    );
  }
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <Field label="Nouveau mot de passe" hint="10 caractères minimum, avec au moins une lettre et un chiffre.">
        <input name="password" type="password" autoComplete="new-password" required className={inputClass} />
      </Field>
      <Field label="Confirmer le mot de passe"><input name="confirm" type="password" autoComplete="new-password" required className={inputClass} /></Field>
      {error && <Notice tone="error">{error}</Notice>}
      <button type="submit" disabled={loading} className="h-12 rounded bg-accent font-bold text-white disabled:opacity-60">
        {loading ? "Enregistrement…" : "Enregistrer le mot de passe"}
      </button>
    </form>
  );
}
