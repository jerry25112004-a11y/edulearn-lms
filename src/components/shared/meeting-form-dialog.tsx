"use client";

import * as React from "react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select, FieldError } from "@/components/ui/input";
import { createMeetingAction, updateMeetingAction } from "@/actions/meetings";
import type { ActionState } from "@/actions/auth";

const initial: ActionState = { success: false };

export type MeetingValues = {
  id?: string;
  courseId: string;
  title: string;
  description?: string | null;
  meetingLink: string;
  startTime: string;
  endTime: string;
};

function toDateInput(iso: string) {
  return iso.slice(0, 10);
}
function toTimeInput(iso: string) {
  return new Date(iso).toTimeString().slice(0, 5);
}

function MeetingForm({
  courses,
  meeting,
  onDone,
}: {
  courses: { id: string; title: string }[];
  meeting?: MeetingValues;
  onDone: () => void;
}) {
  const action = meeting ? updateMeetingAction : createMeetingAction;
  const [state, formAction, pending] = useActionState(action, initial);

  useEffect(() => {
    if (state.success) {
      toast.success(state.message ?? "Saved.");
      onDone();
    } else if (state.message) toast.error(state.message);
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form action={formAction} className="space-y-4">
      {meeting?.id && <input type="hidden" name="id" value={meeting.id} />}
      <div>
        <Label htmlFor="m-course">Course</Label>
        <Select id="m-course" name="courseId" defaultValue={meeting?.courseId} required>
          <option value="">Select course</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </Select>
        <FieldError messages={state.errors?.courseId} />
      </div>
      <div>
        <Label htmlFor="m-title">Meeting Title</Label>
        <Input id="m-title" name="title" defaultValue={meeting?.title} required placeholder="e.g. Week 3 Live Q&A" />
        <FieldError messages={state.errors?.title} />
      </div>
      <div>
        <Label htmlFor="m-desc">Description (optional)</Label>
        <Textarea id="m-desc" name="description" defaultValue={meeting?.description ?? ""} rows={2} />
      </div>
      <div>
        <Label htmlFor="m-link">Google Meet Link</Label>
        <Input id="m-link" name="meetingLink" defaultValue={meeting?.meetingLink} required placeholder="https://meet.google.com/xxx-xxxx-xxx" />
        <FieldError messages={state.errors?.meetingLink} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor="m-date">Date</Label>
          <Input id="m-date" name="date" type="date" defaultValue={meeting ? toDateInput(meeting.startTime) : undefined} required />
          <FieldError messages={state.errors?.date} />
        </div>
        <div>
          <Label htmlFor="m-start">Start Time</Label>
          <Input id="m-start" name="startTime" type="time" defaultValue={meeting ? toTimeInput(meeting.startTime) : undefined} required />
          <FieldError messages={state.errors?.startTime} />
        </div>
        <div>
          <Label htmlFor="m-end">End Time</Label>
          <Input id="m-end" name="endTime" type="time" defaultValue={meeting ? toTimeInput(meeting.endTime) : undefined} required />
          <FieldError messages={state.errors?.endTime} />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onDone}>Cancel</Button>
        <Button type="submit" loading={pending}>{meeting ? "Save Changes" : "Schedule Meeting"}</Button>
      </div>
    </form>
  );
}

export function AddMeetingButton({ courses }: { courses: { id: string; title: string }[] }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Schedule Meeting
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Schedule Online Class" description="Set up a live class with a Google Meet link.">
        <MeetingForm courses={courses} onDone={() => setOpen(false)} />
      </Dialog>
    </>
  );
}

export function EditMeetingButton({ courses, meeting }: { courses: { id: string; title: string }[]; meeting: MeetingValues }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand-600" title="Edit">
        <Pencil className="h-4 w-4" />
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Edit Meeting">
        <MeetingForm courses={courses} meeting={meeting} onDone={() => setOpen(false)} />
      </Dialog>
    </>
  );
}
