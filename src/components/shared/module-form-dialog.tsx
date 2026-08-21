"use client";

import * as React from "react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, FieldError } from "@/components/ui/input";
import { createModuleAction, updateModuleAction } from "@/actions/curriculum";
import type { ActionState } from "@/actions/auth";
import { Plus, Pencil } from "lucide-react";

const initial: ActionState = { success: false };

function ModuleForm({
  courseId,
  module,
  onDone,
}: {
  courseId: string;
  module?: { id: string; title: string; description: string | null };
  onDone: () => void;
}) {
  const action = module ? updateModuleAction : createModuleAction;
  const [state, formAction, pending] = useActionState(action, initial);

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      onDone();
    } else if (state.message) toast.error(state.message);
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form action={formAction} className="space-y-4">
      {module?.id ? <input type="hidden" name="id" value={module.id} /> : <input type="hidden" name="courseId" value={courseId} />}
      <div>
        <Label htmlFor="mod-title">Module Title</Label>
        <Input id="mod-title" name="title" defaultValue={module?.title} required placeholder="e.g. Module 1: HTML & CSS" />
        <FieldError messages={state.errors?.title} />
      </div>
      <div>
        <Label htmlFor="mod-desc">Description (optional)</Label>
        <Textarea id="mod-desc" name="description" defaultValue={module?.description ?? ""} rows={3} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onDone}>Cancel</Button>
        <Button type="submit" loading={pending}>{module ? "Save Changes" : "Add Module"}</Button>
      </div>
    </form>
  );
}

export function AddModuleButton({ courseId }: { courseId: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Add Module
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Add Module">
        <ModuleForm courseId={courseId} onDone={() => setOpen(false)} />
      </Dialog>
    </>
  );
}

export function EditModuleButton({ courseId, module }: { courseId: string; module: { id: string; title: string; description: string | null } }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600" title="Edit module">
        <Pencil className="h-4 w-4" />
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Edit Module">
        <ModuleForm courseId={courseId} module={module} onDone={() => setOpen(false)} />
      </Dialog>
    </>
  );
}
