"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { resetPasswordAction } from "@/actions/auth";
import { initialActionState } from "@/actions/action-state";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialActionState);

  useEffect(() => {
    if (state.message) {
      if (state.success) toast.success(state.message);
      else toast.error(state.message);
    }
  }, [state]);

  if (state.success) {
    return (
      <div className="text-center">
        <p className="text-sm text-slate-600">{state.message}</p>
        <Link href="/login" className="mt-4 inline-block">
          <Button size="lg">Go to Log In</Button>
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div>
        <Label htmlFor="password">New Password</Label>
        <Input id="password" name="password" type="password" placeholder="At least 8 characters" required autoComplete="new-password" />
        <FieldError messages={state.errors?.password} />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Re-enter your new password" required autoComplete="new-password" />
        <FieldError messages={state.errors?.confirmPassword} />
      </div>
      {state.message && !state.success && <p className="text-sm text-rose-600">{state.message}</p>}
      <Button type="submit" className="w-full" size="lg" loading={pending}>
        Reset Password
      </Button>
    </form>
  );
}
