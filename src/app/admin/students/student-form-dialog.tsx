"use client";

import * as React from "react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, FieldError } from "@/components/ui/input";
import { createStudentAction, updateStudentAction } from "@/actions/users";
import { initialActionState as usersInitialState } from "@/actions/action-state";
import { Plus, Pencil } from "lucide-react";

type Student = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  studentProfile: { bio: string | null } | null;
};

function CreateForm({ onDone }: { onDone: () => void }) {
  const [state, formAction, pending] = useActionState(createStudentAction, usersInitialState);
  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      onDone();
    } else if (state.message) toast.error(state.message);
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" name="name" required />
        <FieldError messages={state.errors?.name} />
      </div>
      <div>
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" name="email" type="email" required />
        <FieldError messages={state.errors?.email} />
      </div>
      <div>
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input id="phone" name="phone" />
      </div>
      <div>
        <Label htmlFor="password">Temporary Password</Label>
        <Input id="password" name="password" type="password" required />
        <FieldError messages={state.errors?.password} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onDone}>Cancel</Button>
        <Button type="submit" loading={pending}>Create Student</Button>
      </div>
    </form>
  );
}

function EditForm({ student, onDone }: { student: Student; onDone: () => void }) {
  const [state, formAction, pending] = useActionState(updateStudentAction, usersInitialState);
  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      onDone();
    } else if (state.message) toast.error(state.message);
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={student.id} />
      <div>
        <Label htmlFor="edit-name">Full Name</Label>
        <Input id="edit-name" name="name" defaultValue={student.name} required />
        <FieldError messages={state.errors?.name} />
      </div>
      <div>
        <Label htmlFor="edit-email">Email Address</Label>
        <Input id="edit-email" name="email" type="email" defaultValue={student.email} required />
        <FieldError messages={state.errors?.email} />
      </div>
      <div>
        <Label htmlFor="edit-phone">Phone</Label>
        <Input id="edit-phone" name="phone" defaultValue={student.phone ?? ""} />
      </div>
      <div>
        <Label htmlFor="edit-bio">Bio</Label>
        <Textarea id="edit-bio" name="bio" defaultValue={student.studentProfile?.bio ?? ""} rows={3} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onDone}>Cancel</Button>
        <Button type="submit" loading={pending}>Save Changes</Button>
      </div>
    </form>
  );
}

export function AddStudentButton() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Add Student
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Add New Student" description="Create a new student account.">
        <CreateForm onDone={() => setOpen(false)} />
      </Dialog>
    </>
  );
}

export function EditStudentButton({ student }: { student: Student }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand-600" title="Edit">
        <Pencil className="h-4 w-4" />
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Edit Student" description="Update student information.">
        <EditForm student={student} onDone={() => setOpen(false)} />
      </Dialog>
    </>
  );
}
