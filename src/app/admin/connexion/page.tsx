import Image from "next/image";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { getCurrentUser } from "@/server/auth/current-user";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ suite?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { suite } = await searchParams;
  // N'accepte que des chemins internes à l'administration (pas de redirection ouverte).
  const next = suite && /^\/admin(\/[\w\-/]*)?$/.test(suite) ? suite : "/admin";
  if (await getCurrentUser()) redirect(next);

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden bg-photo lg:block">
        <Image src="/images/facade-garage.jpg" alt="" fill sizes="50vw" className="object-cover" priority />
      </div>
      <div className="flex items-center justify-center px-5 py-12">
        <div className="flex w-full max-w-[420px] flex-col gap-6">
          <span className="font-display text-3xl font-semibold">H&amp;A <em className="font-normal italic">Signature</em></span>
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-bold">Espace administrateur</h1>
            <p className="text-muted">Connectez-vous pour modifier votre site.</p>
          </div>
          <LoginForm next={next} />
        </div>
      </div>
    </div>
  );
}
