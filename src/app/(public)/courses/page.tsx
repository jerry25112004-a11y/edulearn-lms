import { Search } from "lucide-react";
import { getPublicCourses, getActiveCategories } from "@/lib/db/courses";
import { CourseCard } from "@/components/shared/course-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { CourseLevel } from "@prisma/client";

export const metadata = { title: "Courses" };
export const dynamic = "force-dynamic";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; level?: string }>;
}) {
  const params = await searchParams;
  const [courses, categories] = await Promise.all([
    getPublicCourses({
      q: params.q,
      categoryId: params.category,
      level: params.level as CourseLevel | undefined,
    }),
    getActiveCategories(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-slate-900">Explore Our Courses</h1>
        <p className="font-ui mx-auto mt-2 max-w-xl text-slate-500">
          Search and filter through our full catalog of instructor-led courses.
        </p>
      </div>

      <form method="GET" className="mx-auto mt-8 flex max-w-4xl flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input name="q" defaultValue={params.q} placeholder="Search courses by title..." className="pl-9" />
        </div>
        <Select name="category" defaultValue={params.category ?? ""} className="sm:w-56">
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select name="level" defaultValue={params.level ?? ""} className="sm:w-48">
          <option value="">All Levels</option>
          <option value="BEGINNER">Beginner</option>
          <option value="INTERMEDIATE">Intermediate</option>
          <option value="ADVANCED">Advanced</option>
        </Select>
        <Button type="submit">Search</Button>
      </form>

      <p className="mt-6 text-sm text-slate-500">{courses.length} course{courses.length === 1 ? "" : "s"} found</p>

      {courses.length === 0 ? (
        <EmptyState
          className="mt-6"
          title="No courses found"
          description="Try adjusting your search or filters to find what you're looking for."
        />
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
