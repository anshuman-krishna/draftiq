const VARIANTS: Record<string, string> = {
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
  neutral: "bg-neutral-100 text-neutral-600",
  info: "bg-sky-100 text-sky-700",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: keyof typeof VARIANTS;
}

export function Badge({ children, variant = "neutral" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${VARIANTS[variant]}`}
    >
      {children}
    </span>
  );
}
