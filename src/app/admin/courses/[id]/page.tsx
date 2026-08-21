import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Clock, Users, Signal } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { CurriculumManager } from "@/components/shared/curriculum-manager";
import { CourseStudentsTable } from "@/components/shared/course-students-table";
import { AddStudentToCourseDialog } from "@/components/shared/add-student-to-course-dialog";
import { CourseThumbnail } from "@/components/shared/course-thumbnail";

export const dynamic = "force-dynamic";

export default async function AdminCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      category: true,
      instructor: { select: { name: true, email: true } },
      modules: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } },
      enrollments: { include: { student: { select: { id: true, name: true, email: true, avatarUrl: true } } }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!course) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/courses" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600">
          <ArrowLeft className="h-4 w-4" /> Back to Courses
        </Link>
      </div>

      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="w-full shrink-0 sm:w-56">
          <CourseThumbnail title={course.title} categorySlug={course.category.slug} thumbnailUrl={course.thumbnailUrl} className="rounded-xl" />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="brand">{course.category.name}</Badge>
            <StatusBadge status={course.status} />
          </div>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">{course.title}</h1>
          <p className="mt-2 text-sm text-slate-600">{course.description}</p>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {course.duration}</span>
            <span className="flex items-center gap-1.5"><Signal className="h-4 w-4" /> {course.level}</span>
            <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {course.enrollments.length} students</span>
            <span>Instructor: <strong className="text-slate-700">{course.instructor.name}</strong></span>
          </div>
          <div className="mt-4">
            <Link href={`/admin/courses/${id}/edit`}>
              <Button variant="outline"><Pencil className="h-4 w-4" /> Edit Course Info</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <CurriculumManager courseId={course.id} modules={course.modules} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Enrolled Students</h2>
          <AddStudentToCourseDialog courseId={course.id} actorRole="SUPER_ADMIN" />
        </div>
        <CourseStudentsTable
          enrollments={course.enrollments.map((e) => ({
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
    </div>
  );
}
