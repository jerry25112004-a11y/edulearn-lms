"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";

export type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
};

function NavLinks({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1 px-3">
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "font-ui group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150",
              active ? "bg-brand-700 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <span
              className={cn(
                "flex h-4.5 w-4.5 shrink-0 [&>svg]:h-4.5 [&>svg]:w-4.5",
                active ? "text-white" : "text-slate-400 group-hover:text-slate-600"
              )}
            >
              {item.icon}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardSidebar({ items, roleLabel }: { items: NavItem[]; roleLabel: string }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <div className="flex h-16 items-center border-b border-slate-100 px-5">
          <Logo />
        </div>
        <div className="px-5 py-3">
          <span className="font-ui inline-flex rounded-sm bg-brand-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand-700 ring-1 ring-inset ring-brand-200">
            {roleLabel}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          <NavLinks items={items} />
        </div>
      </aside>

      {/* Mobile top bar trigger */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-brand-700 text-white shadow-soft-lg lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="animate-overlay-in absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="animate-panel-in absolute left-0 top-0 flex h-full w-72 flex-col bg-white shadow-soft-lg">
            <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
              <Logo />
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-5 py-3">
              <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {roleLabel}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              <NavLinks items={items} onNavigate={() => setOpen(false)} />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
