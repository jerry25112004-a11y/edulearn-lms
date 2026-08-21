"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/guard";
import { prisma } from "@/lib/db/prisma";
import { slugify } from "@/lib/utils";
import { logActivity } from "@/lib/db/activity";
import { courseSchema } from "@/lib/validation/course";
import type { ActionState } from "./auth";
import type { Role } from "@prisma/client";

function parseList(text?: string) {
  if (!text) return [];
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function uniqueSlug(title: string, excludeId?: string) {
  const base = slugify(title);
  let slug = base;
  let i = 1;
  while (await prisma.course.findFirst({ where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) } })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

export async function createCourseAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireRole(["SUPER_ADMIN", "INSTRUCTOR"]);
  const redirectTo = formData.get("redirectTo") as string | null;
  const parsed = courseSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    categoryId: formData.get("categoryId"),
    instructorId: formData.get("instructorId") || undefined,
    level: formData.get("level"),
    duration: formData.get("duration"),
    objectives: formData.get("objectives") || undefined,
    requirements: formData.get("requirements") || undefined,
    thumbnailUrl: formData.get("thumbnailUrl") || undefined,
    status: formData.get("status") || undefined,
  });
  if (!parsed.success) return { success: false, errors: parsed.error.flatten().fieldErrors };

  const instructorId = session.role === "INSTRUCTOR" ? session.userId : parsed.data.instructorId;
  if (!instructorId) return { success: false, errors: { instructorId: ["Select an instructor"] } };

  const slug = await uniqueSlug(parsed.data.title);
  const course = await prisma.course.create({
    data: {
      title: parsed.data.title,
      slug,
      description: parsed.data.description,
      categoryId: parsed.data.categoryId,
      instructorId,
      level: parsed.data.level,
      duration: parsed.data.duration,
      objectives: parseList(parsed.data.objectives),
      requirements: parseList(parsed.data.requirements),
      thumbnailUrl: parsed.data.thumbnailUrl || null,
      status: parsed.data.status ?? "DRAFT",
    },
  });

  await logActivity(`Course "${course.title}" was created`, session.userId);
  revalidatePath("/admin/courses");
  revalidatePath("/instructor/courses");
  if (redirectTo) redirect(`${redirectTo}/${course.id}`);
  return { success: true, message: "Course created successfully.", id: course.id };
}

export async function updateCourseAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireRole(["SUPER_ADMIN", "INSTRUCTOR"]);
  const id = formData.get("id") as string;
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) return { success: false, message: "Course not found." };
  if (session.role === "INSTRUCTOR" && course.instructorId !== session.userId) {
    return { success: false, message: "You can only edit your own courses." };
  }

  const parsed = courseSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    categoryId: formData.get("categoryId"),
    instructorId: formData.get("instructorId") || undefined,
    level: formData.get("level"),
    duration: formData.get("duration"),
    objectives: formData.get("objectives") || undefined,
    requirements: formData.get("requirements") || undefined,
    thumbnailUrl: formData.get("thumbnailUrl") || undefined,
    status: formData.get("status") || undefined,
  });
  if (!parsed.success) return { success: false, errors: parsed.error.flatten().fieldErrors };

  const instructorId = session.role === "INSTRUCTOR" ? course.instructorId : parsed.data.instructorId || course.instructorId;
  const slug = parsed.data.title !== course.title ? await uniqueSlug(parsed.data.title, id) : course.slug;

  await prisma.course.update({
    where: { id },
    data: {
      title: parsed.data.title,
      slug,
      description: parsed.data.description,
      categoryId: parsed.data.categoryId,
      instructorId,
      level: parsed.data.level,
      duration: parsed.data.duration,
      objectives: parseList(parsed.data.objectives),
      requirements: parseList(parsed.data.requirements),
      thumbnailUrl: parsed.data.thumbnailUrl || null,
      status: parsed.data.status ?? course.status,
    },
  });

  revalidatePath("/admin/courses");
  revalidatePath("/instructor/courses");
  revalidatePath(`/courses/${slug}`);
  return { success: true, message: "Course updated successfully." };
}

export async function updateCourseStatusAction(courseId: string, status: string): Promise<ActionState> {
  const session = await requireRole(["SUPER_ADMIN", "INSTRUCTOR"]);
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return { success: false, message: "Course not found." };
  if (session.role === "INSTRUCTOR" && course.instructorId !== session.userId) {
    return { success: false, message: "You can only manage your own courses." };
  }

  await prisma.course.update({
    where: { id: courseId },
    data: { status: status as "DRAFT" | "ACTIVE" | "INACTIVE" | "COMPLETED" },
  });
  await logActivity(`Course "${course.title}" status changed to ${status}`, session.userId);
  revalidatePath("/admin/courses");
  revalidatePath("/instructor/courses");
  return { success: true, message: "Course status updated." };
}

export async function deleteCourseAction(courseId: string, redirectTo?: string): Promise<ActionState> {
  const session = await requireRole(["SUPER_ADMIN", "INSTRUCTOR"]);
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return { success: false, message: "Course not found." };
  if (session.role === "INSTRUCTOR" && course.instructorId !== session.userId) {
    return { success: false, message: "You can only delete your own courses." };
  }

  await prisma.course.delete({ where: { id: courseId } });
  await logActivity(`Course "${course.title}" was deleted`, session.userId);
  revalidatePath("/admin/courses");
  revalidatePath("/instructor/courses");
  if (redirectTo) redirect(redirectTo);
  return { success: true, message: "Course deleted." };
}

export async function reassignInstructorAction(courseId: string, instructorId: string): Promise<ActionState> {
  await requireRole("SUPER_ADMIN" as Role);
  await prisma.course.update({ where: { id: courseId }, data: { instructorId } });
  revalidatePath("/admin/courses");
  return { success: true, message: "Instructor reassigned." };
}
