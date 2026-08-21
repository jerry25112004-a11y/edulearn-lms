"use client";

import * as React from "react";
import { toast } from "sonner";
import { ExternalLink, Trash2, Ban } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { formatDate, formatTime } from "@/lib/utils";
import { cancelMeetingAction, deleteMeetingAction } from "@/actions/meetings";
import { EditMeetingButton, type MeetingValues } from "./meeting-form-dialog";
import { Video } from "lucide-react";

export type MeetingRow = MeetingValues & {
  id: string;
  status: string;
  effectiveStatus: string;
  courseName: string;
  instructorName?: string;
};

const STATUS_VARIANT: Record<string, "brand" | "danger" | "info" | "default"> = {
  UPCOMING: "brand",
  LIVE: "danger",
  COMPLETED: "info",
  CANCELLED: "default",
};

export function MeetingList({
  meetings,
  courses,
  canManage,
  showJoin = true,
}: {
  meetings: MeetingRow[];
  courses: { id: string; title: string }[];
  canManage: boolean;
  showJoin?: boolean;
}) {
  const confirm = useConfirm();
  const [pending, startTransition] = React.useTransition();

  if (meetings.length === 0) {
    return <EmptyState icon={Video} title="No meetings scheduled" description="Scheduled classes will appear here." />;
  }

  const handleCancel = (id: string) => {
    startTransition(async () => {
      const r = await cancelMeetingAction(id);
      if (r.success) toast.success(r.message);
      else toast.error(r.message);
    });
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({ title: "Delete this meeting?", confirmLabel: "Delete" });
    if (!ok) return;
    startTransition(async () => {
      const r = await deleteMeetingAction(id);
      if (r.success) toast.success(r.message);
      else toast.error(r.message);
    });
  };

  return (
    <div className="space-y-3">
      {meetings.map((m) => (
        <div key={m.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-slate-900">{m.title}</p>
              <Badge variant={STATUS_VARIANT[m.effectiveStatus] ?? "default"}>{m.effectiveStatus}</Badge>
            </div>
            <p className="mt-1 text-sm text-slate-500">{m.courseName}{m.instructorName ? ` • ${m.instructorName}` : ""}</p>
            <p className="mt-1 text-sm text-slate-500">
              {formatDate(m.startTime)} • {formatTime(m.startTime)} – {formatTime(m.endTime)}
            </p>
            {m.description && <p className="mt-1 text-sm text-slate-500">{m.description}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {showJoin && m.effectiveStatus !== "CANCELLED" && m.effectiveStatus !== "COMPLETED" && (
              <a href={m.meetingLink} target="_blank" rel="noopener noreferrer">
                <span className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand-600 px-3 text-sm font-medium text-white hover:bg-brand-700">
                  <ExternalLink className="h-3.5 w-3.5" /> Join Meeting
                </span>
              </a>
            )}
            {canManage && (
              <>
                <EditMeetingButton courses={courses} meeting={m} />
                {m.effectiveStatus !== "CANCELLED" && (
                  <button disabled={pending} onClick={() => handleCancel(m.id)} className="rounded-lg p-1.5 text-slate-500 hover:bg-amber-50 hover:text-amber-600" title="Cancel">
                    <Ban className="h-4 w-4" />
                  </button>
                )}
                <button disabled={pending} onClick={() => handleDelete(m.id)} className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600" title="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
