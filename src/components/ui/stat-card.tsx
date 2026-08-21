import * as React from "react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "brand",
  trend,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  accent?: "brand" | "emerald" | "amber" | "rose" | "sky";
  trend?: string;
}) {
  const accentClasses: Record<string, string> = {
    brand: "bg-brand-50 text-brand-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
    sky: "bg-sky-50 text-sky-700",
  };
  const topBarClasses: Record<string, string> = {
    brand: "bg-brand-600",
    emerald: "bg-emerald-600",
    amber: "bg-amber-600",
    rose: "bg-rose-600",
    sky: "bg-sky-600",
  };
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-soft">
      <span className={cn("absolute inset-x-0 top-0 h-[3px]", topBarClasses[accent])} />
      <div className="flex items-start justify-between">
        <div>
          <p className="font-ui text-sm font-medium text-slate-500">{label}</p>
          <p className="font-serif mt-2 text-[28px] leading-none font-semibold text-slate-900">{value}</p>
          {trend && <p className="font-ui mt-2 text-xs text-slate-400">{trend}</p>}
        </div>
        {Icon && (
          <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", accentClasses[accent])}>
            <Icon className="h-4.5 w-4.5" />
          </div>
        )}
      </div>
    </div>
  );
}
