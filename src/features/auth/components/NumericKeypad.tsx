import { useCallback, useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Delete } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NumericKeypadProps {
  length?: number;
  value: string;
  onChange: (_value: string) => void;
  onSubmit: () => void;
  mask?: boolean;
  showToggle?: boolean;
  error?: string | null;
  disabled?: boolean;
  isLoading?: boolean;
}

export function NumericKeypad({
  length = 8,
  value,
  onChange,
  onSubmit,
  mask = true,
  showToggle = true,
  error = null,
  disabled = false,
  isLoading = false,
}: NumericKeypadProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMasked, setIsMasked] = useState(mask);

  const isDisabled = disabled || isLoading;

  const handleDigit = useCallback(
    (digit: string) => {
      if (isDisabled || value.length >= length) return;
      onChange(value + digit);
    },
    [isDisabled, value, length, onChange]
  );

  const handleBackspace = useCallback(() => {
    if (isDisabled || value.length === 0) return;
    onChange(value.slice(0, -1));
  }, [isDisabled, value, onChange]);

  const handleSubmit = useCallback(() => {
    if (isDisabled || value.length !== length) return;
    onSubmit();
  }, [isDisabled, value, length, onSubmit]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isDisabled) return;

      if (e.key >= "0" && e.key <= "9") {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      if (container) {
        container.removeEventListener("keydown", handleKeyDown);
      }
    };
  }, [isDisabled, handleDigit, handleBackspace, handleSubmit]);

  useEffect(() => {
    if (containerRef.current && !isDisabled) {
      containerRef.current.focus();
    }
  }, [isDisabled]);

  const boxes = Array.from({ length }, (_, i) => {
    const digit = value[i];
    const hasValue = digit !== undefined;
    const isFocused = i === value.length;
    const displayChar = hasValue ? (isMasked ? "•" : digit) : "";

    return (
      <div
        key={i}
        className={cn(
          "flex h-14 w-12 items-center justify-center rounded-md border text-center text-xl font-bold transition-all",
          error
            ? "border-danger-500 ring-2 ring-danger-100"
            : isFocused && !isDisabled
              ? "border-primary-500 ring-2 ring-primary-100"
              : "border-slate-300",
          hasValue ? "text-slate-900" : "text-slate-400"
        )}
        data-testid={`pin-box-${i}`}
      >
        {displayChar ||
          (isFocused && !isDisabled ? (
            <span className="h-5 w-0.5 animate-pulse bg-primary-500" />
          ) : null)}
      </div>
    );
  });

  const keypadButtons = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
  ];

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center gap-6 outline-none"
      data-testid="numeric-keypad"
    >
      <div className="flex gap-2">{boxes}</div>

      <div className="grid grid-cols-3 gap-3">
        {keypadButtons.flat().map((digit) => (
          <Button
            key={digit}
            type="button"
            variant="outline"
            className="h-14 w-20 rounded-lg text-lg font-semibold"
            onClick={() => handleDigit(digit)}
            disabled={isDisabled}
            data-testid={`key-${digit}`}
          >
            {digit}
          </Button>
        ))}

        {showToggle ? (
          <Button
            type="button"
            variant="ghost"
            className="h-14 w-20 rounded-lg text-lg font-semibold"
            onClick={() => setIsMasked((prev) => !prev)}
            disabled={isDisabled}
            data-testid="key-toggle"
            aria-label={isMasked ? "Show PIN" : "Hide PIN"}
          >
            {isMasked ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
          </Button>
        ) : (
          <div className="h-14 w-20" />
        )}

        <Button
          type="button"
          variant="outline"
          className="h-14 w-20 rounded-lg text-lg font-semibold"
          onClick={() => handleDigit("0")}
          disabled={isDisabled}
          data-testid="key-0"
        >
          0
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="h-14 w-20 rounded-lg text-lg font-semibold"
          onClick={handleBackspace}
          disabled={isDisabled}
          data-testid="key-backspace"
          aria-label="Backspace"
        >
          <Delete className="h-5 w-5" />
        </Button>
      </div>

      <Button
        type="button"
        className="w-full"
        onClick={handleSubmit}
        disabled={isDisabled || value.length !== length}
        data-testid="submit-button"
      >
        {isLoading ? "Memproses..." : "Masuk"}
      </Button>

      {error && (
        <p className="text-sm text-danger-600" data-testid="error-message">
          {error}
        </p>
      )}
    </div>
  );
}
