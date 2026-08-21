"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/guard";
import { prisma } from "@/lib/db/prisma";
import { moduleSchema, lessonSchema } from "@/lib/validation/course";
import { createNotificationsForMany } from "@/lib/db/notifications";
import type { ActionState } from "./auth";

async function assertOwnsCourse(courseId: string, userId: string, role: string) {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw new Error("Course not found");
  if (role === "INSTRUCTOR" && course.instructorId !== userId) {
    throw new Error("You can only manage your own courses");
  }
  return course;
}

async function assertOwnsModule(moduleId: string, userId: string, role: string) {
  const mod = await prisma.module.findUnique({ where: { id: moduleId }, include: { course: true } });
  if (!mod) throw new Error("Module not found");
  if (role === "INSTRUCTOR" && mod.course.instructorId !== userId) {
    throw new Error("You can only manage your own courses");
  }
  return mod;
}

async function assertOwnsLesson(lessonId: string, userId: string, role: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { include: { course: true } } },
  });
  if (!lesson) throw new Error("Lesson not found");
  if (role === "INSTRUCTOR" && lesson.module.course.instructorId !== userId) {
    throw new Error("You can only manage your own courses");
  }
  return lesson;
}

// ---------------- MODULES ----------------

export async function createModuleAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireRole(["SUPER_ADMIN", "INSTRUCTOR"]);
  const courseId = formData.get("courseId") as string;
  const parsed = moduleSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { success: false, errors: parsed.error.flatten().fieldErrors };

  try {
    await assertOwnsCourse(courseId, session.userId, session.role);
  } catch (e) {
    return { success: false, message: (e as Error).message };
  }

  const count = await prisma.module.count({ where: { courseId } });
  await prisma.module.create({ data: { courseId, ...parsed.data, order: count } });

  revalidatePath(`/instructor/courses/${courseId}`);
  revalidatePath(`/admin/courses/${courseId}`);
  return { success: true, message: "Module added." };
}

export async function updateModuleAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireRole(["SUPER_ADMIN", "INSTRUCTOR"]);
  const id = formData.get("id") as string;
  const parsed = moduleSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { success: false, errors: parsed.error.flatten().fieldErrors };

  let mod;
  try {
    mod = await assertOwnsModule(id, session.userId, session.role);
  } catch (e) {
    return { success: false, message: (e as Error).message };
  }

  await prisma.module.update({ where: { id }, data: parsed.data });
  revalidatePath(`/instructor/courses/${mod.courseId}`);
  revalidatePath(`/admin/courses/${mod.courseId}`);
  return { success: true, message: "Module updated." };
}

export async function deleteModuleAction(moduleId: string): Promise<ActionState> {
  const session = await requireRole(["SUPER_ADMIN", "INSTRUCTOR"]);
  let mod;
  try {
    mod = await assertOwnsModule(moduleId, session.userId, session.role);
  } catch (e) {
    return { success: false, message: (e as Error).message };
  }
  await prisma.module.delete({ where: { id: moduleId } });
  revalidatePath(`/instructor/courses/${mod.courseId}`);
  revalidatePath(`/admin/courses/${mod.courseId}`);
  return { success: true, message: "Module deleted." };
}

export async function reorderModuleAction(moduleId: string, direction: "up" | "down"): Promise<ActionState> {
  const session = await requireRole(["SUPER_ADMIN", "INSTRUCTOR"]);
  const mod = await assertOwnsModule(moduleId, session.userId, session.role).catch(() => null);
  if (!mod) return { success: false, message: "Module not found." };

  const siblings = await prisma.module.findMany({ where: { courseId: mod.courseId }, orderBy: { order: "asc" } });
  const idx = siblings.findIndex((m) => m.id === moduleId);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= siblings.length) return { success: true };

  const a = siblings[idx];
  const b = siblings[swapIdx];
  await prisma.$transaction([
    prisma.module.update({ where: { id: a.id }, data: { order: b.order } }),
    prisma.module.update({ where: { id: b.id }, data: { order: a.order } }),
  ]);
  revalidatePath(`/instructor/courses/${mod.courseId}`);
  revalidatePath(`/admin/courses/${mod.courseId}`);
  return { success: true };
}

// ---------------- LESSONS ----------------

