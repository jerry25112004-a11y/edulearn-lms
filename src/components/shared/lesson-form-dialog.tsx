"use client";

import * as React from "react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select, FieldError } from "@/components/ui/input";
import { createLessonAction, updateLessonAction } from "@/actions/curriculum";
import type { ActionState } from "@/actions/auth";
import { Plus, Pencil } from "lucide-react";

const initial: ActionState = { success: false };

export type LessonValues = {
  id?: string;
  title: string;
  contentType: string;
  videoUrl?: string | null;
  textContent?: string | null;
  documentUrl?: string | null;
  externalUrl?: string | null;
  assignmentInstructions?: string | null;
  notes?: string | null;
  durationMinutes?: number | null;
};

function LessonForm({
  moduleId,
  lesson,
  onDone,
}: {
  moduleId: string;
  lesson?: LessonValues;
  onDone: () => void;
}) {
  const action = lesson ? updateLessonAction : createLessonAction;
  const [state, formAction, pending] = useActionState(action, initial);
  const [contentType, setContentType] = React.useState(lesson?.contentType ?? "VIDEO");

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      onDone();
    } else if (state.message) toast.error(state.message);
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form action={formAction} className="space-y-4">
      {lesson?.id ? <input type="hidden" name="id" value={lesson.id} /> : <input type="hidden" name="moduleId" value={moduleId} />}
      <div>
        <Label htmlFor="lesson-title">Lesson Title</Label>
        <Input id="lesson-title" name="title" defaultValue={lesson?.title} required />
        <FieldError messages={state.errors?.title} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="contentType">Content Type</Label>
          <Select id="contentType" name="contentType" value={contentType} onChange={(e) => setContentType(e.target.value)}>
            <option value="VIDEO">Video</option>
            <option value="TEXT">Text Content</option>
            <option value="DOCUMENT">PDF / Document</option>
            <option value="EXTERNAL_LINK">External Resource</option>
            <option value="ASSIGNMENT">Assignment</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="durationMinutes">Duration (minutes)</Label>
          <Input id="durationMinutes" name="durationMinutes" type="number" min={1} defaultValue={lesson?.durationMinutes ?? ""} />
        </div>
      </div>

      {contentType === "VIDEO" && (
        <div>
          <Label htmlFor="videoUrl">Video URL</Label>
          <Input id="videoUrl" name="videoUrl" defaultValue={lesson?.videoUrl ?? ""} placeholder="https://..." />
        </div>
      )}
      {contentType === "DOCUMENT" && (
        <div>
          <Label htmlFor="documentUrl">Document URL</Label>
          <Input id="documentUrl" name="documentUrl" defaultValue={lesson?.documentUrl ?? ""} placeholder="https://... .pdf" />
        </div>
      )}
      {contentType === "EXTERNAL_LINK" && (
        <div>
          <Label htmlFor="externalUrl">External Resource URL</Label>
          <Input id="externalUrl" name="externalUrl" defaultValue={lesson?.externalUrl ?? ""} placeholder="https://..." />
        </div>
      )}
      {contentType === "ASSIGNMENT" && (
        <div>
          <Label htmlFor="assignmentInstructions">Assignment Instructions</Label>
          <Textarea id="assignmentInstructions" name="assignmentInstructions" rows={3} defaultValue={lesson?.assignmentInstructions ?? ""} />
        </div>
      )}
      {contentType === "TEXT" && (
        <div>
          <Label htmlFor="textContent">Text Content</Label>
          <Textarea id="textContent" name="textContent" rows={5} defaultValue={lesson?.textContent ?? ""} />
        </div>
      )}
      <div>
        <Label htmlFor="notes">Instructor Notes (optional)</Label>
        <Textarea id="notes" name="notes" rows={2} defaultValue={lesson?.notes ?? ""} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onDone}>Cancel</Button>
        <Button type="submit" loading={pending}>{lesson ? "Save Changes" : "Add Lesson"}</Button>
      </div>
    </form>
  );
}

export function AddLessonButton({ moduleId }: { moduleId: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Plus className="h-3.5 w-3.5" /> Add Lesson
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Add Lesson">
        <LessonForm moduleId={moduleId} onDone={() => setOpen(false)} />
      </Dialog>
    </>
  );
}

export function EditLessonButton({ moduleId, lesson }: { moduleId: string; lesson: LessonValues }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-brand-600" title="Edit lesson">
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Edit Lesson">
        <LessonForm moduleId={moduleId} lesson={lesson} onDone={() => setOpen(false)} />
      </Dialog>
    </>
  );
}
