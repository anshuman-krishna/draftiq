import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && <label className="text-sm font-medium text-neutral-600">{label}</label>}
        <input
          ref={ref}
          className={`rounded-xl border bg-white/60 px-4 py-3 text-sm backdrop-blur-sm transition-all duration-200 placeholder:text-neutral-400 focus:outline-none focus:ring-2 ${
            error
              ? "border-red-300 focus:ring-red-200"
              : "border-neutral-200 focus:border-primary focus:ring-primary/20"
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
