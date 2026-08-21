"use client";

import * as React from "react";
import { toast } from "sonner";
import { Trash2, Megaphone } from "lucide-react";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { deleteAnnouncementAction } from "@/actions/announcements";
import { timeAgo } from "@/lib/utils";

export function AnnouncementRow({ id, title, content, courseTitle, createdAt }: { id: string; title: string; content: string; courseTitle: string; createdAt: string }) {
  const confirm = useConfirm();
  const [pending, startTransition] = React.useTransition();

  const handleDelete = async () => {
    const ok = await confirm({ title: "Delete this announcement?", confirmLabel: "Delete" });
    if (!ok) return;
    startTransition(async () => {
      const r = await deleteAnnouncementAction(id);
      if (r.success) toast.success(r.message);
      else toast.error(r.message);
    });
  };

  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <Megaphone className="h-4 w-4" />
        </div>
        <div>
          <p className="font-semibold text-slate-900">{title}</p>
          <p className="text-xs text-slate-500">{courseTitle} • {timeAgo(createdAt)}</p>
          <p className="mt-2 text-sm text-slate-600">{content}</p>
        </div>
      </div>
      <button disabled={pending} onClick={handleDelete} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
