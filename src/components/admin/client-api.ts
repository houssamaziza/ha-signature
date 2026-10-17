"use client";

import type { ApiResponse } from "@/shared/types/api";

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly fieldErrors: Record<string, string[] | undefined> = {},
  ) {
    super(message);
  }
}

type Options = { method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; json?: unknown; form?: FormData };

/** Appel de l'API depuis l'administration (cookie de session envoyé automatiquement). */
export async function api<T>(path: string, { method = "GET", json, form }: Options = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api/v1${path}`, {
      method,
      headers: json !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: form ?? (json !== undefined ? JSON.stringify(json) : undefined),
      credentials: "same-origin",
    });
  } catch {
    throw new ApiClientError(0, "NETWORK", "Connexion impossible. Vérifiez votre réseau.");
  }
  if (res.status === 401) {
    window.location.href = `/admin/connexion?suite=${encodeURIComponent(window.location.pathname)}`;
  }
  const body = (await res.json().catch(() => null)) as ApiResponse<T> | null;
  if (res.ok && body && "data" in body) return body.data;
  const err = body && "error" in body ? body.error : { code: "UNKNOWN", message: "Une erreur est survenue.", details: undefined };
  throw new ApiClientError(res.status, err.code, err.message, (err.details as Record<string, string[]>) ?? {});
}
