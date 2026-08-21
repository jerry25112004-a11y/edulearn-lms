"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { deleteCourseAction, updateCourseStatusAction } from "@/actions/courses";
import { Select } from "@/components/ui/input";

export function CourseRowActions({
  courseId,
  status,
  manageHref,
  editHref,
}: {
  courseId: string;
  status: string;
  manageHref: string;
  editHref: string;
}) {
  const confirm = useConfirm();
  const [pending, startTransition] = React.useTransition();

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Delete this course?",
      description: "This will permanently delete the course, its modules, lessons, and enrollment records.",
      confirmLabel: "Delete",
    });
    if (!ok) return;
    startTransition(async () => {
      const result = await deleteCourseAction(courseId);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  };

  const handleStatusChange = (newStatus: string) => {
    startTransition(async () => {
      const result = await updateCourseStatusAction(courseId, newStatus);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  };

  return (
    <div className="flex items-center gap-1">
      <Select
        aria-label="Change status"
        defaultValue={status}
        disabled={pending}
        onChange={(e) => handleStatusChange(e.target.value)}
        className="h-8 w-28 text-xs"
      >
        <option value="DRAFT">Draft</option>
        <option value="ACTIVE">Active</option>
        <option value="INACTIVE">Inactive</option>
        <option value="COMPLETED">Completed</option>
      </Select>
      <Link href={manageHref} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand-600" title="Manage">
        <Eye className="h-4 w-4" />
      </Link>
      <Link href={editHref} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand-600" title="Edit">
        <Pencil className="h-4 w-4" />
      </Link>
      <button onClick={handleDelete} disabled={pending} className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50" title="Delete">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
