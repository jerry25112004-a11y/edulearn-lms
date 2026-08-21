import Link from "next/link";
import { BookOpen, Users, Video, TrendingUp, MessageSquare, PlusCircle } from "lucide-react";
import { requireRole } from "@/lib/auth/guard";
import { getInstructorDashboardData } from "@/lib/db/instructor-stats";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { timeAgo } from "@/lib/utils";

export const metadata = { title: "Instructor Dashboard" };
export const dynamic = "force-dynamic";

export default async function InstructorDashboardPage() {
  const session = await requireRole("INSTRUCTOR");
  const data = await getInstructorDashboardData(session.userId);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="My Courses" value={data.totalCourses} icon={BookOpen} accent="brand" />
        <StatCard label="Total Students" value={data.totalStudents} icon={Users} accent="sky" />
        <StatCard label="Upcoming Meetings" value={data.upcomingMeetings} icon={Video} accent="amber" />
        <StatCard label="Avg. Course Progress" value={`${Math.round(data.avgProgress)}%`} icon={TrendingUp} accent="emerald" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">My Courses</h2>
            <Link href="/instructor/courses/new">
              <Button size="sm" variant="outline"><PlusCircle className="h-4 w-4" /> New Course</Button>
            </Link>
          </div>
          {data.courses.length === 0 ? (
            <EmptyState icon={BookOpen} title="No courses yet" description="Create your first course to start teaching." />
          ) : (
            <div className="space-y-3">
              {data.courses.slice(0, 5).map((c) => {
                const avg = c.enrollments.length > 0 ? c.enrollments.reduce((s, e) => s + e.progressPercent, 0) / c.enrollments.length : 0;
                return (
                  <Link key={c.id} href={`/instructor/courses/${c.id}`} className="block rounded-lg border border-slate-100 p-3 hover:border-brand-200 hover:bg-brand-50/30">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-slate-900">{c.title}</p>
                      <StatusBadge status={c.status} />
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                      <span>{c._count.enrollments} students</span>
                    </div>
                    <div className="mt-2"><ProgressBar value={avg} showLabel /></div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Recent Messages</h2>
              <Link href="/instructor/messages" className="text-xs font-medium text-brand-600 hover:text-brand-700">View all</Link>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MessageSquare className="h-4 w-4 text-slate-400" />
              {data.unreadMessages > 0 ? `${data.unreadMessages} unread message${data.unreadMessages === 1 ? "" : "s"}` : "No unread messages"}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-base font-semibold text-slate-900">Recent Enrollments</h2>
            {data.recentEnrollments.length === 0 ? (
              <p className="text-sm text-slate-400">No enrollments yet.</p>
            ) : (
              <ul className="space-y-3">
                {data.recentEnrollments.map((e) => (
                  <li key={e.id} className="flex items-center gap-3">
                    <Avatar name={e.student.name} src={e.student.avatarUrl} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{e.student.name}</p>
                      <p className="truncate text-xs text-slate-500">{e.course.title}</p>
                    </div>
                    <span className="shrink-0 text-xs text-slate-400">{timeAgo(e.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
