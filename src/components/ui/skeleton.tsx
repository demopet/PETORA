import * as React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

function Skeleton({ className, children }: SkeletonProps) {
  return (
    <div className={cn("animate-pulse rounded-md bg-slate-200", className)} aria-hidden="true">
      {children}
    </div>
  );
}

export { Skeleton };
