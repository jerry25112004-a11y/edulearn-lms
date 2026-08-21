import { GraduationCap, Users, BookOpen, CheckCircle2, Award, ClipboardList, Video, Clock } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { getAdminDashboardStats, getMonthlyEnrollmentTrend, getEnrollmentsByCategory } from "@/lib/db/admin-stats";
import { getRecentActivity } from "@/lib/db/activity";
import { EnrollmentTrendChart, CategoryDistribution } from "@/components/shared/charts";
import { timeAgo } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Super Admin Dashboard" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [stats, trend, byCategory, activity] = await Promise.all([
    getAdminDashboardStats(),
    getMonthlyEnrollmentTrend(),
    getEnrollmentsByCategory(),
    getRecentActivity(8),
  ]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Students" value={stats.totalStudents} icon={GraduationCap} accent="brand" />
        <StatCard label="Total Instructors" value={stats.totalInstructors} icon={Users} accent="sky" />
        <StatCard label="Total Courses" value={stats.totalCourses} icon={BookOpen} accent="amber" />
        <StatCard label="Active Courses" value={stats.activeCourses} icon={CheckCircle2} accent="emerald" />
        <StatCard label="Completed Courses" value={stats.completedCourses} icon={Award} accent="rose" />
        <StatCard label="Total Enrollments" value={stats.totalEnrollments} icon={ClipboardList} accent="brand" />
        <StatCard label="Upcoming Meetings" value={stats.upcomingMeetings} icon={Video} accent="sky" />
        <StatCard label="Pending Approvals" value={stats.pendingEnrollments} icon={Clock} accent="amber" trend={stats.pendingEnrollments > 0 ? "Needs review" : undefined} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <EnrollmentTrendChart data={trend} />
        <CategoryDistribution data={byCategory} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Recent Activity</h2>
          {stats.pendingEnrollments > 0 && (
            <Link href="/admin/enrollments">
              <Badge variant="warning">{stats.pendingEnrollments} pending enrollment{stats.pendingEnrollments === 1 ? "" : "s"}</Badge>
            </Link>
          )}
        </div>
        {activity.length === 0 ? (
          <EmptyState title="No activity yet" description="Platform activity will show up here as things happen." />
        ) : (
          <ul className="space-y-4">
            {activity.map((a) => (
              <li key={a.id} className="flex items-start gap-3 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                <div>
                  <p className="text-slate-700">{a.message}</p>
                  <p className="text-xs text-slate-400">{timeAgo(a.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
