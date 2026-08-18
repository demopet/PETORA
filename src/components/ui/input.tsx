import type { InputHTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && <label className="label">{label}</label>}
        <input
          className={cn("input", error && "border-danger-500", className)}
          ref={ref}
          {...props}
        />
        {error && <p className="text-sm text-danger-500">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
