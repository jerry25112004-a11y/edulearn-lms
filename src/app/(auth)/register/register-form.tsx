"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { registerAction } from "@/actions/auth";
import { initialActionState } from "@/actions/action-state";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialActionState);

  useEffect(() => {
    if (state.message && !state.success) toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" name="name" placeholder="Jane Doe" required autoComplete="name" />
        <FieldError messages={state.errors?.name} />
      </div>
      <div>
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" />
        <FieldError messages={state.errors?.email} />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" placeholder="At least 8 characters" required autoComplete="new-password" />
        <FieldError messages={state.errors?.password} />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Re-enter your password" required autoComplete="new-password" />
        <FieldError messages={state.errors?.confirmPassword} />
      </div>
      <Button type="submit" className="w-full" size="lg" loading={pending}>
        Create Account
      </Button>
    </form>
  );
}
