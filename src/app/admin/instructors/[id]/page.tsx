import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, Calendar, Users } from "lucide-react";
import { getInstructorDetail } from "@/lib/db/users";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminInstructorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const instructor = await getInstructorDetail(id);
  if (!instructor) notFound();

  return (
    <div className="space-y-6">
      <Link href="/admin/instructors" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" /> Back to Instructors
      </Link>

      <Card>
        <CardContent className="flex flex-col items-center gap-4 pt-6 text-center sm:flex-row sm:text-left">
          <Avatar name={instructor.name} src={instructor.avatarUrl} size="xl" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h1 className="text-xl font-bold text-slate-900">{instructor.name}</h1>
              <StatusBadge status={instructor.status} />
            </div>
            {instructor.instructorProfile?.title && (
              <p className="text-sm text-slate-500">{instructor.instructorProfile.title}</p>
            )}
            <div className="mt-2 flex flex-col gap-1 text-sm text-slate-500 sm:flex-row sm:gap-4">
              <span className="flex items-center justify-center gap-1.5 sm:justify-start"><Mail className="h-3.5 w-3.5" /> {instructor.email}</span>
              {instructor.phone && <span className="flex items-center justify-center gap-1.5 sm:justify-start"><Phone className="h-3.5 w-3.5" /> {instructor.phone}</span>}
              <span className="flex items-center justify-center gap-1.5 sm:justify-start"><Calendar className="h-3.5 w-3.5" /> Joined {formatDate(instructor.createdAt)}</span>
            </div>
            {instructor.instructorProfile?.bio && <p className="mt-3 text-sm text-slate-600">{instructor.instructorProfile.bio}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Courses ({instructor.coursesTeaching.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {instructor.coursesTeaching.length === 0 ? (
            <EmptyState title="No courses assigned" description="This instructor hasn't created any courses yet." />
          ) : (
            <div className="space-y-3">
              {instructor.coursesTeaching.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                  <div>
                    <p className="font-medium text-slate-900">{c.title}</p>
                    <p className="text-xs text-slate-500">{c.category.name}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-sm text-slate-500">
                      <Users className="h-4 w-4" /> {c._count.enrollments}
                    </span>
                    <StatusBadge status={c.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
