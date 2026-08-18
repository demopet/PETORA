import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-slate-100 text-slate-800",
        primary: "bg-primary-100 text-primary-700",
        secondary: "bg-slate-100 text-slate-700",
        success: "bg-success-500/10 text-success-600",
        warning: "bg-warning-500/10 text-warning-600",
        danger: "bg-danger-500/10 text-danger-600",
        info: "bg-info-500/10 text-info-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
}

function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props}>
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
