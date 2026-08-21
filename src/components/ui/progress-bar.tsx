import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  className,
  barClassName,
  showLabel = false,
}: {
  value: number;
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-2">
      <div className={cn("h-2 w-full overflow-hidden rounded-full bg-slate-100", className)}>
        <div
          className={cn(
            "h-full rounded-full bg-brand-600 transition-all duration-500 ease-out",
            clamped === 100 && "bg-emerald-600",
            barClassName
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && <span className="w-10 shrink-0 text-right text-xs font-medium text-slate-600">{Math.round(clamped)}%</span>}
    </div>
  );
}
