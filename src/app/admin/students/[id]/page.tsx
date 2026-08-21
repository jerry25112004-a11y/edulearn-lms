import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, Calendar } from "lucide-react";
import { getStudentDetail } from "@/lib/db/users";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminStudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const student = await getStudentDetail(id);
  if (!student) notFound();

  return (
    <div className="space-y-6">
      <Link href="/admin/students" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" /> Back to Students
      </Link>

      <Card>
        <CardContent className="flex flex-col items-center gap-4 pt-6 text-center sm:flex-row sm:text-left">
          <Avatar name={student.name} src={student.avatarUrl} size="xl" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h1 className="text-xl font-bold text-slate-900">{student.name}</h1>
              <StatusBadge status={student.status} />
            </div>
            <div className="mt-2 flex flex-col gap-1 text-sm text-slate-500 sm:flex-row sm:gap-4">
              <span className="flex items-center justify-center gap-1.5 sm:justify-start"><Mail className="h-3.5 w-3.5" /> {student.email}</span>
              {student.phone && <span className="flex items-center justify-center gap-1.5 sm:justify-start"><Phone className="h-3.5 w-3.5" /> {student.phone}</span>}
              <span className="flex items-center justify-center gap-1.5 sm:justify-start"><Calendar className="h-3.5 w-3.5" /> Joined {formatDate(student.createdAt)}</span>
            </div>
            {student.studentProfile?.bio && <p className="mt-3 text-sm text-slate-600">{student.studentProfile.bio}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enrolled Courses ({student.enrollments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {student.enrollments.length === 0 ? (
            <EmptyState title="No enrollments yet" description="This student hasn't enrolled in any courses." />
          ) : (
            <div className="space-y-4">
              {student.enrollments.map((e) => (
                <div key={e.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-slate-900">{e.course.title}</p>
                    <StatusBadge status={e.status} />
                  </div>
                  <div className="mt-2">
                    <ProgressBar value={e.progressPercent} showLabel />
                  </div>
                  <p className="mt-1 text-xs text-slate-400">Enrolled {formatDate(e.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
