import * as React from "react";
import { cn } from "@/lib/utils";

interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "start" | "end";
  className?: string;
}

function DropdownMenu({ trigger, children, align = "end", className }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const alignClass = align === "end" ? "right-0" : "left-0";

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {trigger}
      </button>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-transparent"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            role="menu"
            className={cn(
              "absolute z-50 mt-2 w-56 rounded-md border border-slate-200 bg-white py-1 shadow-lg",
              alignClass,
              className
            )}
          >
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child as React.ReactElement<{ onClose?: () => void }>, {
                  onClose: () => setOpen(false),
                });
              }
              return child;
            })}
          </div>
        </>
      )}
    </div>
  );
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  onClose?: () => void;
  icon?: React.ReactNode;
  destructive?: boolean;
  disabled?: boolean;
  className?: string;
}

function DropdownMenuItem({
  children,
  onClick,
  onClose,
  icon,
  destructive,
  disabled,
  className,
}: DropdownMenuItemProps) {
  return (
    <button
      role="menuitem"
      disabled={disabled}
      onClick={() => {
        onClick?.();
        onClose?.();
      }}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-2 text-sm text-left transition-colors",
        destructive ? "text-danger-600 hover:bg-danger-50" : "text-slate-700 hover:bg-slate-50",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      {icon && <span className="h-4 w-4">{icon}</span>}
      {children}
    </button>
  );
}

interface DropdownMenuSeparatorProps {
  className?: string;
}

function DropdownMenuSeparator({ className }: DropdownMenuSeparatorProps) {
  return <div className={cn("my-1 border-t border-slate-200", className)} />;
}

interface DropdownMenuLabelProps {
  children: React.ReactNode;
  className?: string;
}

function DropdownMenuLabel({ children, className }: DropdownMenuLabelProps) {
  return (
    <div className={cn("px-3 py-2 text-xs font-semibold text-slate-500 uppercase", className)}>
      {children}
    </div>
  );
}

export { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel };
