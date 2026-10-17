"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ApiClientError, api } from "./client-api";
import { Field, Notice, inputClass } from "./ui";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    setError(null);
    try {
      await api("/auth/login", { method: "POST", json: { email: fd.get("email"), password: fd.get("password") } });
      router.replace(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Connexion impossible.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <Field label="E-mail">
        <input name="email" type="email" autoComplete="username" required className={inputClass} />
      </Field>
      <Field label="Mot de passe">
        <input name="password" type="password" autoComplete="current-password" required className={inputClass} />
      </Field>
      {error && <Notice tone="error">{error}</Notice>}
      <button type="submit" disabled={loading} className="h-12 rounded bg-accent font-bold text-white disabled:opacity-60">
        {loading ? "Connexion…" : "Se connecter"}
      </button>
      <Link href="/admin/mot-de-passe-oublie" className="self-center text-sm font-bold">Mot de passe oublié ?</Link>
    </form>
  );
}
