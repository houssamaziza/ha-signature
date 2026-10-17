"use client";

type Props = { label: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean };

export function Toggle({ label, checked, onChange, disabled }: Props) {
  return (
    <label className="flex items-center justify-between gap-3 text-[15px] font-medium">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-accent" : "bg-[#b9b1a3]"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </label>
  );
}
