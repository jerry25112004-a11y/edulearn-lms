import "server-only";
import { prisma } from "@/lib/db/prisma";

export async function getAdminDashboardStats() {
  const [
    totalStudents,
    totalInstructors,
    totalCourses,
    activeCourses,
    completedCourses,
    totalEnrollments,
    upcomingMeetings,
    pendingEnrollments,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "INSTRUCTOR" } }),
    prisma.course.count(),
    prisma.course.count({ where: { status: "ACTIVE" } }),
    prisma.course.count({ where: { status: "COMPLETED" } }),
    prisma.enrollment.count(),
    prisma.meeting.count({ where: { startTime: { gte: new Date() }, status: { not: "CANCELLED" } } }),
    prisma.enrollment.count({ where: { status: "PENDING" } }),
  ]);

  return {
    totalStudents,
    totalInstructors,
    totalCourses,
    activeCourses,
    completedCourses,
    totalEnrollments,
    upcomingMeetings,
    pendingEnrollments,
  };
}

export async function getEnrollmentsByCategory() {
  const categories = await prisma.category.findMany({
    include: {
      courses: {
        select: { _count: { select: { enrollments: true } } },
      },
    },
  });
  return categories
    .map((c) => ({
      name: c.name,
      value: c.courses.reduce((sum, course) => sum + course._count.enrollments, 0),
    }))
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
}

export async function getMonthlyEnrollmentTrend() {
  const now = new Date();
  const months: { key: string; label: string; start: Date; end: Date }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString("en-US", { month: "short" }),
      start,
      end,
    });
  }

  const counts = await Promise.all(
    months.map((m) => prisma.enrollment.count({ where: { createdAt: { gte: m.start, lt: m.end } } }))
  );

  return months.map((m, i) => ({ month: m.label, enrollments: counts[i] }));
}