export async function createLessonAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireRole(["SUPER_ADMIN", "INSTRUCTOR"]);
  const moduleId = formData.get("moduleId") as string;
  const parsed = lessonSchema.safeParse({
    title: formData.get("title"),
    contentType: formData.get("contentType"),
    videoUrl: formData.get("videoUrl") || undefined,
    textContent: formData.get("textContent") || undefined,
    documentUrl: formData.get("documentUrl") || undefined,
    externalUrl: formData.get("externalUrl") || undefined,
    assignmentInstructions: formData.get("assignmentInstructions") || undefined,
    notes: formData.get("notes") || undefined,
    durationMinutes: formData.get("durationMinutes") || undefined,
  });
  if (!parsed.success) return { success: false, errors: parsed.error.flatten().fieldErrors };

  let mod;
  try {
    mod = await assertOwnsModule(moduleId, session.userId, session.role);
  } catch (e) {
    return { success: false, message: (e as Error).message };
  }

  const count = await prisma.lesson.count({ where: { moduleId } });
  await prisma.lesson.create({ data: { moduleId, order: count, ...parsed.data } });

  // Notify actively enrolled students of the new lesson
  const enrollments = await prisma.enrollment.findMany({
    where: { courseId: mod.courseId, status: { in: ["ACTIVE", "APPROVED"] } },
    select: { studentId: true },
  });
  await createNotificationsForMany(
    enrollments.map((e) => e.studentId),
    {
      type: "NEW_LESSON",
      title: "New lesson added",
      message: `A new lesson "${parsed.data.title}" was added to your course.`,
      link: `/student/courses/${mod.courseId}`,
    }
  );

  revalidatePath(`/instructor/courses/${mod.courseId}`);
  revalidatePath(`/admin/courses/${mod.courseId}`);
  return { success: true, message: "Lesson added." };
}

export async function updateLessonAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireRole(["SUPER_ADMIN", "INSTRUCTOR"]);
  const id = formData.get("id") as string;
  const parsed = lessonSchema.safeParse({
    title: formData.get("title"),
    contentType: formData.get("contentType"),
    videoUrl: formData.get("videoUrl") || undefined,
    textContent: formData.get("textContent") || undefined,
    documentUrl: formData.get("documentUrl") || undefined,
    externalUrl: formData.get("externalUrl") || undefined,
    assignmentInstructions: formData.get("assignmentInstructions") || undefined,
    notes: formData.get("notes") || undefined,
    durationMinutes: formData.get("durationMinutes") || undefined,
  });
  if (!parsed.success) return { success: false, errors: parsed.error.flatten().fieldErrors };

  let lesson;
  try {
    lesson = await assertOwnsLesson(id, session.userId, session.role);
  } catch (e) {
    return { success: false, message: (e as Error).message };
  }

  await prisma.lesson.update({ where: { id }, data: parsed.data });
  revalidatePath(`/instructor/courses/${lesson.module.courseId}`);
  revalidatePath(`/admin/courses/${lesson.module.courseId}`);
  return { success: true, message: "Lesson updated." };
}

export async function deleteLessonAction(lessonId: string): Promise<ActionState> {
  const session = await requireRole(["SUPER_ADMIN", "INSTRUCTOR"]);
  let lesson;
  try {
    lesson = await assertOwnsLesson(lessonId, session.userId, session.role);
  } catch (e) {
    return { success: false, message: (e as Error).message };
  }
  await prisma.lesson.delete({ where: { id: lessonId } });
  revalidatePath(`/instructor/courses/${lesson.module.courseId}`);
  revalidatePath(`/admin/courses/${lesson.module.courseId}`);
  return { success: true, message: "Lesson deleted." };
}

export async function reorderLessonAction(lessonId: string, direction: "up" | "down"): Promise<ActionState> {
  const session = await requireRole(["SUPER_ADMIN", "INSTRUCTOR"]);
  const lesson = await assertOwnsLesson(lessonId, session.userId, session.role).catch(() => null);
  if (!lesson) return { success: false, message: "Lesson not found." };

  const siblings = await prisma.lesson.findMany({ where: { moduleId: lesson.moduleId }, orderBy: { order: "asc" } });
  const idx = siblings.findIndex((l) => l.id === lessonId);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= siblings.length) return { success: true };

  const a = siblings[idx];
  const b = siblings[swapIdx];
  await prisma.$transaction([
    prisma.lesson.update({ where: { id: a.id }, data: { order: b.order } }),
    prisma.lesson.update({ where: { id: b.id }, data: { order: a.order } }),
  ]);
  revalidatePath(`/instructor/courses/${lesson.module.courseId}`);
  revalidatePath(`/admin/courses/${lesson.module.courseId}`);
  return { success: true };
}
