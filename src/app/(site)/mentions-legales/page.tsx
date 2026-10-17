import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { getSettings } from "@/server/services/settings.service";
import { telLink } from "@/shared/format";


export const metadata: Metadata = {
  title: "Mentions légales et politique de confidentialité",
  robots: { index: true, follow: true },
};

/** Valeur légale, ou repère visible « à compléter » tant qu'elle n'est pas saisie dans l'administration. */
function Fill({ value, label }: { value?: string; label: string }) {
  if (value && value.trim()) return <>{value}</>;
  return <mark className="rounded-[3px] bg-[#f6e7cf] px-1.5 font-bold text-[#6b3a10]">[à compléter : {label}]</mark>;
}

function Section({ id, index, title, children }: { id: string; index: number; title: string; children: ReactNode }) {
  return (
    <section id={id} className="flex scroll-mt-6 flex-col gap-3.5 border-t border-line py-7 lg:py-9">
      <h2 className="flex items-baseline gap-3 font-display text-2xl font-normal lg:text-[30px]">
        <span className="font-sans text-[15px] font-bold text-accent lg:text-[17px]">{String(index).padStart(2, "0")}</span>
        {title}
      </h2>
      <div className="flex flex-col gap-3 text-[15px] leading-[1.7] text-ink-soft lg:text-[17px] [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}

export default async function LegalPage() {
  const s = await getSettings();
  const l = s.legal;
  const host = process.env.SITE_URL ? new URL(process.env.SITE_URL).hostname : "www.hasignature.com";

  const sections: { id: string; title: string; body: ReactNode }[] = [
    {
      id: "editeur",
      title: "Éditeur du site",
      body: (
        <>
          <p>Le site {host} est édité par :</p>
          <ul>
            <li><strong>{s.siteName}</strong> — <Fill value={l.companyForm} label="forme juridique" /> au capital de <Fill value={l.capitalDa} label="capital" /> DA</li>
            <li>Siège social : {s.officeAddress}, Algérie</li>
            <li>Registre du commerce (CNRC) n° <Fill value={l.rc} label="RC" /></li>
            <li>NIF : <Fill value={l.nif} label="NIF" /> · NIS : <Fill value={l.nis} label="NIS" /> · Article d’imposition : <Fill value={l.articleImposition} label="AI" /></li>
            <li>Téléphone : <a href={telLink(s.phone)}>{s.phone}</a> · E-mail : <a href={`mailto:${s.email}`}>{s.email}</a></li>
            <li>Directeur de la publication : <Fill value={l.publicationDirector} label="nom et fonction" /></li>
          </ul>
        </>
      ),
    },
    {
      id: "promoteur",
      title: "Promoteur immobilier agréé",
      body: (
        <>
          <p>L’activité de promotion immobilière est régie par la loi n° 11-04 du 17 février 2011 fixant les règles régissant l’activité de promotion immobilière.</p>
          <ul>
            <li>Agrément n° <Fill value={l.promoterApprovalNumber} label="numéro" /> délivré le <Fill value={l.promoterApprovalDate} label="date" /> par le ministère de l’Habitat, de l’Urbanisme et de la Ville</li>
            <li>Inscription au Tableau national des promoteurs immobiliers n° <Fill value={l.nationalRegisterNumber} label="numéro" /></li>
            <li>Affiliation au Fonds de garantie et de caution mutuelle de la promotion immobilière (FGCMPI) n° <Fill value={l.fgcmpiNumber} label="numéro" /></li>
            <li>Permis de construire n° <Fill value={l.buildingPermitNumber} label="numéro" /> délivré le <Fill value={l.buildingPermitDate} label="date" /> par <Fill value={l.buildingPermitAuthority} label="autorité" /></li>
          </ul>
          <p>Les ventes sur plan font l’objet d’un contrat établi devant notaire et sont couvertes par une attestation de garantie du FGCMPI (n° <Fill value={l.fgcmpiGuaranteeNumber} label="attestation" />).</p>
        </>
      ),
    },
    {
      id: "non-contractuel",
      title: "Informations non contractuelles",
      body: (
        <p>
          Les perspectives, illustrations et photographies présentées sur ce site sont des vues d’artiste à caractère indicatif et non contractuel.
          Les surfaces, prix (« à partir de »), délais de livraison et disponibilités sont donnés à titre d’information et peuvent évoluer.
          Seuls le contrat de vente notarié et ses annexes (plans, notice descriptive) engagent {s.siteName}.
        </p>
      ),
    },
    {
      id: "hebergement",
      title: "Hébergement et nom de domaine",
      body: (
        <ul>
          <li>Hébergeur : <Fill value={l.hostName} label="nom" /> — <Fill value={l.hostAddress} label="adresse" /> — <Fill value={l.hostPhone} label="téléphone" /></li>
          <li>Nom de domaine : {host.replace(/^www\./, "")}</li>
        </ul>
      ),
    },
    {
      id: "propriete",
      title: "Propriété intellectuelle",
      body: (
        <p>
          L’ensemble des contenus de ce site (textes, perspectives, photographies, plans, logo, mise en page) est la propriété de {s.siteName} ou de ses partenaires.
          Toute reproduction, représentation ou diffusion, totale ou partielle, sans autorisation écrite préalable est interdite.
        </p>
      ),
    },
    {
      id: "donnees",
      title: "Protection des données personnelles",
      body: (
        <>
          <p>
            Les données à caractère personnel sont traitées conformément à la loi n° 18-07 du 10 juin 2018 relative à la protection des personnes physiques
            dans le traitement des données à caractère personnel, modifiée et complétée par la loi n° 25-11 du 24 juillet 2025.
          </p>
          <ul>
            <li><strong>Responsable du traitement :</strong> {s.siteName}, {s.officeAddress}</li>
            <li><strong>Délégué à la protection des données :</strong> <Fill value={l.dpoName} label="nom" /> — <Fill value={l.dpoEmail} label="e-mail" /></li>
            <li><strong>Données collectées</strong> par le formulaire de contact : nom, téléphone, e-mail (facultatif), appartement souhaité et message.</li>
            <li><strong>Finalités :</strong> répondre à vos demandes, vous informer sur nos logements et organiser des visites. Vos coordonnées ne sont jamais utilisées pour de la prospection sans votre consentement préalable.</li>
            <li><strong>Destinataires :</strong> uniquement l’équipe commerciale de {s.siteName}. Vos données ne sont ni vendues ni cédées.</li>
            <li><strong>Durée de conservation :</strong> <Fill value={l.retentionPeriod} label="durée" /></li>
            <li><strong>Déclaration auprès de l’ANPDP :</strong> récépissé n° <Fill value={l.anpdpReceiptNumber} label="numéro" /></li>
            <li><strong>Hébergement des données :</strong> <Fill value={l.dataLocation} label="en Algérie / à l’étranger" />. Tout transfert de données vers l’étranger est soumis à l’autorisation préalable de l’ANPDP.</li>
          </ul>
          <p>
            Vous disposez d’un droit d’information, d’accès, de rectification et d’opposition sur vos données. Pour l’exercer, écrivez à{" "}
            <a href={`mailto:${s.email}`}>{s.email}</a> ou au siège social. Vous pouvez également saisir l’Autorité nationale de protection des données à
            caractère personnel (ANPDP) : <a href="https://anpdp.dz" target="_blank" rel="noopener noreferrer">anpdp.dz</a>.
          </p>
        </>
      ),
    },
    {
      id: "audience",
      title: "Cookies et mesure d’audience",
      body: (
        <p>
          Avec votre accord, le site mesure sa fréquentation (<Fill value={l.analyticsTool} label="outil de mesure" />) : pages consultées, type d’appareil,
          provenance, ainsi que le pays et la ville approximatifs fournis par notre hébergeur. Aucune adresse IP n’est enregistrée. Un identifiant aléatoire
          est conservé dans votre navigateur uniquement si vous acceptez. Vous pouvez changer d’avis à tout moment via « Gérer les cookies » en bas de page.
        </p>
      ),
    },
    {
      id: "liens",
      title: "Liens externes",
      body: <p>Le site contient des liens vers des services tiers (WhatsApp, réseaux sociaux…). {s.siteName} n’est pas responsable de leur contenu ni de leur politique de confidentialité.</p>,
    },
    {
      id: "droit",
      title: "Droit applicable",
      body: <p>Les présentes mentions légales sont régies par le droit algérien. Tout litige relatif à l’utilisation du site relève de la compétence des juridictions d’Annaba.</p>,
    },
  ];

  return (
    <div className="mx-auto grid max-w-[1440px] gap-6 px-5 pb-14 pt-5 md:px-10 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-20 lg:pb-28 lg:pt-14 xl:px-20">
      <nav aria-label="Sommaire" className="flex flex-col border border-card-line bg-paper px-4 py-2 lg:sticky lg:top-6 lg:self-start lg:border-0 lg:bg-transparent lg:p-0">
        <span className="py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-muted lg:pt-0 lg:text-xs">Sommaire</span>
        {sections.map((sec, i) => (
          <a key={sec.id} href={`#${sec.id}`} className="flex gap-2.5 border-b border-card-line py-2.5 text-[15px] text-ink no-underline lg:border-0 lg:py-2">
            <span className="w-6 font-bold text-accent">{String(i + 1).padStart(2, "0")}</span>
            {sec.title}
          </a>
        ))}
      </nav>
      <article className="flex max-w-[820px] flex-col gap-5 lg:gap-6 lg:row-start-1 lg:col-start-2">
        <Link href="/" className="inline-flex min-h-11 items-center text-[15px] font-bold no-underline">← Retour à l’accueil</Link>
        <h1 className="font-display text-4xl font-normal leading-[1.08] lg:text-6xl">Mentions légales et politique de confidentialité</h1>
        <span className="text-sm text-muted lg:text-[15px]">Dernière mise à jour : <Fill value={l.lastUpdated} label="date" /></span>
        <div className="flex flex-col">
          {sections.map((sec, i) => (
            <Section key={sec.id} id={sec.id} index={i + 1} title={sec.title}>
              {sec.body}
            </Section>
          ))}
        </div>
      </article>
    </div>
  );
}
