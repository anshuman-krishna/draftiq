import { HTMLAttributes, forwardRef } from "react";

type CardVariant = "default" | "elevated" | "interactive";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  glass?: boolean;
}

const variantStyles: Record<CardVariant, string> = {
  default: "",
  elevated: "shadow-lg",
  interactive:
    "cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:shadow-lg active:scale-[0.99]",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", glass = true, className = "", children, ...props }, ref) => {
    const baseGlass = glass ? "glass-medium" : "bg-white border border-neutral-200 shadow-sm";

    return (
      <div
        ref={ref}
        className={`rounded-2xl p-6 ${baseGlass} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";
