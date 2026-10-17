import { ForgotPasswordForm } from "@/components/admin/PasswordResetForms";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-5 py-12">
      <div className="flex w-full max-w-[420px] flex-col gap-6">
        <span className="font-display text-3xl font-semibold">H&amp;A <em className="font-normal italic">Signature</em></span>
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-bold">Mot de passe oublié</h1>
          <p className="text-muted">Indiquez l’e-mail de votre compte : nous vous envoyons un lien pour en choisir un nouveau.</p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
