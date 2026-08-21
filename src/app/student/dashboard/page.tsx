import Link from "next/link";
import { BookOpen, CheckCircle2, Clock, Video, PlayCircle, ArrowRight } from "lucide-react";
import { requireRole } from "@/lib/auth/guard";
import { getStudentDashboardData } from "@/lib/db/student-stats";
import { StatCard } from "@/components/ui/stat-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { CourseThumbnail } from "@/components/shared/course-thumbnail";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Student Dashboard" };
export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  const session = await requireRole("STUDENT");
  const data = await getStudentDashboardData(session.userId);

  return (
    <div className="space-y-6">
      {data.continueLearning && (
        <div className="flex flex-col gap-4 rounded-xl border border-brand-200 bg-brand-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Continue Learning</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{data.continueLearning.enrollment.course.title}</p>
            <p className="text-sm text-slate-500">Next: {data.continueLearning.lesson.title}</p>
          </div>
          <Link href={`/student/courses/${data.continueLearning.enrollment.courseId}/lessons/${data.continueLearning.lesson.id}`}>
            <Button size="lg"><PlayCircle className="h-4 w-4" /> Resume</Button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="My Courses" value={data.enrollments.length} icon={BookOpen} accent="brand" />
        <StatCard label="Completed Lessons" value={data.completedLessonsCount} icon={CheckCircle2} accent="emerald" />
        <StatCard label="Pending Lessons" value={data.pendingLessonsCount} icon={Clock} accent="amber" />
        <StatCard label="Upcoming Classes" value={data.upcomingMeetings} icon={Video} accent="sky" />
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">My Courses</h2>
          <Link href="/student/courses" className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {data.enrollments.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="You're not enrolled in any courses yet"
            description="Browse the course catalog and start learning today."
            action={<Link href="/courses"><Button>Browse Courses</Button></Link>}
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.enrollments.slice(0, 6).map((e) => (
              <Link key={e.id} href={`/student/courses/${e.courseId}`} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                <CourseThumbnail title={e.course.title} categorySlug={e.course.category.slug} thumbnailUrl={e.course.thumbnailUrl} />
                <div className="space-y-2 p-4">
                  <Badge variant="brand">{e.course.category.name}</Badge>
                  <h3 className="line-clamp-2 font-semibold text-slate-900">{e.course.title}</h3>
                  <p className="text-xs text-slate-500">By {e.course.instructor.name}</p>
                  <ProgressBar value={e.progressPercent} showLabel />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
