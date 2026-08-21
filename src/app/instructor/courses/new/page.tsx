import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { CourseForm } from "@/components/shared/course-form";

export const metadata = { title: "Create Course" };
export const dynamic = "force-dynamic";

export default async function InstructorNewCoursePage() {
  const categories = await prisma.category.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/instructor/courses" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" /> Back to My Courses
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Create New Course</h1>
      <CourseForm
        mode="create"
        categories={categories}
        showInstructorSelect={false}
        redirectPath="/instructor/courses"
      />
    </div>
  );
}
