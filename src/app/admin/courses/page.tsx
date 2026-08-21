import Link from "next/link";
import { Search, Plus, BookOpen } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { CourseRowActions } from "@/components/shared/course-row-actions";
import type { Prisma, CourseStatus } from "@prisma/client";

export const metadata = { title: "Manage Courses" };
export const dynamic = "force-dynamic";

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; category?: string }>;
}) {
  const { q, status, category } = await searchParams;

  const where: Prisma.CourseWhereInput = {
    ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
    ...(status ? { status: status as CourseStatus } : {}),
    ...(category ? { categoryId: category } : {}),
  };

  const [courses, categories] = await Promise.all([
    prisma.course.findMany({
      where,
      include: { category: true, instructor: { select: { name: true } }, _count: { select: { enrollments: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Courses</h1>
          <p className="mt-1 text-sm text-slate-500">{courses.length} total courses</p>
        </div>
        <Link href="/admin/courses/new">
          <Button><Plus className="h-4 w-4" /> Create Course</Button>
        </Link>
      </div>

      <form method="GET" className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input name="q" defaultValue={q} placeholder="Search courses..." className="pl-9" />
        </div>
        <Select name="category" defaultValue={category ?? ""} className="sm:w-52">
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <Select name="status" defaultValue={status ?? ""} className="sm:w-44">
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="COMPLETED">Completed</option>
        </Select>
        <Button type="submit" variant="outline">Filter</Button>
      </form>

      {courses.length === 0 ? (
        <EmptyState icon={BookOpen} title="No courses found" description="Create your first course to get started." />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Course</TH>
              <TH>Category</TH>
              <TH>Instructor</TH>
              <TH>Students</TH>
              <TH>Status</TH>
              <TH>Actions</TH>
            </TR>
          </THead>
          <TBody>
            {courses.map((c) => (
              <TR key={c.id}>
                <TD className="font-medium text-slate-900">{c.title}</TD>
                <TD className="text-slate-500">{c.category.name}</TD>
                <TD className="text-slate-500">{c.instructor.name}</TD>
                <TD>{c._count.enrollments}</TD>
                <TD><StatusBadge status={c.status} /></TD>
                <TD>
                  <CourseRowActions
                    courseId={c.id}
                    status={c.status}
                    manageHref={`/admin/courses/${c.id}`}
                    editHref={`/admin/courses/${c.id}/edit`}
                  />
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
