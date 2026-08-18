import * as React from "react";
import { cn, formatCurrencyInput, parseCurrencyInput } from "@/lib/utils/format";

interface CurrencyInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> {
  value?: number;
  onChange?: (_value: number) => void;
}

function CurrencyInput({ value, onChange, className, ...props }: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = React.useState(
    value !== undefined ? formatCurrencyInput(value) : ""
  );

  React.useEffect(() => {
    if (value !== undefined) {
      setDisplayValue(formatCurrencyInput(value));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const parsed = parseCurrencyInput(raw);
    setDisplayValue(raw);
    onChange?.(parsed);
  };

  const handleBlur = () => {
    if (value !== undefined) {
      setDisplayValue(formatCurrencyInput(value));
    }
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">Rp</span>
      <input
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className={cn(
          "flex h-10 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  );
}

export { CurrencyInput };
