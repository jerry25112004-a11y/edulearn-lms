"use client";

import * as React from "react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, FieldError } from "@/components/ui/input";
import { createCategoryAction, updateCategoryAction } from "@/actions/categories";
import { Plus, Pencil } from "lucide-react";
import type { ActionState } from "@/actions/auth";

const initial: ActionState = { success: false };

type Category = { id: string; name: string; description: string | null; icon: string | null };

function CategoryForm({
  action,
  category,
  onDone,
}: {
  action: typeof createCategoryAction;
  category?: Category;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, initial);
  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      onDone();
    } else if (state.message) toast.error(state.message);
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form action={formAction} className="space-y-4">
      {category && <input type="hidden" name="id" value={category.id} />}
      <div>
        <Label htmlFor="cat-name">Category Name</Label>
        <Input id="cat-name" name="name" defaultValue={category?.name} required />
        <FieldError messages={state.errors?.name} />
      </div>
      <div>
        <Label htmlFor="cat-desc">Description</Label>
        <Textarea id="cat-desc" name="description" defaultValue={category?.description ?? ""} rows={3} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onDone}>Cancel</Button>
        <Button type="submit" loading={pending}>{category ? "Save Changes" : "Create Category"}</Button>
      </div>
    </form>
  );
}

export function AddCategoryButton() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Add Category
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Add Category" description="Create a new course category.">
        <CategoryForm action={createCategoryAction} onDone={() => setOpen(false)} />
      </Dialog>
    </>
  );
}

export function EditCategoryButton({ category }: { category: Category }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand-600" title="Edit">
        <Pencil className="h-4 w-4" />
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Edit Category" description="Update category details.">
        <CategoryForm action={updateCategoryAction} category={category} onDone={() => setOpen(false)} />
      </Dialog>
    </>
  );
}
