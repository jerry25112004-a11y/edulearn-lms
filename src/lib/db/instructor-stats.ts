import "server-only";
import { prisma } from "@/lib/db/prisma";

export async function getInstructorDashboardData(instructorId: string) {
  const [courses, totalStudents, upcomingMeetings, recentEnrollments, unreadMessages] = await Promise.all([
    prisma.course.findMany({
      where: { instructorId },
      include: { _count: { select: { enrollments: true } }, enrollments: { select: { progressPercent: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.enrollment.count({ where: { course: { instructorId }, status: { in: ["ACTIVE", "APPROVED", "COMPLETED"] } } }),
    prisma.meeting.count({ where: { instructorId, startTime: { gte: new Date() }, status: { not: "CANCELLED" } } }),
    prisma.enrollment.findMany({
      where: { course: { instructorId } },
      include: { student: { select: { name: true, avatarUrl: true } }, course: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.message.count({
      where: { conversation: { instructorId }, senderId: { not: instructorId }, isRead: false },
    }),
  ]);

  const totalCourses = courses.length;
  const activeCourses = courses.filter((c) => c.status === "ACTIVE").length;
  const avgProgress =
    courses.length > 0
      ? courses.reduce((sum, c) => {
          const courseAvg = c.enrollments.length > 0 ? c.enrollments.reduce((s, e) => s + e.progressPercent, 0) / c.enrollments.length : 0;
          return sum + courseAvg;
        }, 0) / courses.length
      : 0;

  return { courses, totalCourses, activeCourses, totalStudents, upcomingMeetings, recentEnrollments, unreadMessages, avgProgress };
}
