"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/guard";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { updateProfileSchema, changePasswordSchema } from "@/lib/validation/user";
import { createSession } from "@/lib/auth/session";
import type { ActionState } from "./auth";

export async function updateProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireUser();
  const parsed = updateProfileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    bio: formData.get("bio") || undefined,
    title: formData.get("title") || undefined,
    expertise: formData.get("expertise") || undefined,
  });
  if (!parsed.success) return { success: false, errors: parsed.error.flatten().fieldErrors };

  const { name, phone, bio, title, expertise } = parsed.data;

  await prisma.user.update({ where: { id: session.userId }, data: { name, phone } });

  if (session.role === "STUDENT") {
    await prisma.studentProfile.upsert({
      where: { userId: session.userId },
      create: { userId: session.userId, bio },
      update: { bio },
    });
  } else if (session.role === "INSTRUCTOR") {
    await prisma.instructorProfile.upsert({
      where: { userId: session.userId },
      create: { userId: session.userId, bio, title, expertise },
      update: { bio, title, expertise },
    });
  }

  // refresh session cookie with updated name
  await createSession({ ...session, name });

  revalidatePath("/admin/profile");
  revalidatePath("/instructor/profile");
  revalidatePath("/student/profile");
  return { success: true, message: "Profile updated successfully." };
}

export async function changePasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireUser();
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { success: false, errors: parsed.error.flatten().fieldErrors };

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return { success: false, message: "User not found." };

  const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!valid) return { success: false, errors: { currentPassword: ["Current password is incorrect"] } };

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({ where: { id: session.userId }, data: { passwordHash } });

  return { success: true, message: "Password changed successfully." };
}
