import Link from "next/link";
import { LeadStatusSelect } from "@/components/admin/LeadStatusSelect";
import { PageHeader } from "@/components/admin/ui";
import { countLeadsByStatus, listLeads } from "@/server/services/admin/lead-admin.service";
import { LEAD_STATUSES, LEAD_STATUS_LABELS, type LeadStatus } from "@/shared/constants";
import { telLink, whatsappLink } from "@/shared/format";
import { countryFlag, countryName } from "@/shared/geo";

type Props = { searchParams: Promise<{ statut?: string; page?: string }> };
const dt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Africa/Algiers" });

/** Numéro algérien local → international pour WhatsApp. */
const toIntl = (phone: string) => {
  const d = phone.replace(/[^\d+]/g, "");
  return d.startsWith("+") ? d : d.startsWith("0") ? `+213${d.slice(1)}` : d;
};

export default async function LeadsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const status = (LEAD_STATUSES as readonly string[]).includes(sp.statut ?? "") ? (sp.statut as LeadStatus) : undefined;
  const page = Math.max(1, Number(sp.page) || 1);
  const [leads, counts] = await Promise.all([listLeads({ status, page, pageSize: 30 }), countLeadsByStatus()]);
  const pages = Math.max(1, Math.ceil(leads.total / leads.pageSize));
  const openCount = (counts.NEW ?? 0) + (counts.CALLED ?? 0) + (counts.VISIT_SCHEDULED ?? 0);

  return (
    <>
      <PageHeader
        title="Demandes de contact"
        subtitle="Suivez chaque client jusqu’à la visite"
        actions={<a href="/api/v1/admin/leads/export" className="inline-flex h-11 items-center rounded border border-[#8c8578] bg-white px-4 font-bold text-ink no-underline">Exporter (Excel)</a>}
      />
      <div className="flex flex-col gap-5 p-5 md:p-10">
        <nav aria-label="Filtrer" className="flex flex-wrap gap-2">
          {[{ key: undefined, label: `En cours (${openCount})` }, ...LEAD_STATUSES.map((s) => ({ key: s, label: `${LEAD_STATUS_LABELS[s]} (${counts[s] ?? 0})` }))].map((f) => (
            <Link key={f.label} href={f.key ? `?statut=${f.key}` : "?"} aria-current={f.key === status ? "page" : undefined}
              className={`inline-flex h-9 items-center rounded-full px-3.5 text-sm font-bold no-underline ${f.key === status ? "bg-ink text-white" : "border border-card-line bg-white text-ink-soft"}`}>
              {f.label}
            </Link>
          ))}
        </nav>
        <div className="overflow-x-auto rounded-md border border-card-line bg-white">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead><tr className="text-left text-xs uppercase tracking-wide text-muted">
              {["Reçue", "Client", "Appartement", "Message", "Statut", "Contacter"].map((h) => <th key={h} className="px-3 py-3">{h}</th>)}
            </tr></thead>
            <tbody>
              {leads.items.length === 0 && <tr><td colSpan={6} className="px-3 py-8 text-center text-muted">Aucune demande.</td></tr>}
              {leads.items.map((l) => (
                <tr key={l.id} className="border-t border-card-line align-top">
                  <td className="whitespace-nowrap px-3 py-3 text-muted">{dt.format(new Date(l.createdAt))}{l.country && <span className="block">{countryFlag(l.country)} {countryName(l.country)}</span>}</td>
                  <td className="px-3 py-3"><strong className="block">{l.name}</strong><span className="block text-muted">{l.phone}</span>{l.email && <a href={`mailto:${l.email}`} className="block">{l.email}</a>}</td>
                  <td className="px-3 py-3">{l.apartment?.label ?? <span className="text-muted">Je ne sais pas encore</span>}</td>
                  <td className="max-w-xs whitespace-pre-line px-3 py-3 text-body">{l.message || "—"}</td>
                  <td className="px-3 py-3"><LeadStatusSelect key={`${l.id}-${l.status}`} id={l.id} status={l.status} /></td>
                  <td className="px-3 py-3">
                    <span className="flex gap-1.5">
                      <a href={telLink(l.phone)} className="inline-flex h-9 items-center rounded border border-[#8c8578] px-3 text-sm font-bold text-ink no-underline">Appeler</a>
                      <a href={whatsappLink(toIntl(l.phone), `Bonjour ${l.name}, H&A Signature suite à votre demande.`)} target="_blank" rel="noopener noreferrer"
                        className="inline-flex h-9 items-center rounded bg-whatsapp px-3 text-sm font-bold text-whatsapp-ink no-underline">WhatsApp</a>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <nav aria-label="Pages" className="flex gap-2">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <Link key={p} href={`?${new URLSearchParams({ ...(status ? { statut: status } : {}), page: String(p) })}`} aria-current={p === page ? "page" : undefined}
                className={`inline-flex h-9 w-9 items-center justify-center rounded font-bold no-underline ${p === page ? "bg-ink text-white" : "border border-card-line bg-white text-ink"}`}>{p}</Link>
            ))}
          </nav>
        )}
      </div>
    </>
  );
}
