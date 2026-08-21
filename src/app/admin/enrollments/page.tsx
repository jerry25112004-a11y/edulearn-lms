import { ClipboardList } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { CourseStudentsTable } from "@/components/shared/course-students-table";
import type { EnrollmentStatus } from "@prisma/client";

export const metadata = { title: "Manage Enrollments" };
export const dynamic = "force-dynamic";

export default async function AdminEnrollmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const enrollments = await prisma.enrollment.findMany({
    where: status ? { status: status as EnrollmentStatus } : {},
    include: { student: { select: { id: true, name: true, email: true, avatarUrl: true } }, course: { select: { title: true } } },
    orderBy: { requestedAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Enrollments</h1>
          <p className="mt-1 text-sm text-slate-500">{enrollments.length} enrollment records</p>
        </div>
      </div>

      <form method="GET" className="mb-5 flex max-w-xs gap-2">
        <Select name="status" defaultValue={status ?? ""}>
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="ACTIVE">Active</option>
          <option value="APPROVED">Approved</option>
          <option value="COMPLETED">Completed</option>
          <option value="REJECTED">Rejected</option>
        </Select>
        <Button type="submit" variant="outline">Filter</Button>
      </form>

      {enrollments.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No enrollments found" description="Enrollment requests will appear here." />
      ) : (
        <div className="space-y-6">
          {Object.entries(
            enrollments.reduce<Record<string, typeof enrollments>>((acc, e) => {
              acc[e.course.title] = acc[e.course.title] ? [...acc[e.course.title], e] : [e];
              return acc;
            }, {})
          ).map(([courseTitle, rows]) => (
            <div key={courseTitle}>
              <h2 className="mb-2 text-sm font-semibold text-slate-700">{courseTitle}</h2>
              <CourseStudentsTable
                enrollments={rows.map((e) => ({
                  id: e.id,
                  status: e.status,
                  progressPercent: e.progressPercent,
                  requestedAt: e.requestedAt.toISOString(),
                  lastActivityAt: e.lastActivityAt?.toISOString() ?? null,
                  student: e.student,
                }))}
                actorRole="SUPER_ADMIN"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
