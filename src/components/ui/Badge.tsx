import type { ReactNode } from "react";

type Tone = "dark" | "light" | "accent" | "sand" | "outline";

const tones: Record<Tone, string> = {
  dark: "bg-ink text-stone",
  light: "bg-paper text-ink",
  accent: "bg-accent text-white",
  sand: "bg-sand text-ink-soft",
  outline: "border border-[#8c8578] text-ink-soft",
};

export function Badge({ children, tone = "dark", className = "" }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] md:text-xs ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
