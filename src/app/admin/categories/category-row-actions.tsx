"use client";

import * as React from "react";
import { toast } from "sonner";
import { Power, Trash2 } from "lucide-react";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { toggleCategoryStatusAction, deleteCategoryAction } from "@/actions/categories";

export function CategoryRowActions({ id, status, courseCount }: { id: string; status: string; courseCount: number }) {
  const confirm = useConfirm();
  const [pending, startTransition] = React.useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleCategoryStatusAction(id);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  };

  const handleDelete = async () => {
    if (courseCount > 0) {
      toast.error("Reassign or delete courses in this category before deleting it.");
      return;
    }
    const ok = await confirm({
      title: "Delete this category?",
      description: "This action cannot be undone.",
      confirmLabel: "Delete",
    });
    if (!ok) return;
    startTransition(async () => {
      const result = await deleteCategoryAction(id);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  };

  return (
    <div className="flex items-center gap-1">
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
