import * as React from "react";
import { cn } from "@/lib/utils";

interface RadioGroupProps {
  value?: string;
  onValueChange: (_value: string) => void;
  children: React.ReactNode;
  className?: string;
}

function RadioGroup({ value, onValueChange, children, className }: RadioGroupProps) {
  return (
    <div role="radiogroup" className={cn("flex flex-col gap-2", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement<{ radioValue?: string }>(child)) {
          return React.cloneElement(child, {
            checked: (child.props as { radioValue?: string }).radioValue === value,
            onValueChange,
          } as Record<string, unknown>);
        }
        return child;
      })}
    </div>
  );
}

interface RadioGroupItemProps {
  value: string;
  children?: React.ReactNode;
  checked?: boolean;
  onValueChange?: (_value: string) => void;
  id?: string;
  className?: string;
}

function RadioGroupItem({
  value,
  children,
  checked,
  onValueChange,
  id,
  className,
}: RadioGroupItemProps) {
  const itemId = id || `radio-${value}`;

  return (
    <div className="flex items-center gap-2">
      <input
        type="radio"
        id={itemId}
        name={itemId}
        value={value}
        checked={checked}
        onChange={() => onValueChange?.(value)}
        className={cn(
          "h-4 w-4 border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
          className
        )}
      />
      {children && (
        <label htmlFor={itemId} className="text-sm font-medium text-slate-700">
          {children}
        </label>
      )}
    </div>
  );
}

export { RadioGroup, RadioGroupItem };
