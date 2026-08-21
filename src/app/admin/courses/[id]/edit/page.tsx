import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { CourseForm } from "@/components/shared/course-form";

export const metadata = { title: "Edit Course" };
export const dynamic = "force-dynamic";

export default async function AdminEditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [course, categories, instructors] = await Promise.all([
    prisma.course.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({
      where: { role: "INSTRUCTOR" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!course) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/admin/courses/${id}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Course
      </Link>

      <h1 className="mb-6 text-2xl font-bold text-slate-900">
        Edit Course
      </h1>

      <CourseForm
        mode="edit"
        course={course}
        categories={categories}
        instructors={instructors}
        showInstructorSelect
        redirectPath={`/admin/courses/${id}`}
      />
    </div>
  );
}