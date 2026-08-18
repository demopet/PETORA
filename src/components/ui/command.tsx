import * as React from "react";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

interface CommandProps {
  open?: boolean;
  onOpenChange?: (_open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

function Command({ open, onOpenChange, children, className }: CommandProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className={cn(
        "fixed inset-0 z-50 flex items-start justify-center pt-24 px-4",
        !open && "hidden",
        className
      )}
    >
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange?.(false)}
        onKeyDown={(e) => {
          if (e.key === "Escape") onOpenChange?.(false);
        }}
        tabIndex={0}
        role="button"
        aria-label="Close command palette"
      />
      <div className="relative z-50 w-full max-w-lg rounded-lg border border-slate-200 bg-white shadow-xl">
        {children}
      </div>
    </div>
  );
}

interface CommandInputProps {
  value: string;
  onValueChange: (_value: string) => void;
  className?: string;
}

function CommandInput({ value, onValueChange, className }: CommandInputProps) {
  return (
    <div className="flex items-center border-b border-slate-200 px-4">
      <Search className="h-4 w-4 shrink-0 text-slate-400" />
      <input
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className={cn(
          "flex h-12 w-full border-0 bg-transparent px-3 py-3 text-sm outline-none placeholder:text-slate-400",
          className
        )}
      />
      <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
        ESC
      </kbd>
    </div>
  );
}

interface CommandListProps {
  children: React.ReactNode;
  className?: string;
}

function CommandList({ children, className }: CommandListProps) {
  return <div className={cn("max-h-72 overflow-y-auto py-2", className)}>{children}</div>;
}

interface CommandEmptyProps {
  children?: React.ReactNode;
  className?: string;
}

function CommandEmpty({ children, className }: CommandEmptyProps) {
  return (
    <div className={cn("py-6 text-center text-sm text-slate-500", className)}>
      {children || "No results found."}
    </div>
  );
}

interface CommandGroupProps {
  heading?: string;
  children: React.ReactNode;
  className?: string;
}

function CommandGroup({ heading, children, className }: CommandGroupProps) {
  return (
    <div className={cn("px-2", className)}>
      {heading && (
        <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase">{heading}</div>
      )}
      {children}
    </div>
  );
}

interface CommandItemProps {
  children: React.ReactNode;
  onSelect?: () => void;
  icon?: React.ReactNode;
  shortcut?: string;
  destructive?: boolean;
  className?: string;
}

function CommandItem({
  children,
  onSelect,
  icon,
  shortcut,
  destructive,
  className,
}: CommandItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
        destructive ? "text-danger-600 hover:bg-danger-50" : "text-slate-700 hover:bg-slate-100",
        className
      )}
    >
      {icon && <span className="h-4 w-4 shrink-0">{icon}</span>}
      <span className="flex-1 text-left">{children}</span>
      {shortcut && (
        <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-500">
          {shortcut}
        </kbd>
      )}
    </button>
  );
}

interface CommandSeparatorProps {
  className?: string;
}

function CommandSeparator({ className }: CommandSeparatorProps) {
  return <div className={cn("-mx-2 my-1 border-t border-slate-200", className)} />;
}

export {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
};
