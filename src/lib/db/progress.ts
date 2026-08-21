import "server-only";
import { prisma } from "@/lib/db/prisma";

/**
 * Recalculates and persists the progress percentage for a single enrollment
 * based on completed vs total lessons across all modules of the course.
 * Called any time lesson completion state changes.
 */
export async function recalculateEnrollmentProgress(enrollmentId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      course: {
        include: { modules: { include: { lessons: { select: { id: true } } } } },
      },
      lessonProgress: { where: { completed: true }, select: { lessonId: true } },
    },
  });

  if (!enrollment) return null;

  const totalLessons = enrollment.course.modules.reduce(
    (sum, m) => sum + m.lessons.length,
    0
  );
  const completedLessons = enrollment.lessonProgress.length;
  const progressPercent =
    totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 1000) / 10;

  const isNowComplete = totalLessons > 0 && completedLessons === totalLessons;

  const updated = await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: {
      progressPercent,
      status: isNowComplete
        ? "COMPLETED"
        : enrollment.status === "COMPLETED"
          ? "ACTIVE"
          : enrollment.status,
      lastActivityAt: new Date(),
    },
  });

  return { updated, totalLessons, completedLessons, progressPercent };
}

export async function getCourseLessonCount(courseId: string) {
  const modules = await prisma.module.findMany({
    where: { courseId },
    include: { lessons: { select: { id: true } } },
  });
  return modules.reduce((sum, m) => sum + m.lessons.length, 0);
}
