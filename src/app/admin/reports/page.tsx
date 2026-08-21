import { prisma } from "@/lib/db/prisma";
import { StatCard } from "@/components/ui/stat-card";
import { EnrollmentTrendChart, CategoryDistribution } from "@/components/shared/charts";
import { getMonthlyEnrollmentTrend, getEnrollmentsByCategory, getAdminDashboardStats } from "@/lib/db/admin-stats";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Award, TrendingUp, Percent, Users } from "lucide-react";

export const metadata = { title: "Reports" };
export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const [stats, trend, byCategory, courses, completedEnrollments, totalEnrollments] = await Promise.all([
    getAdminDashboardStats(),
    getMonthlyEnrollmentTrend(),
    getEnrollmentsByCategory(),
    prisma.course.findMany({
      include: { instructor: { select: { name: true } }, enrollments: true },
      orderBy: { enrollments: { _count: "desc" } },
      take: 8,
    }),
    prisma.enrollment.count({ where: { status: "COMPLETED" } }),
    prisma.enrollment.count(),
  ]);

  const completionRate = totalEnrollments === 0 ? 0 : Math.round((completedEnrollments / totalEnrollments) * 100);
  const avgProgress =
    courses.length > 0
      ? courses.reduce((sum, c) => sum + (c.enrollments.reduce((s, e) => s + e.progressPercent, 0) / (c.enrollments.length || 1)), 0) / courses.length
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="mt-1 text-sm text-slate-500">Platform-wide performance and enrollment analytics</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Enrollments" value={stats.totalEnrollments} icon={Users} accent="brand" />
        <StatCard label="Completion Rate" value={`${completionRate}%`} icon={Percent} accent="emerald" />
        <StatCard label="Avg. Course Progress" value={`${Math.round(avgProgress)}%`} icon={TrendingUp} accent="sky" />
        <StatCard label="Completed Courses" value={stats.completedCourses} icon={Award} accent="amber" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <EnrollmentTrendChart data={trend} />
        <CategoryDistribution data={byCategory} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Top Courses by Enrollment</h2>
        <Table>
          <THead>
            <TR>
              <TH>Course</TH>
              <TH>Instructor</TH>
              <TH>Students</TH>
              <TH>Avg. Progress</TH>
            </TR>
          </THead>
          <TBody>
            {courses.map((c) => {
              const avg = c.enrollments.length > 0 ? c.enrollments.reduce((s, e) => s + e.progressPercent, 0) / c.enrollments.length : 0;
              return (
                <TR key={c.id}>
                  <TD className="font-medium text-slate-900">{c.title}</TD>
                  <TD className="text-slate-500">{c.instructor.name}</TD>
                  <TD>{c.enrollments.length}</TD>
                  <TD className="w-40"><ProgressBar value={avg} showLabel /></TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      </div>
    </div>
  );
}
