import * as React from "react";
import { cn } from "@/lib/utils";

interface PopoverProps {
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "start" | "end" | "center";
  className?: string;
}

function Popover({
  open,
  onOpenChange,
  trigger,
  children,
  align = "center",
  className,
}: PopoverProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOpenChange(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onOpenChange]);

  const alignClass =
    align === "start" ? "left-0" : align === "end" ? "right-0" : "left-1/2 -translate-x-1/2";

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex"
      >
        {trigger}
      </button>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-transparent"
            onClick={() => onOpenChange(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            className={cn(
              "absolute z-50 mt-2 w-72 rounded-md border border-slate-200 bg-white p-4 shadow-lg",
              alignClass,
              className
            )}
          >
            {children}
          </div>
        </>
      )}
    </div>
  );
}

export { Popover };
