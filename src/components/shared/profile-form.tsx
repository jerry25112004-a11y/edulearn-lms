"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { updateProfileAction } from "@/actions/profile";
import type { ActionState } from "@/actions/auth";
import { Input, Label, Textarea, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initial: ActionState = { success: false };

export function ProfileForm({
  role,
  name,
  email,
  phone,
  bio,
  title,
  expertise,
}: {
  role: "SUPER_ADMIN" | "INSTRUCTOR" | "STUDENT";
  name: string;
  email: string;
  phone?: string | null;
  bio?: string | null;
  title?: string | null;
  expertise?: string | null;
}) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initial);

  useEffect(() => {
    if (state.message) {
      if (state.success) toast.success(state.message);
      else toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" defaultValue={name} required />
          <FieldError messages={state.errors?.name} />
        </div>
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" value={email} disabled />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={phone ?? ""} />
        </div>
        {role === "INSTRUCTOR" && (
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={title ?? ""} placeholder="e.g. Senior Instructor" />
          </div>
        )}
      </div>
      {role === "INSTRUCTOR" && (
        <div>
          <Label htmlFor="expertise">Areas of Expertise</Label>
          <Input id="expertise" name="expertise" defaultValue={expertise ?? ""} placeholder="Web Development, React, Node.js" />
        </div>
      )}
      {(role === "INSTRUCTOR" || role === "STUDENT") && (
        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" name="bio" defaultValue={bio ?? ""} rows={4} />
        </div>
      )}
      <Button type="submit" loading={pending}>Save Profile</Button>
    </form>
  );
}
