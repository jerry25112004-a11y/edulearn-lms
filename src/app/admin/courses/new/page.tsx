import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { CourseForm } from "@/components/shared/course-form";

export const metadata = { title: "Create Course" };
export const dynamic = "force-dynamic";

export default async function NewCoursePage() {
  const [categories, instructors] = await Promise.all([
    prisma.category.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { role: "INSTRUCTOR", status: "ACTIVE" }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/courses" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" /> Back to Courses
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Create New Course</h1>
      <CourseForm
        mode="create"
        categories={categories}
        instructors={instructors}
        showInstructorSelect
        redirectPath="/admin/courses"
      />
    </div>
  );
}
