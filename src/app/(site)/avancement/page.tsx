import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Photo } from "@/components/ui/Photo";
import { PhaseTimeline } from "@/components/site/PhaseTimeline";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { getDefaultProject } from "@/server/services/project.service";
import { getSettings } from "@/server/services/settings.service";


export const metadata: Metadata = {
  title: "Avancement du projet",
  description: "Suivez la construction de la résidence La Caroube 2 à Annaba : étapes du chantier et photos.",
};

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });

export default async function ProgressPage() {
  const [settings, project] = await Promise.all([getSettings(), getDefaultProject()]);
  if (!project) notFound();

  const current = project.phases.find((p) => p.state === "current");
  const currentIndex = current ? project.phases.indexOf(current) + 1 : 0;

  return (
    <>
      <section className="mx-auto grid max-w-[1440px] gap-5 px-5 pb-10 pt-8 md:px-10 lg:grid-cols-2 lg:items-end lg:gap-[72px] lg:pb-[88px] lg:pt-14 xl:px-20">
        <div className="flex flex-col gap-4 lg:gap-6">
          <p className="eyebrow">Avancement du projet</p>
          <h1 className="font-display text-[38px] font-normal leading-[1.08] tracking-[-0.015em] lg:text-[64px]">
            Suivez la construction de votre future résidence.
          </h1>
        </div>
        <div className="flex flex-col gap-4 lg:gap-5">
          <p className="text-base leading-relaxed text-body lg:text-lg">
            Résidence {project.district} — {project.city}. Nous publions ici l’état du chantier et des photos à chaque nouvelle étape.
          </p>
          <div className="flex flex-wrap gap-2 lg:gap-3">
            <Badge>Livraison prévue · {project.deliveryLabel}</Badge>
            {project.progressUpdatedAt && (
              <Badge tone="outline">Mise à jour · {dateFormatter.format(new Date(project.progressUpdatedAt))}</Badge>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 md:px-10 xl:px-20">
        <div className="flex flex-col gap-5 border border-card-line bg-paper px-5 pb-2 pt-7 lg:gap-10 lg:p-16">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-baseline lg:justify-between">
            <h2 className="font-display text-[28px] font-normal lg:text-[40px]">Les étapes du chantier</h2>
            {current && (
              <span className="text-sm font-bold text-accent lg:text-base">
                Étape {currentIndex} sur {project.phases.length} · {current.name}
              </span>
            )}
          </div>
          <PhaseTimeline phases={project.phases} />
        </div>
      </section>

      <section className="mx-auto flex max-w-[1440px] flex-col gap-6 px-5 py-14 md:px-10 lg:gap-10 lg:pb-24 lg:pt-28 xl:px-20">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <h2 className="font-display text-[32px] font-normal lg:text-[48px]">Le chantier en images</h2>
          <p className="text-muted">Les photos les plus récentes en premier.</p>
        </div>
        {project.progressPhotos.length === 0 ? (
          <p className="border border-dashed border-line bg-paper p-8 text-center text-body">
            Les premières photos du chantier seront publiées très prochainement.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {project.progressPhotos.map((photo) => (
              <figure key={photo.id} className="m-0 flex flex-col gap-3">
                <Photo src={photo.url} alt={photo.alt} sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="h-60 lg:h-[340px]" />
                <figcaption className="text-[15px] text-body">
                  <strong className="text-ink">{dateFormatter.format(new Date(photo.takenAt))}</strong> · {photo.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-[1440px] px-5 pb-12 md:px-10 lg:pb-[120px] xl:px-20">
        <div className="flex flex-col gap-4 bg-sand p-6 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:px-20 lg:py-16">
          <div className="flex flex-col gap-3">
            <h2 className="font-display text-[28px] font-normal leading-tight lg:text-[40px]">Une question sur l’avancement ?</h2>
            <p className="text-[15px] text-body lg:text-[17px]">Nous vous répondons et pouvons organiser une visite du chantier.</p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 lg:flex-row lg:gap-4">
            <WhatsAppButton number={settings.whatsappNumber} message={settings.whatsappMessage} short />
            <ButtonLink href="/contact" variant="accent">Nous contacter</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
