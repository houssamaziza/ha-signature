import type { PhaseDTO } from "@/shared/types/api";

const STATE_LABEL: Record<PhaseDTO["state"], string> = { done: "Terminé", current: "En cours", upcoming: "À venir" };
const PILL: Record<PhaseDTO["state"], string> = {
  done: "bg-ink text-stone",
  current: "bg-accent text-white",
  upcoming: "bg-sand text-muted",
};

/** Étapes du chantier : verticales sur mobile, en colonnes sur grand écran. */
export function PhaseTimeline({ phases }: { phases: PhaseDTO[] }) {
  return (
    <ol className="flex list-none flex-col p-0 lg:grid lg:grid-cols-5 lg:gap-6">
      {phases.map((p) => {
        const reached = p.state !== "upcoming";
        return (
          <li
            key={p.order}
            aria-current={p.state === "current" ? "step" : undefined}
            className={`flex flex-col gap-2 border-l-[3px] pb-7 pl-5 lg:gap-3 lg:border-l-0 lg:border-t-4 lg:pb-0 lg:pl-0 lg:pt-6 ${reached ? "border-accent" : "border-line"}`}
          >
            <span className={`self-start rounded-[2px] px-2.5 py-1.5 text-xs font-bold uppercase tracking-[0.08em] ${PILL[p.state]}`}>
              {STATE_LABEL[p.state]}
            </span>
            <span className="hidden font-display text-[22px] text-[#8c8578] lg:block">{String(p.order).padStart(2, "0")}</span>
            <h3 className="text-lg font-bold leading-snug lg:text-[19px]">
              <span className="lg:hidden">{String(p.order).padStart(2, "0")} · </span>
              {p.name}
            </h3>
            <p className="text-[15px] leading-relaxed text-body">{p.description}</p>
          </li>
        );
      })}
    </ol>
  );
}
