"use server";

import { z } from "zod";
import { logActivity } from "@/lib/db/activity";
import type { ActionState } from "./auth";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Enter a valid email address"),
  subject: z.string().trim().min(3, "Subject is required"),
  message: z.string().trim().min(10, "Message must be at least 10 characters"),
});

export async function contactAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, subject, message } = parsed.data;

  // No email/helpdesk provider is configured for this project. In production
  // this would forward to a support inbox or ticketing system. For now the
  // inquiry is recorded in the activity log so admins can see it, and logged
  // to the server console.
  console.log(`[contact] New inquiry from ${name} <${email}> — ${subject}: ${message}`);
  await logActivity(`Contact form submission from ${name} (${email}): "${subject}"`);

  return { success: true, message: "Thanks for reaching out! We'll get back to you soon." };
}
