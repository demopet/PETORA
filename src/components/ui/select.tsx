import * as React from "react";
import { cn } from "@/lib/utils";

interface SelectProps {
  value?: string;
  onValueChange: (_value: string) => void;
  placeholder?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
  disabled?: boolean;
}

export function Select({
  value: _value,
  onValueChange,
  placeholder,
  children,
  className,
  id,
  disabled,
}: SelectProps) {
  return (
    <select
      id={id}
      value={_value}
      onChange={(e) => onValueChange(e.target.value)}
      disabled={disabled}
      className={cn(
        "flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {children}
    </select>
  );
}

interface SelectOptionProps {
  value: string;
  children: React.ReactNode;
}

export function SelectOption({ value, children }: SelectOptionProps) {
  return <option value={value}>{children}</option>;
}
