import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const sheetVariants = cva(
  "fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-lg transition-transform duration-300 ease-in-out",
  {
    variants: {
      open: {
        true: "translate-x-0",
        false: "translate-x-full",
      },
    },
    defaultVariants: {
      open: false,
    },
  }
);

interface SheetProps {
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  children: React.ReactNode;
  side?: "right" | "left";
  className?: string;
}

function Sheet({ open, onOpenChange, children, side = "right", className }: SheetProps) {
  const positionClass =
    side === "left"
      ? open
        ? "-translate-x-0"
        : "-translate-x-full"
      : open
        ? "translate-x-0"
        : "translate-x-full";

  return (
    <>
      {open && (
        <button
          type="button"
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/50 transition-opacity"
          onClick={() => onOpenChange(false)}
        />
      )}
      <div
        role="dialog"
        aria-modal={open}
        className={cn(
          sheetVariants({ open }),
          side === "left" ? "left-0" : "right-0",
          positionClass,
          className
        )}
      >
        {children}
      </div>
    </>
  );
}

interface SheetContentProps {
  children: React.ReactNode;
  className?: string;
}

function SheetContent({ children, className }: SheetContentProps) {
  return <div className={cn("flex h-full flex-col", className)}>{children}</div>;
}

interface SheetHeaderProps {
  children: React.ReactNode;
  className?: string;
}

function SheetHeader({ children, className }: SheetHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-slate-200 px-6 py-4",
        className
      )}
    >
      {children}
    </div>
  );
}

interface SheetTitleProps {
  children: React.ReactNode;
  className?: string;
}

function SheetTitle({ children, className }: SheetTitleProps) {
  return <h2 className={cn("text-lg font-semibold text-slate-900", className)}>{children}</h2>;
}

interface SheetBodyProps {
  children: React.ReactNode;
  className?: string;
}

function SheetBody({ children, className }: SheetBodyProps) {
  return <div className={cn("flex-1 overflow-y-auto px-6 py-4", className)}>{children}</div>;
}

interface SheetFooterProps {
  children: React.ReactNode;
  className?: string;
}

function SheetFooter({ children, className }: SheetFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-4",
        className
      )}
    >
      {children}
    </div>
  );
}

export { Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody, SheetFooter };
