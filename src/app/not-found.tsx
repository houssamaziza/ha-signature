import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-start justify-center gap-5 px-5">
      <p className="eyebrow">Erreur 404</p>
      <h1 className="font-display text-4xl font-normal">Cette page n’existe pas.</h1>
      <p className="text-body">Elle a peut-être été déplacée. Revenez à l’accueil pour découvrir nos appartements.</p>
      <Link href="/" className="inline-flex h-[52px] items-center rounded-[2px] bg-ink px-7 font-bold text-stone no-underline">
        Retour à l’accueil
      </Link>
    </main>
  );
}
