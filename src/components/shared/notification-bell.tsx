"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, Check } from "lucide-react";
import { cn, timeAgo } from "@/lib/utils";
import { markNotificationReadAction, markAllNotificationsReadAction } from "@/actions/notifications";

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

export function NotificationBell({
  initialNotifications,
  unreadCount,
}: {
  initialNotifications: NotificationItem[];
  unreadCount: number;
}) {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState(initialNotifications);
  const [count, setCount] = React.useState(unreadCount);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleMarkAll = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setCount(0);
    await markAllNotificationsReadAction();
  };

  const handleItemClick = async (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setCount((c) => Math.max(0, c - 1));
    await markNotificationReadAction(id);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-brand-50 hover:text-brand-600"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white shadow-sm">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>
      {open && (
        <div className="animate-panel-in absolute right-0 top-11 z-50 w-80 rounded-2xl border border-slate-200 bg-white shadow-soft-lg">
          <div className="flex items-center justify-between border-b border-slate-100 p-3">
            <p className="text-sm font-semibold text-slate-900">Notifications</p>
            {count > 0 && (
              <button onClick={handleMarkAll} className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700">
                <Check className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="p-6 text-center text-sm text-slate-400">No notifications yet</p>
            ) : (
              items.map((n) => (
                <Link
                  key={n.id}
                  href={n.link ?? "#"}
                  onClick={() => handleItemClick(n.id)}
                  className={cn(
                    "block border-b border-slate-50 p-3 text-sm hover:bg-slate-50",
                    !n.isRead && "bg-brand-50/50"
                  )}
                >
                  <div className="flex items-start gap-2">
                    {!n.isRead && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />}
                    <div className={cn(n.isRead && "pl-3.5")}>
                      <p className="font-medium text-slate-900">{n.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{n.message}</p>
                      <p className="mt-1 text-[11px] text-slate-400">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
