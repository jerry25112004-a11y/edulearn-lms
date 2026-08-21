"use client";

import * as React from "react";
import { toast } from "sonner";
import { Power, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { toggleUserStatusAction, deleteUserAction } from "@/actions/users";

export function UserRowActions({
  userId,
  status,
  viewHref,
  editButton,
}: {
  userId: string;
  status: "ACTIVE" | "INACTIVE";
  viewHref: string;
  editButton?: React.ReactNode;
}) {
  const confirm = useConfirm();
  const [pending, startTransition] = React.useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleUserStatusAction(userId);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Delete this account?",
      description: "This action cannot be undone. All associated data may be affected.",
      confirmLabel: "Delete",
    });
    if (!ok) return;
    startTransition(async () => {
      const result = await deleteUserAction(userId);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  };

  return (
    <div className="flex items-center gap-1">
      <Link href={viewHref} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand-600" title="View">
        <Eye className="h-4 w-4" />
      </Link>
      {editButton}
      <button
        onClick={handleToggle}
        disabled={pending}
        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-amber-600 disabled:opacity-50"
        title={status === "ACTIVE" ? "Deactivate" : "Activate"}
      >
        <Power className="h-4 w-4" />
      </button>
      <button
        onClick={handleDelete}
        disabled={pending}
        className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
