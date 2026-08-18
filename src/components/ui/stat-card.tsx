import * as React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  trend?: { value: number; direction: "up" | "down" };
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({
  title,
  value,
  trend,
  icon,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-slate-200 bg-white p-6 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
          {trend && (
            <p
              className={cn(
                "mt-2 text-sm",
                trend.direction === "up"
                  ? "text-success-600"
                  : "text-danger-600",
              )}
            >
              {trend.direction === "up" ? "↑" : "↓"} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
    </div>
  );
}
