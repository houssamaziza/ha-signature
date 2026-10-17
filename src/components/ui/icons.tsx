/** Icônes SVG légères (pas de dépendance d'icônes). */
type IconProps = { size?: number; className?: string };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const CheckIcon = ({ size = 22, className }: IconProps) => (
  <svg {...base(size)} className={className}><polyline points="5 12 10 17 19 7" /></svg>
);

export const ChatIcon = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M3 21l1.7-4.6A8.5 8.5 0 1 1 8 19.6z" />
    <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1.2-1.4-2-1-1 .8a4 4 0 0 1-2.1-2.1l.8-1-1-2z" />
  </svg>
);

export const PhoneIcon = ({ size = 18, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
  </svg>
);

export const PlanIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} strokeWidth={1.8} className={className}>
    <rect x="3" y="3" width="18" height="18" />
    <path d="M3 12h9M12 3v6M12 15v6M15 12h6" />
  </svg>
);

export const MenuIcon = ({ size = 24, className }: IconProps) => (
  <svg {...base(size)} strokeWidth={1.8} className={className}>
    <line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" />
  </svg>
);

export const CloseIcon = ({ size = 24, className }: IconProps) => (
  <svg {...base(size)} strokeWidth={1.8} className={className}>
    <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
  </svg>
);
