"use client";

import * as React from "react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, FieldError } from "@/components/ui/input";
import { createInstructorAction, updateInstructorAction } from "@/actions/users";
import { initialActionState as usersInitialState } from "@/actions/action-state";
import { Plus, Pencil } from "lucide-react";

type Instructor = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  instructorProfile: { bio: string | null; title: string | null; expertise: string | null } | null;
};

function CreateForm({ onDone }: { onDone: () => void }) {
  const [state, formAction, pending] = useActionState(createInstructorAction, usersInitialState);
  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      onDone();
    } else if (state.message) toast.error(state.message);
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" required />
          <FieldError messages={state.errors?.name} />
        </div>
        <div className="col-span-2">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" name="email" type="email" required />
          <FieldError messages={state.errors?.email} />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" />
        </div>
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" placeholder="Senior Instructor" />
        </div>
        <div className="col-span-2">
          <Label htmlFor="expertise">Expertise</Label>
          <Input id="expertise" name="expertise" placeholder="Web Development, React" />
        </div>
        <div className="col-span-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" name="bio" rows={3} />
        </div>
        <div className="col-span-2">
          <Label htmlFor="password">Temporary Password</Label>
          <Input id="password" name="password" type="password" required />
          <FieldError messages={state.errors?.password} />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onDone}>Cancel</Button>
        <Button type="submit" loading={pending}>Create Instructor</Button>
      </div>
    </form>
  );
}

function EditForm({ instructor, onDone }: { instructor: Instructor; onDone: () => void }) {
  const [state, formAction, pending] = useActionState(updateInstructorAction, usersInitialState);
  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      onDone();
    } else if (state.message) toast.error(state.message);
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={instructor.id} />
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="e-name">Full Name</Label>
          <Input id="e-name" name="name" defaultValue={instructor.name} required />
          <FieldError messages={state.errors?.name} />
        </div>
        <div className="col-span-2">
          <Label htmlFor="e-email">Email Address</Label>
          <Input id="e-email" name="email" type="email" defaultValue={instructor.email} required />
          <FieldError messages={state.errors?.email} />
        </div>
        <div>
          <Label htmlFor="e-phone">Phone</Label>
          <Input id="e-phone" name="phone" defaultValue={instructor.phone ?? ""} />
        </div>
        <div>
          <Label htmlFor="e-title">Title</Label>
          <Input id="e-title" name="title" defaultValue={instructor.instructorProfile?.title ?? ""} />
        </div>
        <div className="col-span-2">
          <Label htmlFor="e-expertise">Expertise</Label>
          <Input id="e-expertise" name="expertise" defaultValue={instructor.instructorProfile?.expertise ?? ""} />
        </div>
        <div className="col-span-2">
          <Label htmlFor="e-bio">Bio</Label>
          <Textarea id="e-bio" name="bio" rows={3} defaultValue={instructor.instructorProfile?.bio ?? ""} />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onDone}>Cancel</Button>
        <Button type="submit" loading={pending}>Save Changes</Button>
      </div>
    </form>
  );
}

export function AddInstructorButton() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Add Instructor
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Add New Instructor" description="Create a new instructor account.">
        <CreateForm onDone={() => setOpen(false)} />
      </Dialog>
    </>
  );
}

export function EditInstructorButton({ instructor }: { instructor: Instructor }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand-600" title="Edit">
        <Pencil className="h-4 w-4" />
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Edit Instructor" description="Update instructor information.">
        <EditForm instructor={instructor} onDone={() => setOpen(false)} />
      </Dialog>
    </>
  );
}
