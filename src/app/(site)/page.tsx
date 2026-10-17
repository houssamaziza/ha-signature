import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Photo } from "@/components/ui/Photo";
import { ContactDetails } from "@/components/site/ContactDetails";
import { ContactForm } from "@/components/site/ContactForm";
import { FeatureList } from "@/components/site/FeatureList";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { getContent } from "@/server/services/content.service";
import { getDefaultProject } from "@/server/services/project.service";
import { getSettings } from "@/server/services/settings.service";
import { apartmentOptionLabel, lowestPrice, summarize } from "@/shared/apartments";
import { formatPriceDa } from "@/shared/format";


export default async function HomePage() {
  const [settings, project, hero, steps] = await Promise.all([
    getSettings(),
    getDefaultProject(),
    getContent("home.hero"),
    getContent("home.steps"),
  ]);
  if (!project) notFound();

  const summary = summarize(project.apartments);
  const minPrice = lowestPrice(summary.others);
  const typical = summary.others[0];

  return (
    <>
      {hero.isVisible && (
        <section className="mx-auto grid max-w-[1440px] items-center gap-6 px-5 pb-12 pt-10 md:px-10 lg:grid-cols-2 lg:gap-[72px] lg:pb-24 lg:pt-[88px] xl:px-20">
          <div className="flex flex-col gap-6 lg:gap-8">
            <p className="eyebrow">{hero.data.eyebrow}</p>
            <h1 className="font-display text-[42px] font-normal leading-[1.05] tracking-[-0.02em] md:text-6xl lg:text-[76px] lg:leading-[1.02]">
              {hero.data.title}
            </h1>
            <p className="max-w-[540px] text-[17px] leading-relaxed text-body lg:text-[19px]">{hero.data.text}</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              {hero.data.buttons.map((b) => (
                <ButtonLink key={b.label} href={b.href} variant={b.variant}>
                  {b.label}
                </ButtonLink>
              ))}
            </div>
          </div>
          <Photo src={hero.data.imageUrl} alt={hero.data.imageAlt} priority sizes="(min-width: 1024px) 50vw, 100vw" className="h-[340px] md:h-[480px] lg:h-[640px]" />
        </section>
      )}

      <section id="programme" className="mx-auto flex max-w-[1440px] flex-col gap-7 px-5 py-16 md:px-10 lg:gap-14 lg:py-[120px] xl:px-20">
        <div className="flex flex-col gap-3 lg:gap-4">
          <p className="eyebrow">Nos appartements à {project.city}</p>
          <h2 className="font-display text-[34px] font-normal leading-tight tracking-[-0.01em] lg:text-[52px]">
            {summary.othersLabel}
            {summary.penthouses.length > 0 && " et un penthouse"} face à la mer
          </h2>
        </div>
        <article className="grid bg-paper lg:grid-cols-2">
          <div className="relative">
            <Photo src={project.cover?.url} alt={project.cover?.alt ?? ""} sizes="(min-width: 1024px) 50vw, 100vw" className="h-[280px] md:h-[440px] lg:h-[640px]" />
            <Badge tone="light" className="absolute left-4 top-4 lg:left-6 lg:top-6">
              En construction · Livraison {project.deliveryLabel}
            </Badge>
          </div>
          <div className="flex flex-col justify-center gap-5 px-5 py-6 lg:gap-7 lg:p-14">
            <div className="flex flex-col gap-1.5">
              <h3 className="font-display text-[28px] font-semibold lg:text-[38px]">{project.district}</h3>
              <p className="text-sm text-muted lg:text-base">{project.city}</p>
            </div>
            {typical && (
              <div className="grid grid-cols-2 gap-4 border-y border-line py-5 lg:gap-6 lg:py-6">
                <div className="flex flex-col gap-1">
                  <span className="font-display text-[32px] lg:text-[40px]">{typical.type}</span>
                  <span className="text-[13px] text-muted lg:text-sm">Type d’appartement</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-display text-[32px] lg:text-[40px]">{typical.surfaceM2} m²</span>
                  <span className="text-[13px] text-muted lg:text-sm">Surface habitable</span>
                </div>
              </div>
            )}
            <FeatureList features={project.features} />
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {minPrice !== null && <span className="font-bold">À partir de {formatPriceDa(minPrice)}</span>}
              <ButtonLink href="/appartements">Voir les {summary.total} logements</ButtonLink>
            </div>
          </div>
        </article>
      </section>

      {steps.isVisible && (
        <section className="bg-ink text-stone">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-9 px-5 py-16 md:px-10 lg:gap-16 lg:py-[120px] xl:px-20">
            <div className="grid gap-4 lg:grid-cols-2 lg:items-end lg:gap-[72px]">
              <h2 className="font-display text-[34px] font-normal leading-tight lg:text-[52px]">{steps.data.title}</h2>
              <p className="text-base leading-relaxed text-[#c9c4b8] lg:text-lg">{steps.data.text}</p>
            </div>
            <ol className="grid list-none gap-0 p-0 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
              {steps.data.steps.map((s, i) => (
                <li key={s.title} className="flex flex-col gap-2.5 border-t border-[#56605a] py-5 lg:gap-3.5 lg:pt-7">
                  <span className="font-display text-xl text-copper lg:text-[22px]">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="text-lg font-bold lg:text-xl">{s.title}</h3>
                  <p className="leading-relaxed text-[#c9c4b8]">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      <section id="contact" className="mx-auto max-w-[1440px] px-0 py-0 md:px-10 md:py-16 lg:pb-[120px] xl:px-20">
        <div className="grid gap-8 bg-sand px-5 py-14 md:p-12 lg:grid-cols-2 lg:gap-20 lg:p-20">
          <div className="flex flex-col gap-5 lg:gap-7">
            <h2 className="font-display text-[34px] font-normal leading-tight lg:text-[52px]">Parlons de votre projet.</h2>
            <p className="text-base leading-relaxed text-body lg:text-lg">
              Un conseiller vous rappelle pour vous présenter nos appartements et organiser une visite.
            </p>
            <ContactDetails phone={settings.phone} email={settings.email} officeAddress={settings.officeAddress} />
            <div>
              <WhatsAppButton number={settings.whatsappNumber} message={settings.whatsappMessage} />
            </div>
          </div>
          <ContactForm apartments={project.apartments.map((a) => ({ number: a.number, label: apartmentOptionLabel(a) }))} />
        </div>
      </section>
    </>
  );
}
