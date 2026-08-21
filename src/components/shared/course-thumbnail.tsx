"use client";

import Image from "next/image";
import { BookOpen, Code2, Database, Palette, ShieldCheck, Smartphone, Brain, LineChart } from "lucide-react";
import { cn } from "@/lib/utils";
import * as React from "react";

/* A curated set of deep, muted plate colors — evokes a printed book-cover
   series rather than a bright generated-gradient placeholder. */
const PLATES = ["#23303d", "#6b3018", "#2f4a3c", "#47304a", "#38434f", "#4a4325"];

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "web-development": Code2,
  "mobile-development": Smartphone,
  database: Database,
  programming: Code2,
  "ui-ux-design": Palette,
  "ai-machine-learning": Brain,
  cybersecurity: ShieldCheck,
  "data-science": LineChart,
};

function hashToIndex(str: string, mod: number) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) % 1000;
  return hash % mod;
}

function ThumbnailFallback({ title, categorySlug, className }: { title: string; categorySlug?: string; className?: string }) {
  const plate = PLATES[hashToIndex(title, PLATES.length)];
  const Icon = (categorySlug && CATEGORY_ICONS[categorySlug]) || BookOpen;

  return (
    <div
      className={cn("bg-grain group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-t-xl", className)}
      style={{ backgroundColor: plate }}
    >
      <Icon
        className="h-11 w-11 text-white/85 transition-transform duration-500 ease-out group-hover:scale-110"
        strokeWidth={1.25}
      />
      {categorySlug && (
        <span className="font-ui absolute bottom-3 left-3 rounded-sm bg-black/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/80 backdrop-blur-sm">
          {categorySlug.replace(/-/g, " ")}
        </span>
      )}
    </div>
  );
}

export function CourseThumbnail({
  title,
  categorySlug,
  thumbnailUrl,
  className,
}: {
  title: string;
  categorySlug?: string;
  thumbnailUrl?: string | null;
  className?: string;
}) {
  const [errored, setErrored] = React.useState(false);

  if (!thumbnailUrl || errored) {
    return <ThumbnailFallback title={title} categorySlug={categorySlug} className={className} />;
  }

  return (
    <div className={cn("group relative aspect-video w-full overflow-hidden rounded-t-xl bg-slate-100", className)}>
      <Image
        src={thumbnailUrl}
        alt={title}
        fill
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, 400px"
        onError={() => setErrored(true)}
      />
    </div>
  );
}
