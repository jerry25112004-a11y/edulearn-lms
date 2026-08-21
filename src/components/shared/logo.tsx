import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, iconOnly = false }: { className?: string; iconOnly?: boolean }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5 text-slate-900", className)}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-700 text-white">
        <GraduationCap className="h-4.5 w-4.5" strokeWidth={2} />
      </span>
      {!iconOnly && <span className="font-serif text-lg font-semibold tracking-tight">EduLearn</span>}
    </Link>
  );
}
