import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { PlanIcon } from "@/components/ui/icons";
import { Photo } from "@/components/ui/Photo";
import { ApartmentCard } from "@/components/site/ApartmentCard";
import { FeatureList } from "@/components/site/FeatureList";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { getDefaultProject } from "@/server/services/project.service";
import { getSettings } from "@/server/services/settings.service";
import { summarize } from "@/shared/apartments";
import { floorLabel } from "@/shared/constants";
import { formatApartmentNumber, formatPriceDa, telLink } from "@/shared/format";


export const metadata: Metadata = {
  title: "Nos appartements",
  description: "Appartements F4 de 135 m² et penthouse avec terrasse à La Caroube 2, Sidi Aïssa, Annaba.",
};

/** Photos de la page (étape 2 : à rendre éditables depuis l'administration). */
const INTRO_IMAGE = { src: "/images/facade-laterale.jpg", alt: "Vue latérale de la résidence avec ses balcons vitrés" };
const PENTHOUSE_IMAGE = { src: "/images/facade-garage.jpg", alt: "Le dernier étage de la résidence et sa terrasse" };

export default async function ApartmentsPage() {
  const [settings, project] = await Promise.all([getSettings(), getDefaultProject()]);
  if (!project) notFound();

  const summary = summarize(project.apartments);
  const penthouse = summary.penthouses[0];
  const othersSea = summary.others.filter((a) => a.view === "SEA").length;

  return (
    <>
      <section className="mx-auto grid max-w-[1440px] items-center gap-6 px-5 pb-12 pt-5 md:px-10 lg:grid-cols-2 lg:gap-[72px] lg:pb-24 lg:pt-14 xl:px-20">
        <div className="flex flex-col gap-5 lg:gap-7">
          <Link href="/" className="inline-flex min-h-11 items-center text-[15px] font-bold no-underline">← Retour à l’accueil</Link>
          <Badge className="self-start">En construction · Livraison {project.deliveryLabel}</Badge>
          <h1 className="font-display text-[40px] font-normal leading-[1.05] tracking-[-0.02em] lg:text-[68px]">{project.district}</h1>
          <p className="max-w-[540px] text-base leading-relaxed text-body lg:text-[19px]">
            Une résidence de {summary.total} logements à {project.city}, dont {summary.seaCount} avec vue sur mer : {summary.othersLabel}
            {penthouse && " et un penthouse avec terrasse"}.
          </p>
          <dl className="grid grid-cols-3 gap-3 border-t border-line pt-5 lg:gap-6 lg:pt-7">
            <div className="flex flex-col gap-1"><dt className="order-2 text-[13px] text-muted lg:text-sm">logements</dt><dd className="font-display text-[30px] lg:text-[40px]">{summary.total}</dd></div>
            <div className="flex flex-col gap-1"><dt className="order-2 text-[13px] text-muted lg:text-sm">{summary.othersUnit}</dt><dd className="font-display text-[30px] lg:text-[40px]">{summary.others.length}</dd></div>
            {penthouse && (
              <div className="flex flex-col gap-1"><dt className="order-2 text-[13px] text-muted lg:text-sm">penthouse de {penthouse.surfaceM2} m²</dt><dd className="font-display text-[30px] lg:text-[40px]">1</dd></div>
            )}
          </dl>
        </div>
        <Photo src={INTRO_IMAGE.src} alt={INTRO_IMAGE.alt} sizes="(min-width: 1024px) 50vw, 100vw" className="h-[320px] lg:h-[600px]" priority />
      </section>

      {penthouse && (
        <section id="penthouse" className="mx-auto max-w-[1440px] md:px-10 xl:px-20">
          <div className="grid bg-ink text-stone lg:grid-cols-2">
            <Photo src={PENTHOUSE_IMAGE.src} alt={PENTHOUSE_IMAGE.alt} position="top" sizes="(min-width: 1024px) 50vw, 100vw" className="h-[280px] bg-[#3a423e] lg:h-[600px]" />
            <div className="flex flex-col justify-center gap-5 px-5 pb-10 pt-8 lg:gap-7 lg:p-16">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-copper lg:text-[13px]">
                {floorLabel(penthouse.floor)} · {penthouse.view === "SEA" ? "Vue sur mer" : "Vue sur le quartier"}
              </p>
              <h2 className="font-display text-[34px] font-normal leading-tight lg:text-[52px]">Le penthouse avec terrasse</h2>
              <div className="grid grid-cols-2 gap-4 border-y border-[#56605a] py-5 lg:gap-6 lg:py-6">
                <div className="flex flex-col gap-1"><span className="font-display text-[30px] lg:text-[40px]">{penthouse.surfaceM2} m²</span><span className="text-[13px] text-[#c9c4b8] lg:text-sm">Surface</span></div>
                <div className="flex flex-col gap-1"><span className="font-display text-[30px] lg:text-[40px]">Terrasse</span><span className="text-[13px] text-[#c9c4b8] lg:text-sm">Vue sur mer</span></div>
              </div>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[17px] font-bold">
                    {penthouse.priceOnRequest || penthouse.priceFromDa === null ? "Prix sur demande" : `À partir de ${formatPriceDa(penthouse.priceFromDa)}`}
                  </span>
                  {penthouse.planUrl ? (
                    <a href={penthouse.planUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 font-bold text-copper">
                      <PlanIcon /> Voir le plan du penthouse
                    </a>
                  ) : (
                    <span className="inline-flex min-h-11 items-center gap-2 text-sm text-[#a9b0a9]"><PlanIcon /> Plan bientôt disponible</span>
                  )}
                </div>
                <ButtonLink href={`/contact?appartement=${penthouse.number}`} variant="accent">Demander une visite</ButtonLink>
              </div>
            </div>
          </div>
        </section>
      )}

      <section id="logements" className="mx-auto flex max-w-[1440px] flex-col gap-6 px-5 pb-12 pt-14 md:px-10 lg:gap-12 lg:pb-24 lg:pt-28 xl:px-20">
        <div className="grid gap-4 lg:grid-cols-2 lg:items-end lg:gap-[72px]">
          <div className="flex flex-col gap-3 lg:gap-4">
            <p className="eyebrow">Les appartements</p>
            <h2 className="font-display text-[34px] font-normal leading-tight lg:text-[52px]">{summary.othersTitle}</h2>
          </div>
          <p className="text-base leading-relaxed text-body lg:text-lg">
            Des appartements spacieux et lumineux, avec balcon vitré. {othersSea} d’entre eux ont vue sur mer, les{" "}
            {summary.others.length - othersSea} autres donnent sur le quartier. Livrés en semi-fini ou avec les finitions de votre choix.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
          {summary.others.map((a) => (
            <ApartmentCard key={a.id} apartment={a} />
          ))}
          {penthouse && (
            <a href="#penthouse" className="flex flex-col gap-2 bg-ink p-4 text-stone no-underline lg:gap-4 lg:p-7">
              <span className="text-[11px] font-bold tracking-[0.1em] text-[#c9c4b8] lg:order-2 lg:text-[13px]">APPT. {formatApartmentNumber(penthouse.number)}</span>
              <span className="font-display text-2xl font-semibold lg:order-1 lg:text-[30px]">Penthouse</span>
              <span className="text-[13px] text-[#c9c4b8] lg:order-3 lg:text-[15px]">{penthouse.surfaceM2} m² · {floorLabel(penthouse.floor)} · Vue sur mer</span>
              <span className="mt-auto inline-flex min-h-11 items-center font-bold text-copper lg:order-4">Voir le penthouse →</span>
            </a>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 md:px-10 xl:px-20">
        <div className="border-t border-line py-8 lg:py-14">
          <FeatureList features={project.features} layout="row" />
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 pb-14 md:px-10 lg:pb-[120px] xl:px-20">
        <div className="flex flex-col gap-4 bg-sand p-6 lg:mt-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:px-20 lg:py-[72px]">
          <div className="flex flex-col gap-3">
            <h2 className="font-display text-[30px] font-normal leading-tight lg:text-[44px]">Un appartement vous intéresse ?</h2>
            <p className="text-[15px] text-body lg:text-[17px]">Bureau de vente · {settings.officeAddress}</p>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:gap-4">
            <ButtonLink href={telLink(settings.phone)} variant="secondary">{settings.phone}</ButtonLink>
            <WhatsAppButton number={settings.whatsappNumber} message={settings.whatsappMessage} short />
            <ButtonLink href="/contact" variant="accent">Prendre rendez-vous</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
