import { Search, Users } from "lucide-react";
import { requireRole } from "@/lib/auth/guard";
import { prisma } from "@/lib/db/prisma";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, timeAgo } from "@/lib/utils";

export const metadata = { title: "My Students" };
export const dynamic = "force-dynamic";

export default async function InstructorStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await requireRole("INSTRUCTOR");
  const { q } = await searchParams;

  const enrollments = await prisma.enrollment.findMany({
    where: {
      course: { instructorId: session.userId },
      status: { in: ["ACTIVE", "APPROVED", "COMPLETED"] },
      ...(q
        ? {
            student: {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
              ],
            },
          }
        : {}),
    },
    include: { student: true, course: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">My Students</h1>
        <p className="mt-1 text-sm text-slate-500">{enrollments.length} active students across your courses</p>
      </div>

      <form method="GET" className="mb-5 flex max-w-sm gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input name="q" defaultValue={q} placeholder="Search students..." className="pl-9" />
        </div>
        <Button type="submit" variant="outline">Search</Button>
      </form>

      {enrollments.length === 0 ? (
        <EmptyState icon={Users} title="No students found" description="Students enrolled in your courses will appear here." />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Student</TH>
              <TH>Course</TH>
              <TH>Enrolled</TH>
              <TH>Progress</TH>
              <TH>Last Activity</TH>
              <TH>Status</TH>
            </TR>
          </THead>
          <TBody>
            {enrollments.map((e) => (
              <TR key={e.id}>
                <TD>
                  <div className="flex items-center gap-3">
                    <Avatar name={e.student.name} src={e.student.avatarUrl} size="sm" />
                    <div>
                      <p className="font-medium text-slate-900">{e.student.name}</p>
                      <p className="text-xs text-slate-500">{e.student.email}</p>
                    </div>
                  </div>
                </TD>
                <TD className="text-slate-500">{e.course.title}</TD>
                <TD className="whitespace-nowrap text-sm text-slate-500">{formatDate(e.createdAt)}</TD>
                <TD className="w-40"><ProgressBar value={e.progressPercent} showLabel /></TD>
                <TD className="whitespace-nowrap text-sm text-slate-500">{e.lastActivityAt ? timeAgo(e.lastActivityAt) : "—"}</TD>
                <TD><StatusBadge status={e.status} /></TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
