"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { loginAction } from "@/actions/auth";
import { initialActionState } from "@/actions/action-state";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialActionState);

  useEffect(() => {
    if (state.message && !state.success) toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" />
        <FieldError messages={state.errors?.email} />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link href="/forgot-password" className="text-xs font-medium text-brand-600 hover:text-brand-700">
            Forgot password?
          </Link>
        </div>
        <Input id="password" name="password" type="password" placeholder="••••••••" required autoComplete="current-password" />
        <FieldError messages={state.errors?.password} />
      </div>
      <Button type="submit" className="w-full" size="lg" loading={pending}>
        Log In
      </Button>
    </form>
  );
}
