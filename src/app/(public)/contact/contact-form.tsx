"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { contactAction } from "@/actions/contact";
import { initialActionState } from "@/actions/action-state";
import { Input, Textarea, Label, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ContactForm() {
  const [state, formAction, pending] = useActionState(contactAction, initialActionState);

  useEffect(() => {
    if (state.message) {
      if (state.success) toast.success(state.message);
      else toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-4" key={state.success ? "sent" : "form"}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" placeholder="Jane Doe" required />
          <FieldError messages={state.errors?.name} />
        </div>
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" name="email" type="email" placeholder="jane@example.com" required />
          <FieldError messages={state.errors?.email} />
        </div>
      </div>
      <div>
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" name="subject" placeholder="How can we help?" required />
        <FieldError messages={state.errors?.subject} />
      </div>
      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" rows={5} placeholder="Tell us more..." required />
        <FieldError messages={state.errors?.message} />
      </div>
      <Button type="submit" size="lg" loading={pending} className="w-full sm:w-auto">
        Send Message
      </Button>
    </form>
  );
}
