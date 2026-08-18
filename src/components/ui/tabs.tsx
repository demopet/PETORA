import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  value: string;
  onValueChange: (_value: string) => void;
  children: React.ReactNode;
  className?: string;
}

function Tabs({ value, onValueChange: _onValueChange, children, className }: TabsProps) {
  return (
    <div className={cn("w-full", className)}>
      <div role="tablist" className="flex items-center gap-1 border-b border-slate-200">
        {React.Children.map(children, (child) => {
          if (React.isValidElement<{ tabValue?: string }>(child)) {
            return React.cloneElement(child, {
              active: (child.props as { tabValue?: string }).tabValue === value,
            } as Record<string, unknown>);
          }
          return child;
        })}
      </div>
    </div>
  );
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
}

function TabsList({ children, className, active }: TabsListProps) {
  return (
    <button
      role="tab"
      aria-selected={active}
      tabIndex={active ? 0 : -1}
      className={cn(
        "px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
        active
          ? "border-b-2 border-primary-500 text-primary-600"
          : "text-slate-500 hover:text-slate-700",
        className
      )}
    >
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  activeValue: string;
  children: React.ReactNode;
  className?: string;
}

function TabsContent({ value, activeValue, children, className }: TabsContentProps) {
  if (value !== activeValue) return null;
  return (
    <div role="tabpanel" className={cn("mt-4", className)}>
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsContent };
