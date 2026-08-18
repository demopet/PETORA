import * as React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

function Breadcrumb({ items, className }: BreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-2 text-sm", className)}>
      <Link
        to="/dashboard"
        className="flex items-center gap-1 text-slate-500 hover:text-slate-700"
        aria-label="Dashboard"
      >
        <Home className="h-4 w-4" />
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
            {isLast || !item.href ? (
              <span
                className={cn(
                  "flex items-center gap-1",
                  isLast ? "font-medium text-slate-900" : "text-slate-500"
                )}
                aria-current={isLast ? "page" : undefined}
              >
                {item.icon}
                {item.label}
              </span>
            ) : (
              <Link
                to={item.href}
                className="flex items-center gap-1 text-slate-500 hover:text-slate-700"
              >
                {item.icon}
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export { Breadcrumb };
