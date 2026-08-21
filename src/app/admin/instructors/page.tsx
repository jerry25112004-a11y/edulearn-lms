import { Search, Users } from "lucide-react";
import { getInstructors } from "@/lib/db/users";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { AddInstructorButton, EditInstructorButton } from "./instructor-form-dialog";
import { UserRowActions } from "@/components/shared/user-row-actions";

export const metadata = { title: "Manage Instructors" };
export const dynamic = "force-dynamic";

export default async function AdminInstructorsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const instructors = await getInstructors(q);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Instructors</h1>
          <p className="mt-1 text-sm text-slate-500">{instructors.length} total instructors</p>
        </div>
        <AddInstructorButton />
      </div>

      <form method="GET" className="mb-5 flex max-w-sm gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input name="q" defaultValue={q} placeholder="Search by name or email..." className="pl-9" />
        </div>
        <Button type="submit" variant="outline">Search</Button>
      </form>

      {instructors.length === 0 ? (
        <EmptyState icon={Users} title="No instructors found" description="Add an instructor account to start building courses." />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Instructor</TH>
              <TH>Status</TH>
              <TH>Assigned Courses</TH>
              <TH>Total Students</TH>
              <TH>Joined</TH>
              <TH>Actions</TH>
            </TR>
          </THead>
          <TBody>
            {instructors.map((inst) => {
              const totalStudents = inst.coursesTeaching.reduce((sum, c) => sum + c._count.enrollments, 0);
              return (
                <TR key={inst.id}>
                  <TD>
                    <div className="flex items-center gap-3">
                      <Avatar name={inst.name} src={inst.avatarUrl} size="sm" />
                      <div>
                        <p className="font-medium text-slate-900">{inst.name}</p>
                        <p className="text-xs text-slate-500">{inst.email}</p>
                      </div>
                    </div>
                  </TD>
                  <TD><StatusBadge status={inst.status} /></TD>
                  <TD>{inst.coursesTeaching.length}</TD>
                  <TD>{totalStudents}</TD>
                  <TD className="whitespace-nowrap text-sm text-slate-500">{formatDate(inst.createdAt)}</TD>
                  <TD>
                    <UserRowActions
                      userId={inst.id}
                      status={inst.status}
                      viewHref={`/admin/instructors/${inst.id}`}
                      editButton={<EditInstructorButton instructor={inst} />}
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
