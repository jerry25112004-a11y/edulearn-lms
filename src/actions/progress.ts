"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/guard";
import { prisma } from "@/lib/db/prisma";
import { recalculateEnrollmentProgress } from "@/lib/db/progress";
import type { ActionState } from "./auth";

export async function toggleLessonCompleteAction(
  lessonId: string,
  courseId: string,
  completed: boolean
): Promise<ActionState> {
  const session = await requireRole("STUDENT");

  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId: session.userId, courseId } },
  });
  if (!enrollment || !["ACTIVE", "APPROVED", "COMPLETED"].includes(enrollment.status)) {
    return { success: false, message: "You are not enrolled in this course." };
  }

  await prisma.lessonProgress.upsert({
    where: { enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId } },
    create: { enrollmentId: enrollment.id, lessonId, completed, completedAt: completed ? new Date() : null },
    update: { completed, completedAt: completed ? new Date() : null },
  });

  await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: { lastAccessedLessonId: lessonId, lastActivityAt: new Date() },
  });

  const result = await recalculateEnrollmentProgress(enrollment.id);

  revalidatePath(`/student/courses/${courseId}`);
  revalidatePath(`/student/courses/${courseId}/lessons/${lessonId}`);
  revalidatePath("/student/dashboard");
  revalidatePath("/student/progress");

  return {
    success: true,
    message: completed ? "Lesson marked complete." : "Lesson marked incomplete.",
    ...(result?.progressPercent === 100 ? { id: "completed" } : {}),
  };
}

export async function trackLessonAccessAction(lessonId: string, courseId: string) {
  const session = await requireRole("STUDENT");
  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId: session.userId, courseId } },
  });
  if (!enrollment) return;
  await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: { lastAccessedLessonId: lessonId, lastActivityAt: new Date() },
  });
  await prisma.lessonProgress.upsert({
    where: { enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId } },
    create: { enrollmentId: enrollment.id, lessonId, completed: false },
    update: {},
  });
}
