import { CheckIcon } from "@/components/ui/icons";

type Props = { features: string[]; layout?: "list" | "row" };

export function FeatureList({ features, layout = "list" }: Props) {
  if (layout === "row") {
    return (
      <ul className="grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-3 lg:flex-col lg:items-start">
            <CheckIcon className="shrink-0 text-accent" />
            <span className="text-base font-medium lg:text-[17px]">{f}</span>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <ul className="flex list-none flex-col gap-3 p-0 text-base md:text-[17px]">
      {features.map((f) => (
        <li key={f} className="flex items-center gap-3">
          <CheckIcon className="shrink-0 text-accent" />
          <span>{f}</span>
        </li>
      ))}
    </ul>
  );
}
