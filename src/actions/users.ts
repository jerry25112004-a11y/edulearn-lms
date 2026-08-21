"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/guard";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { logActivity } from "@/lib/db/activity";
import { createNotification } from "@/lib/db/notifications";
import {
  createStudentSchema,
  updateStudentSchema,
  createInstructorSchema,
  updateInstructorSchema,
} from "@/lib/validation/user";
import type { ActionState } from "./action-state";

export async function createStudentAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("SUPER_ADMIN");
  const parsed = createStudentSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    phone: formData.get("phone") || undefined,
  });
  if (!parsed.success) return { success: false, errors: parsed.error.flatten().fieldErrors };

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { success: false, errors: { email: ["A user with this email already exists"] } };

  const passwordHash = await hashPassword(parsed.data.password);
  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      passwordHash,
      role: "STUDENT",
      studentProfile: { create: {} },
    },
  });

  await logActivity(`Super Admin created student account "${parsed.data.name}"`);
  revalidatePath("/admin/students");
  return { success: true, message: "Student created successfully." };
}

export async function updateStudentAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("SUPER_ADMIN");
  const parsed = updateStudentSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    bio: formData.get("bio") || undefined,
  });
  if (!parsed.success) return { success: false, errors: parsed.error.flatten().fieldErrors };

  const { id, name, email, phone, bio } = parsed.data;
  await prisma.user.update({
    where: { id },
    data: {
      name,
      email,
      phone,
      studentProfile: { upsert: { create: { bio }, update: { bio } } },
    },
  });

  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${id}`);
  return { success: true, message: "Student updated successfully." };
}

export async function createInstructorAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("SUPER_ADMIN");
  const parsed = createInstructorSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    phone: formData.get("phone") || undefined,
    title: formData.get("title") || undefined,
    bio: formData.get("bio") || undefined,
    expertise: formData.get("expertise") || undefined,
  });
  if (!parsed.success) return { success: false, errors: parsed.error.flatten().fieldErrors };

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { success: false, errors: { email: ["A user with this email already exists"] } };

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      passwordHash,
      role: "INSTRUCTOR",
      instructorProfile: {
        create: { title: parsed.data.title, bio: parsed.data.bio, expertise: parsed.data.expertise },
      },
    },
  });

  await logActivity(`Super Admin created instructor account "${parsed.data.name}"`);
  await createNotification({
    userId: user.id,
    type: "SYSTEM",
    title: "Instructor account created",
    message: "Your instructor account has been set up. You can now create and manage courses.",
    link: "/instructor/dashboard",
  });
  revalidatePath("/admin/instructors");
  return { success: true, message: "Instructor created successfully." };
}

export async function updateInstructorAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("SUPER_ADMIN");
  const parsed = updateInstructorSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    title: formData.get("title") || undefined,
    bio: formData.get("bio") || undefined,
    expertise: formData.get("expertise") || undefined,
  });
  if (!parsed.success) return { success: false, errors: parsed.error.flatten().fieldErrors };

  const { id, name, email, phone, title, bio, expertise } = parsed.data;
  await prisma.user.update({
    where: { id },
    data: {
      name,
      email,
      phone,
      instructorProfile: {
        upsert: {
          create: { title, bio, expertise },
          update: { title, bio, expertise },
        },
      },
    },
  });

  revalidatePath("/admin/instructors");
  revalidatePath(`/admin/instructors/${id}`);
  return { success: true, message: "Instructor updated successfully." };
}

export async function toggleUserStatusAction(userId: string): Promise<ActionState> {
  await requireRole("SUPER_ADMIN");
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { success: false, message: "User not found." };

  const newStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
  await prisma.user.update({ where: { id: userId }, data: { status: newStatus } });

  await logActivity(`${user.name}'s account was ${newStatus === "ACTIVE" ? "activated" : "deactivated"}`);
  revalidatePath("/admin/students");
  revalidatePath("/admin/instructors");
  return { success: true, message: `Account ${newStatus === "ACTIVE" ? "activated" : "deactivated"}.` };
}

export async function deleteUserAction(userId: string): Promise<ActionState> {
  await requireRole("SUPER_ADMIN");
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { success: false, message: "User not found." };

  if (user.role === "INSTRUCTOR") {
    const courseCount = await prisma.course.count({ where: { instructorId: userId } });
    if (courseCount > 0) {
      return {
        success: false,
        message: "This instructor has courses assigned. Reassign or delete their courses first.",
      };
    }
  }

  await prisma.user.delete({ where: { id: userId } });
  await logActivity(`${user.name}'s account was deleted`);
  revalidatePath("/admin/students");
  revalidatePath("/admin/instructors");
  return { success: true, message: "Account deleted." };
}
