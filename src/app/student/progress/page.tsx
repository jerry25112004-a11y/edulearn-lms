import Link from "next/link";
import { requireRole } from "@/lib/auth/guard";
import { prisma } from "@/lib/db/prisma";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { BarChart3 } from "lucide-react";
import { timeAgo } from "@/lib/utils";

export const metadata = { title: "My Progress" };
export const dynamic = "force-dynamic";

export default async function StudentProgressPage() {
  const session = await requireRole("STUDENT");
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: session.userId, status: { in: ["ACTIVE", "APPROVED", "COMPLETED"] } },
    include: {
      course: { include: { modules: { include: { lessons: { select: { id: true } } } } } },
      lessonProgress: { where: { completed: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">My Progress</h1>
        <p className="mt-1 text-sm text-slate-500">Track how far you've come in each course.</p>
      </div>

      {enrollments.length === 0 ? (
        <EmptyState icon={BarChart3} title="No progress to show yet" description="Enroll in a course to start tracking your learning progress." />
      ) : (
        <div className="space-y-4">
          {enrollments.map((e) => {
            const total = e.course.modules.reduce((s, m) => s + m.lessons.length, 0);
            const completed = e.lessonProgress.length;
            return (
              <Link key={e.id} href={`/student/courses/${e.courseId}`} className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-brand-200">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900">{e.course.title}</p>
                  <StatusBadge status={e.status} />
                </div>
                <div className="mt-3">
                  <ProgressBar value={e.progressPercent} showLabel />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>{completed} of {total} lessons completed</span>
                  {e.lastActivityAt && <span>Last activity {timeAgo(e.lastActivityAt)}</span>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
