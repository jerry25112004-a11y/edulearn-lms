"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown, LogOut, User } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { logoutAction } from "@/actions/auth";

export function UserMenu({
  name,
  email,
  avatarUrl,
  profileHref,
}: {
  name: string;
  email: string;
  avatarUrl?: string | null;
  profileHref: string;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 rounded-xl p-1 transition-colors hover:bg-brand-50">
        <Avatar name={name} src={avatarUrl} size="sm" />
        <span className="hidden text-left text-sm sm:block">
          <span className="block font-medium text-slate-900">{name}</span>
        </span>
        <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
      </button>
      {open && (
        <div className="animate-panel-in absolute right-0 top-11 z-50 w-56 rounded-2xl border border-slate-200 bg-white p-1 shadow-soft-lg">
          <div className="border-b border-slate-100 px-3 py-2">
            <p className="text-sm font-medium text-slate-900">{name}</p>
            <p className="truncate text-xs text-slate-500">{email}</p>
          </div>
          <Link
            href={profileHref}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <User className="h-4 w-4" /> My Profile
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50">
              <LogOut className="h-4 w-4" /> Log Out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
