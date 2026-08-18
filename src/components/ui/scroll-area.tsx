import * as React from "react";
import { cn } from "@/lib/utils";

interface ScrollAreaProps {
  children: React.ReactNode;
  className?: string;
  orientation?: "vertical" | "horizontal" | "both";
}

function ScrollArea({ children, className, orientation = "vertical" }: ScrollAreaProps) {
  const vertical = orientation === "vertical" || orientation === "both";
  const horizontal = orientation === "horizontal" || orientation === "both";

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        vertical && "overflow-y-auto",
        horizontal && "overflow-x-auto",
        className
      )}
    >
      {children}
    </div>
  );
}

export { ScrollArea };
