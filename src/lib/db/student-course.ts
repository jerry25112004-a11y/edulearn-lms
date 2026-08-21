import "server-only";
import { prisma } from "@/lib/db/prisma";

export async function getStudentCourseView(studentId: string, courseId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId, courseId } },
    include: {
      lessonProgress: true,
      course: {
        include: {
          category: true,
          instructor: { select: { id: true, name: true, avatarUrl: true, instructorProfile: true } },
          modules: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } },
        },
      },
    },
  });

  if (!enrollment || !["ACTIVE", "APPROVED", "COMPLETED"].includes(enrollment.status)) {
    return null;
  }

  const [meetings, announcements] = await Promise.all([
    prisma.meeting.findMany({
      where: { courseId, startTime: { gte: new Date() }, status: { not: "CANCELLED" } },
      orderBy: { startTime: "asc" },
      take: 5,
    }),
    prisma.announcement.findMany({ where: { courseId }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const completedLessonIds = new Set(enrollment.lessonProgress.filter((p) => p.completed).map((p) => p.lessonId));

  return { enrollment, completedLessonIds, meetings, announcements };
}
