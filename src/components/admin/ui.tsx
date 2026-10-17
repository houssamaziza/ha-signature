import type { ButtonHTMLAttributes, ReactNode } from "react";

/** Classes communes des champs de formulaire de l'administration. */
export const inputClass =
  "h-11 w-full rounded border border-[#b9b1a3] bg-white px-3 text-[15px] font-medium text-ink outline-none focus:border-accent disabled:bg-stone";
export const textareaClass =
  "w-full rounded border border-[#b9b1a3] bg-white px-3 py-2.5 text-[15px] font-medium leading-relaxed text-ink outline-none focus:border-accent";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <header className="flex flex-col gap-3 border-b border-card-line bg-white px-5 py-5 md:flex-row md:items-center md:justify-between md:px-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </header>
  );
}

export function Card({ title, subtitle, actions, children, className = "" }: { title?: string; subtitle?: string; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`flex flex-col gap-4 rounded-md border border-card-line bg-white p-5 md:p-6 ${className}`}>
      {(title || actions) && (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            {title && <h2 className="text-lg font-bold">{title}</h2>}
            {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-[13px] font-bold text-ink-soft">
      {label}
      {children}
      {hint && !error && <span className="text-xs font-medium text-muted">{hint}</span>}
      {error && <span className="text-xs font-bold text-[#a1361b]">{error}</span>}
    </label>
  );
}

export function Kpi({ label, value, sub }: { label: string; value: ReactNode; sub?: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-card-line bg-white px-5 py-4">
      <span className="text-[13px] font-bold text-muted">{label}</span>
      <span className="font-display text-3xl md:text-[34px]">{value}</span>
      {sub && <span className="text-[13px] text-muted">{sub}</span>}
    </div>
  );
}

const pillTones = {
  green: "bg-[#e3efe6] text-[#24563a]",
  amber: "bg-[#f6e7cf] text-[#7a4a12]",
  red: "bg-[#f3ddd0] text-[#8a3b14]",
  gray: "bg-sand text-ink-soft",
} as const;

export function Pill({ children, tone = "gray" }: { children: ReactNode; tone?: keyof typeof pillTones }) {
  return <span className={`inline-flex h-[26px] items-center whitespace-nowrap rounded-full px-2.5 text-[13px] font-bold ${pillTones[tone]}`}>{children}</span>;
}

export function Button({
  children,
  variant = "secondary",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger"; size?: "sm" | "md" }) {
  const v = {
    primary: "bg-accent text-white border-transparent hover:brightness-110",
    secondary: "bg-white text-ink border-[#8c8578] hover:bg-stone",
    danger: "bg-white text-[#a1361b] border-[#d9b4a6] hover:bg-[#fbeee8]",
  }[variant];
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded border font-bold transition disabled:opacity-50 ${size === "sm" ? "h-9 px-3 text-sm" : "h-11 px-4 text-[15px]"} ${v} ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function Notice({ tone, children }: { tone: "success" | "error" | "info"; children: ReactNode }) {
  const t = { success: "border-[#24563a] bg-[#e3efe6] text-[#24563a]", error: "border-[#a1361b] bg-[#fbeee8] text-[#a1361b]", info: "border-accent bg-white text-ink-soft" }[tone];
  return (
    <p role={tone === "error" ? "alert" : "status"} className={`rounded border-l-[3px] px-4 py-3 text-sm font-medium ${t}`}>
      {children}
    </p>
  );
}
