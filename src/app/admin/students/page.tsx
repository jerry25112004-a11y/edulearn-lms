import { Search } from "lucide-react";
import { getStudents } from "@/lib/db/users";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { GraduationCap } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { AddStudentButton, EditStudentButton } from "./student-form-dialog";
import { UserRowActions } from "@/components/shared/user-row-actions";

export const metadata = { title: "Manage Students" };
export const dynamic = "force-dynamic";

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const students = await getStudents(q);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Students</h1>
          <p className="mt-1 text-sm text-slate-500">{students.length} total students</p>
        </div>
        <AddStudentButton />
      </div>

      <form method="GET" className="mb-5 flex max-w-sm gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input name="q" defaultValue={q} placeholder="Search by name or email..." className="pl-9" />
        </div>
        <Button type="submit" variant="outline">Search</Button>
      </form>

      {students.length === 0 ? (
        <EmptyState icon={GraduationCap} title="No students found" description="Try a different search, or add a new student account." />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Student</TH>
              <TH>Status</TH>
              <TH>Enrolled Courses</TH>
              <TH>Avg. Progress</TH>
              <TH>Registered</TH>
              <TH>Actions</TH>
            </TR>
          </THead>
          <TBody>
            {students.map((s) => {
              const avgProgress =
                s.enrollments.length > 0
                  ? s.enrollments.reduce((sum, e) => sum + e.progressPercent, 0) / s.enrollments.length
                  : 0;
              return (
                <TR key={s.id}>
                  <TD>
                    <div className="flex items-center gap-3">
                      <Avatar name={s.name} src={s.avatarUrl} size="sm" />
                      <div>
                        <p className="font-medium text-slate-900">{s.name}</p>
                        <p className="text-xs text-slate-500">{s.email}</p>
                      </div>
                    </div>
                  </TD>
                  <TD><StatusBadge status={s.status} /></TD>
                  <TD>{s.enrollments.length}</TD>
                  <TD className="w-40"><ProgressBar value={avgProgress} showLabel /></TD>
                  <TD className="whitespace-nowrap text-sm text-slate-500">{formatDate(s.createdAt)}</TD>
                  <TD>
                    <UserRowActions
                      userId={s.id}
                      status={s.status}
                      viewHref={`/admin/students/${s.id}`}
                      editButton={<EditStudentButton student={s} />}
                    />
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      )}
    </div>
  );
}
