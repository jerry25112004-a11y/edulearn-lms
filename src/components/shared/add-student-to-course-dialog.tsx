"use client";

import * as React from "react";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { addStudentToCourseAction } from "@/actions/enrollment";

export function AddStudentToCourseDialog({ courseId, actorRole }: { courseId: string; actorRole: "SUPER_ADMIN" | "INSTRUCTOR" }) {
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [pending, startTransition] = React.useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await addStudentToCourseAction(courseId, email, actorRole);
      if (result.success) {
        toast.success(result.message);
        setOpen(false);
        setEmail("");
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <UserPlus className="h-4 w-4" /> Add Student
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Add Student to Course" description="Enter the student's registered email address.">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="student-email">Student Email</Label>
            <Input id="student-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="student@example.com" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={pending}>Add Student</Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
