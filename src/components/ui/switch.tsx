import * as React from "react";
import { cn } from "@/lib/utils";

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

function Switch({ label, className, id, ...props }: SwitchProps) {
  const switchId = id || `switch-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={props.checked}
        aria-labelledby={label ? switchId : undefined}
        id={switchId}
        onClick={() =>
          props.onChange?.({
            target: { checked: !props.checked },
          } as React.ChangeEvent<HTMLInputElement>)
        }
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
          props.checked ? "bg-primary-600" : "bg-slate-200",
          props.disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out",
            props.checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
      {label && (
        <label htmlFor={switchId} className="text-sm font-medium text-slate-700 cursor-pointer">
          {label}
        </label>
      )}
    </div>
  );
}

export { Switch };
