import Link from "next/link";
import { BookOpen } from "lucide-react";
import { requireRole } from "@/lib/auth/guard";
import { prisma } from "@/lib/db/prisma";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { CourseThumbnail } from "@/components/shared/course-thumbnail";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusBadge } from "@/components/shared/status-badge";

export const metadata = { title: "My Courses" };
export const dynamic = "force-dynamic";

export default async function StudentCoursesPage() {
  const session = await requireRole("STUDENT");
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: session.userId },
    include: { course: { include: { category: true, instructor: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">My Courses</h1>
        <p className="mt-1 text-sm text-slate-500">{enrollments.length} enrollments</p>
      </div>

      {enrollments.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="You haven't enrolled in any courses yet"
          description="Browse our catalog and start your learning journey."
          action={<Link href="/courses"><Button>Browse Courses</Button></Link>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((e) => {
            const clickable = e.status !== "PENDING" && e.status !== "REJECTED";
            const card = (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                <div className="relative">
                  <CourseThumbnail title={e.course.title} categorySlug={e.course.category.slug} thumbnailUrl={e.course.thumbnailUrl} />
                  <div className="absolute right-3 top-3"><StatusBadge status={e.status} /></div>
                </div>
                <div className="space-y-2 p-4">
                  <Badge variant="brand">{e.course.category.name}</Badge>
                  <h3 className="line-clamp-2 font-semibold text-slate-900">{e.course.title}</h3>
                  <p className="text-xs text-slate-500">By {e.course.instructor.name}</p>
                  {clickable && <ProgressBar value={e.progressPercent} showLabel />}
                </div>
              </div>
            );
            return clickable ? (
              <Link key={e.id} href={`/student/courses/${e.courseId}`}>{card}</Link>
            ) : (
              <div key={e.id}>{card}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
