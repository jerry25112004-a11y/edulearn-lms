import "server-only";
import { prisma } from "@/lib/db/prisma";

export async function getStudentDashboardData(studentId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId, status: { in: ["ACTIVE", "APPROVED", "COMPLETED"] } },
    include: {
      course: {
        include: {
          category: true,
          instructor: { select: { name: true } },
          modules: { include: { lessons: { select: { id: true } } } },
        },
      },
    },
    orderBy: { lastActivityAt: "desc" },
  });

  const totalLessons = enrollments.reduce(
    (sum, e) => sum + e.course.modules.reduce((s, m) => s + m.lessons.length, 0),
    0
  );
  const completedLessonsCount = await prisma.lessonProgress.count({
    where: { completed: true, enrollment: { studentId } },
  });

  const upcomingMeetings = await prisma.meeting.count({
    where: {
      course: { enrollments: { some: { studentId, status: { in: ["ACTIVE", "APPROVED"] } } } },
      startTime: { gte: new Date() },
      status: { not: "CANCELLED" },
    },
  });

  const unreadMessages = await prisma.message.count({
    where: { conversation: { studentId }, senderId: { not: studentId }, isRead: false },
  });

  const continueLearning = enrollments.find((e) => e.lastAccessedLessonId && e.status !== "COMPLETED");
  let continueLesson = null;
  if (continueLearning?.lastAccessedLessonId) {
    continueLesson = await prisma.lesson.findUnique({
      where: { id: continueLearning.lastAccessedLessonId },
      include: { module: true },
    });
  }

  return {
    enrollments,
    totalLessons,
    completedLessonsCount,
    pendingLessonsCount: Math.max(0, totalLessons - completedLessonsCount),
    upcomingMeetings,
    unreadMessages,
    continueLearning: continueLearning && continueLesson ? { enrollment: continueLearning, lesson: continueLesson } : null,
  };
}
