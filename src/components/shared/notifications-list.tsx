"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, Check } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { cn, timeAgo } from "@/lib/utils";
import { markNotificationReadAction, markAllNotificationsReadAction } from "@/actions/notifications";

export function NotificationsList({
  notifications,
}: {
  notifications: { id: string; title: string; message: string; link: string | null; isRead: boolean; createdAt: string }[];
}) {
  const [items, setItems] = React.useState(notifications);
  const unread = items.filter((i) => !i.isRead).length;

  if (items.length === 0) {
    return <EmptyState icon={Bell} title="No notifications" description="You're all caught up." />;
  }

  return (
    <div>
      {unread > 0 && (
        <div className="mb-4 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
              await markAllNotificationsReadAction();
            }}
          >
            <Check className="h-4 w-4" /> Mark all as read
          </Button>
        </div>
      )}
      <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {items.map((n) => (
          <Link
            key={n.id}
            href={n.link ?? "#"}
            onClick={async () => {
              setItems((prev) => prev.map((i) => (i.id === n.id ? { ...i, isRead: true } : i)));
              await markNotificationReadAction(n.id);
            }}
            className={cn("flex items-start gap-3 p-4 hover:bg-slate-50", !n.isRead && "bg-brand-50/40")}
          >
            {!n.isRead && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />}
            <div className={cn(n.isRead && "pl-3.5")}>
              <p className="text-sm font-medium text-slate-900">{n.title}</p>
              <p className="mt-0.5 text-sm text-slate-500">{n.message}</p>
              <p className="mt-1 text-xs text-slate-400">{timeAgo(n.createdAt)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
