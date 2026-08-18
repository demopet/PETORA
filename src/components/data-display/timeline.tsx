import * as React from "react";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils/format";

interface TimelineItem {
  date?: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn("space-y-0", className)}>
      {items.map((item, index) => (
        <div key={index} className="relative flex gap-4 pb-6 last:pb-0">
          {index < items.length - 1 && (
            <div className="absolute left-4 top-8 h-full w-px bg-slate-200" />
          )}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            {item.icon || <div className="h-2 w-2 rounded-full bg-slate-400" />}
          </div>
          <div className="flex-1 pt-1">
            {item.date && <p className="text-xs text-slate-400">{formatDateTime(item.date)}</p>}
            <p className="mt-0.5 text-sm font-medium text-slate-900">{item.title}</p>
            {item.description && <p className="mt-1 text-sm text-slate-500">{item.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

export { Timeline };
