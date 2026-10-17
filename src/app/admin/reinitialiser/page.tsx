import Link from "next/link";
import { ResetPasswordForm } from "@/components/admin/PasswordResetForms";

type Props = { searchParams: Promise<{ jeton?: string }> };

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { jeton } = await searchParams;
  return (
    <div className="flex min-h-dvh items-center justify-center px-5 py-12">
      <div className="flex w-full max-w-[420px] flex-col gap-6">
        <span className="font-display text-3xl font-semibold">H&amp;A <em className="font-normal italic">Signature</em></span>
        <h1 className="text-2xl font-bold">Nouveau mot de passe</h1>
        {jeton ? <ResetPasswordForm token={jeton} /> : (
          <p className="text-muted">Lien incomplet. <Link href="/admin/mot-de-passe-oublie">Demander un nouveau lien</Link>.</p>
        )}
      </div>
    </div>
  );
}
