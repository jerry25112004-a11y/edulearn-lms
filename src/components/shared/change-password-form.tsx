"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { changePasswordAction } from "@/actions/profile";
import type { ActionState } from "@/actions/auth";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initial: ActionState = { success: false };

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, initial);

  useEffect(() => {
    if (state.message) {
      if (state.success) toast.success(state.message);
      else if (!state.errors) toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-4" key={state.success ? "done" : "form"}>
      <div>
        <Label htmlFor="currentPassword">Current Password</Label>
        <Input id="currentPassword" name="currentPassword" type="password" required />
        <FieldError messages={state.errors?.currentPassword} />
      </div>
      <div>
        <Label htmlFor="newPassword">New Password</Label>
        <Input id="newPassword" name="newPassword" type="password" required />
        <FieldError messages={state.errors?.newPassword} />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" required />
        <FieldError messages={state.errors?.confirmPassword} />
      </div>
      <Button type="submit" loading={pending}>Update Password</Button>
    </form>
  );
}
