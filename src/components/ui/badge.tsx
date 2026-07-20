import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "essential" | "warning" | "danger" | "muted";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        {
          "bg-stone-100 text-stone-700": variant === "default",
          "bg-emerald-50 text-emerald-700 border border-emerald-200":
            variant === "essential",
          "bg-amber-50 text-amber-700 border border-amber-200":
            variant === "warning",
          "bg-red-50 text-red-700 border border-red-200": variant === "danger",
          "bg-stone-50 text-stone-500": variant === "muted",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
