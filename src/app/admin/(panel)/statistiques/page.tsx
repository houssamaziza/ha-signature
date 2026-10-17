import Link from "next/link";
import type { ReactNode } from "react";
import { Card, Kpi, PageHeader } from "@/components/admin/ui";
import { getStats } from "@/server/services/admin/stats.service";
import { STATS_PERIODS, type StatsPeriod } from "@/shared/schemas/admin";
import { countryFlag, countryName } from "@/shared/geo";

const PERIOD_LABELS: Record<StatsPeriod, string> = { today: "Aujourd’hui", "7d": "7 derniers jours", "30d": "30 derniers jours", "12m": "12 mois" };
const DEVICE_LABELS: Record<string, string> = { MOBILE: "Mobile", TABLET: "Tablette", DESKTOP: "Ordinateur" };
const SOURCE_LABELS: Record<string, string> = { google: "Google", social: "Facebook / Instagram", whatsapp: "WhatsApp", direct: "Accès direct" };
const PAGE_LABELS: Record<string, string> = { "/": "Accueil", "/appartements": "Nos appartements", "/avancement": "Avancement", "/contact": "Contact", "/mentions-legales": "Mentions légales" };

type Props = { searchParams: Promise<{ periode?: string }> };

function Bar({ label, value, max, strong }: { label: ReactNode; value: number; max: number; strong?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between gap-3 text-sm"><span className="min-w-0 truncate">{label}</span><strong>{value}</strong></div>
      <div className="h-1.5 rounded-full bg-[#efe9df]">
        <div className={`h-1.5 rounded-full ${strong ? "bg-accent" : "bg-[#b9a48c]"}`} style={{ width: `${max ? Math.max(2, (value / max) * 100) : 0}%` }} />
      </div>
    </div>
  );
}

export default async function StatsPage({ searchParams }: Props) {
  const { periode } = await searchParams;
  const period: StatsPeriod = (STATS_PERIODS as readonly string[]).includes(periode ?? "") ? (periode as StatsPeriod) : "7d";
  const s = await getStats(period);

  const bucketFmt = new Intl.DateTimeFormat("fr-FR", period === "today" ? { hour: "2-digit" } : period === "12m" ? { month: "short" } : { weekday: "short", day: "numeric" });
  const timeFmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Africa/Algiers" });
  const maxSeries = Math.max(1, ...s.series.map((x) => x.visitors));
  const maxCountry = s.countries[0]?.visitors ?? 1;
  const totalDevices = s.devices.reduce((n, d) => n + d.visitors, 0) || 1;

  return (
    <>
      <PageHeader title="Statistiques de visite" subtitle="Visiteurs ayant accepté la mesure d’audience · aucune adresse IP enregistrée" />
      <div className="flex flex-col gap-6 p-5 md:p-10">
        <nav aria-label="Période" className="flex flex-wrap gap-2">
          {STATS_PERIODS.map((p) => (
            <Link key={p} href={`?periode=${p}`} aria-current={p === period ? "page" : undefined}
              className={`inline-flex h-9 items-center rounded-full px-3.5 text-sm font-bold no-underline ${p === period ? "bg-ink text-white" : "border border-card-line bg-white text-ink-soft"}`}>
              {PERIOD_LABELS[p]}
            </Link>
          ))}
        </nav>

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <Kpi label="Visiteurs" value={s.visitors} />
          <Kpi label="Pages vues" value={s.pageViews} sub={s.visitors ? `${(s.pageViews / s.visitors).toFixed(1).replace(".", ",")} pages par visiteur` : undefined} />
          <Kpi label="Demandes envoyées" value={s.leads} sub={s.visitors ? `${((s.leads / s.visitors) * 100).toFixed(1).replace(".", ",")} % des visiteurs` : undefined} />
          <Kpi label="Pays" value={s.countries.filter((c) => c.country).length} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
          <Card title="Visiteurs" subtitle={PERIOD_LABELS[period]}>
            {s.series.length === 0 ? <p className="text-muted">Pas encore de visites sur cette période.</p> : (
              <div role="img" aria-label="Visiteurs par période" className="flex h-64 items-end gap-2 overflow-x-auto border-b border-card-line pt-6">
                {s.series.map((b) => (
                  <div key={b.bucket} className="flex min-w-7 flex-1 flex-col items-center gap-1.5">
                    <span className="text-xs font-bold">{b.visitors}</span>
                    <div className="w-full max-w-14 rounded-t bg-[#d9c9b6]" style={{ height: `${(b.visitors / maxSeries) * 190}px` }} />
                    <span className="whitespace-nowrap text-[11px] text-muted">{bucketFmt.format(new Date(b.bucket))}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
          <Card title="Visiteurs par pays">
            {s.countries.length === 0 ? <p className="text-muted">Aucune donnée.</p> : s.countries.map((c, i) => (
              <Bar key={c.country ?? "?"} strong={i === 0} value={c.visitors} max={maxCountry}
                label={<><span aria-hidden className="mr-2">{countryFlag(c.country)}</span>{countryName(c.country)}</>} />
            ))}
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[3fr_1.2fr]">
          <Card title="Dernières visites" subtitle="Pays et ville de connexion">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead><tr className="text-left text-xs uppercase tracking-wide text-muted">
                  <th className="py-2 pr-3">Date</th><th className="py-2 pr-3">Pays · ville</th><th className="py-2 pr-3">Page</th><th className="py-2 pr-3">Appareil</th><th className="py-2">Source</th>
                </tr></thead>
                <tbody>
                  {s.recent.map((v) => (
                    <tr key={v.id} className="border-t border-card-line">
                      <td className="py-2.5 pr-3 text-muted">{timeFmt.format(new Date(v.createdAt))}</td>
                      <td className="py-2.5 pr-3"><span aria-hidden className="mr-2">{countryFlag(v.country)}</span><strong>{countryName(v.country)}</strong>{v.city && <span className="text-muted"> · {v.city}</span>}</td>
                      <td className="py-2.5 pr-3">{PAGE_LABELS[v.path] ?? v.path}</td>
                      <td className="py-2.5 pr-3">{DEVICE_LABELS[v.device] ?? v.device}</td>
                      <td className="py-2.5">{SOURCE_LABELS[v.source] ?? v.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <div className="flex flex-col gap-6">
            <Card title="Pages les plus vues">
              {s.pages.map((p) => <Bar key={p.path} label={PAGE_LABELS[p.path] ?? p.path} value={p.views} max={s.pages[0]?.views ?? 1} />)}
            </Card>
            <Card title="Appareils">
              {s.devices.map((d) => <Bar key={d.device} label={`${DEVICE_LABELS[d.device] ?? d.device} · ${Math.round((d.visitors / totalDevices) * 100)} %`} value={d.visitors} max={totalDevices} />)}
            </Card>
            <Card title="Sources">
              {s.sources.map((x) => <Bar key={x.source} label={SOURCE_LABELS[x.source] ?? x.source} value={x.visitors} max={s.sources[0]?.visitors ?? 1} />)}
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
