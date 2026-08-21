"use client";

import * as React from "react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select, FieldError } from "@/components/ui/input";
import { createAnnouncementAction } from "@/actions/announcements";
import type { ActionState } from "@/actions/auth";

const initial: ActionState = { success: false };

export function AddAnnouncementButton({ courses }: { courses: { id: string; title: string }[] }) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction, pending] = useActionState(createAnnouncementAction, initial);

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      setOpen(false);
    } else if (state.message) toast.error(state.message);
  }, [state]);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> New Announcement
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Post Announcement" description="Notify all enrolled students in a course.">
        <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="a-course">Course</Label>
            <Select id="a-course" name="courseId" required>
              <option value="">Select course</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </Select>
            <FieldError messages={state.errors?.courseId} />
          </div>
          <div>
            <Label htmlFor="a-title">Title</Label>
            <Input id="a-title" name="title" required placeholder="e.g. Class rescheduled" />
            <FieldError messages={state.errors?.title} />
          </div>
          <div>
            <Label htmlFor="a-content">Message</Label>
            <Textarea id="a-content" name="content" rows={4} required placeholder="Tomorrow's class will start at 7:00 PM." />
            <FieldError messages={state.errors?.content} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={pending}>Post Announcement</Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
