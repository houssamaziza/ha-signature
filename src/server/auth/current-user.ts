import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { SESSION_COOKIE, findSession, type SessionUser } from "./session";

/** Utilisateur connecté pour les composants serveur de l'administration. */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const store = await cookies();
  const session = await findSession(store.get(SESSION_COOKIE)?.value);
  return session?.user ?? null;
});

export async function requirePageUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/connexion");
  return user;
}
