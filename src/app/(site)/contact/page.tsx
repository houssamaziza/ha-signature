import type { Metadata } from "next";
import Link from "next/link";
import { ContactDetails } from "@/components/site/ContactDetails";
import { ContactForm } from "@/components/site/ContactForm";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { getDefaultProject } from "@/server/services/project.service";
import { getSettings } from "@/server/services/settings.service";
import { apartmentOptionLabel } from "@/shared/apartments";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez H&A Signature pour visiter un appartement à La Caroube 2, Annaba.",
};

type Props = { searchParams: Promise<{ appartement?: string }> };

export default async function ContactPage({ searchParams }: Props) {
  const [{ appartement }, settings, project] = await Promise.all([searchParams, getSettings(), getDefaultProject()]);
  const apartments = project?.apartments ?? [];
  const requested = Number(appartement);
  const defaultApartment = apartments.some((a) => a.number === requested) ? requested : undefined;

  return (
    <section className="mx-auto flex max-w-[1440px] flex-col gap-5 px-5 pb-14 pt-5 md:px-10 lg:gap-10 lg:pb-[120px] lg:pt-14 xl:px-20">
      <Link href="/appartements" className="inline-flex min-h-11 items-center self-start text-[15px] font-bold no-underline">
        ← Retour aux appartements
      </Link>
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-20 lg:bg-sand lg:p-20">
        <div className="flex flex-col gap-5 lg:gap-7">
          <p className="eyebrow">Contact</p>
          <h1 className="font-display text-[38px] font-normal leading-[1.08] tracking-[-0.015em] lg:text-[60px]">
            Parlons de votre futur appartement.
          </h1>
          <p className="text-base leading-relaxed text-body lg:text-lg">
            Indiquez l’appartement qui vous intéresse : un conseiller vous rappelle pour vous donner les détails et organiser une visite.
          </p>
          <div className="hidden flex-col gap-5 lg:flex">
            <ContactDetails phone={settings.phone} email={settings.email} officeAddress={settings.officeAddress} />
            <div><WhatsAppButton number={settings.whatsappNumber} message={settings.whatsappMessage} /></div>
          </div>
        </div>
        <div className="bg-sand px-5 py-6 lg:bg-transparent lg:p-0">
          <ContactForm
            key={defaultApartment ?? "none"}
            apartments={apartments.map((a) => ({ number: a.number, label: apartmentOptionLabel(a) }))}
            defaultApartment={defaultApartment}
          />
        </div>
        <div className="flex flex-col gap-4 lg:hidden">
          <ContactDetails phone={settings.phone} email={settings.email} officeAddress={settings.officeAddress} />
          <WhatsAppButton number={settings.whatsappNumber} message={settings.whatsappMessage} block />
        </div>
      </div>
    </section>
  );
}
