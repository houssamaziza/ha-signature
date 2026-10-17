import Link from "next/link";
import { Card, Kpi, PageHeader, Pill } from "@/components/admin/ui";
import { getDashboard } from "@/server/services/admin/dashboard.service";
import { LEAD_STATUS_LABELS } from "@/shared/constants";
import { formatApartmentNumber } from "@/shared/format";

const dt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Algiers" });

const SHORTCUTS = [
  { href: "/admin/contenus", title: "Modifier la page d’accueil", sub: "Textes, photo et boutons" },
  { href: "/admin/appartements", title: "Changer le statut d’un appartement", sub: "Prix, disponible, réservé ou vendu, plan" },
  { href: "/admin/avancement", title: "Ajouter des photos du chantier", sub: "Mettre à jour l’avancement" },
  { href: "/admin/parametres", title: "Modifier téléphone et WhatsApp", sub: "Coordonnées affichées sur le site" },
];

export default async function DashboardPage() {
  const d = await getDashboard();
  const total = d.apartments.available + d.apartments.reserved + d.apartments.sold;
  return (
    <>
      <PageHeader title="Tableau de bord" subtitle="L’essentiel de votre site." />
      <div className="flex flex-col gap-6 p-5 md:p-10">
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <Kpi label="Nouvelles demandes" value={d.newLeads} sub="À traiter" />
          <Kpi label="Appartements disponibles" value={`${d.apartments.available} / ${total}`} sub={`${d.apartments.reserved} réservé(s) · ${d.apartments.sold} vendu(s)`} />
          <Kpi label="Étape du chantier" value={d.currentPhase} sub={`Livraison ${d.deliveryLabel}`} />
          <Kpi label="Visiteurs (7 jours)" value={d.visitors7d} sub="Avec consentement" />
        </div>
        <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
          <Card title="Dernières demandes" subtitle="Envoyées depuis le formulaire de contact">
            {d.recentLeads.length === 0 ? (
              <p className="text-muted">Aucune demande pour le moment.</p>
            ) : (
              <ul className="flex flex-col">
                {d.recentLeads.map((l) => (
                  <li key={l.id} className="flex items-center gap-3 border-t border-card-line py-3 first:border-0">
                    <span className="flex min-w-0 flex-1 flex-col">
                      <strong className="truncate">{l.name}</strong>
                      <span className="text-sm text-muted">
                        {l.apartment ? `Appt. ${formatApartmentNumber(l.apartment.number)}` : "Sans appartement précis"} · {dt.format(l.createdAt)}
                      </span>
                    </span>
                    <Pill tone={l.status === "NEW" ? "red" : "green"}>{LEAD_STATUS_LABELS[l.status]}</Pill>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/admin/demandes" className="font-bold">Voir toutes les demandes →</Link>
          </Card>
          <Card title="Raccourcis">
            {SHORTCUTS.map((s) => (
              <Link key={s.href} href={s.href} className="flex items-center gap-3 rounded border border-card-line p-3.5 text-ink no-underline hover:bg-stone">
                <span className="flex flex-1 flex-col"><strong>{s.title}</strong><span className="text-sm text-muted">{s.sub}</span></span>
                <span aria-hidden className="text-muted">→</span>
              </Link>
            ))}
          </Card>
        </div>
      </div>
    </>
  );
}
