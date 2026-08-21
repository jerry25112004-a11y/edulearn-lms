"use client";

import * as React from "react";
import { toast } from "sonner";
import { Check, X, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { formatDate, timeAgo } from "@/lib/utils";
import { approveEnrollmentAction, rejectEnrollmentAction, removeEnrollmentAction } from "@/actions/enrollment";
import { Users } from "lucide-react";

export type CourseEnrollmentRow = {
  id: string;
  status: string;
  progressPercent: number;
  requestedAt: string;
  lastActivityAt: string | null;
  student: { id: string; name: string; email: string; avatarUrl: string | null };
};

export function CourseStudentsTable({
  enrollments,
  actorRole,
}: {
  enrollments: CourseEnrollmentRow[];
  actorRole: "SUPER_ADMIN" | "INSTRUCTOR";
}) {
  const confirm = useConfirm();
  const [pending, startTransition] = React.useTransition();

  if (enrollments.length === 0) {
    return <EmptyState icon={Users} title="No students yet" description="Students will appear here once they enroll or are added to this course." />;
  }

  const handleApprove = (id: string) => {
    startTransition(async () => {
      const r = await approveEnrollmentAction(id, actorRole);
      if (r.success) toast.success(r.message);
      else toast.error(r.message);
    });
  };

  const handleReject = (id: string) => {
    startTransition(async () => {
      const r = await rejectEnrollmentAction(id, actorRole);
      if (r.success) toast.success(r.message);
      else toast.error(r.message);
    });
  };

  const handleRemove = async (id: string) => {
    const ok = await confirm({ title: "Remove this student from the course?", confirmLabel: "Remove" });
    if (!ok) return;
    startTransition(async () => {
      const r = await removeEnrollmentAction(id, actorRole);
      if (r.success) toast.success(r.message);
      else toast.error(r.message);
    });
  };

  return (
    <Table>
      <THead>
        <TR>
          <TH>Student</TH>
          <TH>Status</TH>
          <TH>Progress</TH>
          <TH>Enrolled</TH>
          <TH>Last Activity</TH>
          <TH>Actions</TH>
        </TR>
      </THead>
      <TBody>
        {enrollments.map((e) => (
          <TR key={e.id}>
            <TD>
              <div className="flex items-center gap-3">
                <Avatar name={e.student.name} src={e.student.avatarUrl} size="sm" />
                <div>
                  <p className="font-medium text-slate-900">{e.student.name}</p>
                  <p className="text-xs text-slate-500">{e.student.email}</p>
                </div>
              </div>
            </TD>
            <TD><StatusBadge status={e.status} /></TD>
            <TD className="w-40"><ProgressBar value={e.progressPercent} showLabel /></TD>
            <TD className="whitespace-nowrap text-sm text-slate-500">{formatDate(e.requestedAt)}</TD>
            <TD className="whitespace-nowrap text-sm text-slate-500">{e.lastActivityAt ? timeAgo(e.lastActivityAt) : "—"}</TD>
            <TD>
              {e.status === "PENDING" ? (
                <div className="flex items-center gap-1">
                  <button disabled={pending} onClick={() => handleApprove(e.id)} className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50" title="Approve">
                    <Check className="h-4 w-4" />
                  </button>
                  <button disabled={pending} onClick={() => handleReject(e.id)} className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50" title="Reject">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button disabled={pending} onClick={() => handleRemove(e.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600" title="Remove">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </TD>
          </TR>
        ))}
      </TBody>
    </Table>
  );
}
