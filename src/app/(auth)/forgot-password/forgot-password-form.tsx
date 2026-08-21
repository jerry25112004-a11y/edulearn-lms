"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { forgotPasswordAction } from "@/actions/auth";
import { initialActionState } from "@/actions/action-state";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, initialActionState);

  useEffect(() => {
    if (state.message) {
      if (state.success) toast.success(state.message);
      else toast.error(state.message);
    }
  }, [state]);

  if (state.success) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-slate-600">{state.message}</p>
        {state.devResetLink && (
          <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 p-3 text-left text-xs text-amber-800">
            <p className="font-semibold">Development mode — no email provider configured</p>
            <p className="mt-1 break-all">
              Reset link:{" "}
              <a href={state.devResetLink} className="underline">
                {state.devResetLink}
              </a>
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" />
        <FieldError messages={state.errors?.email} />
      </div>
      <Button type="submit" className="w-full" size="lg" loading={pending}>
        Send Reset Link
      </Button>
    </form>
  );
}
