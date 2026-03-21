"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  displayValue?: string;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ label, displayValue, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-3">
        {(label || displayValue) && (
          <div className="flex items-center justify-between">
            {label && <label className="text-sm font-medium text-neutral-600">{label}</label>}
            {displayValue && (
              <span className="text-sm font-semibold text-neutral-900">{displayValue}</span>
            )}
          </div>
        )}
        <input ref={ref} type="range" className={`w-full ${className}`} {...props} />
      </div>
    );
  },
);

Slider.displayName = "Slider";
