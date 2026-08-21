import Link from "next/link";
import { Plus, BookOpen, Users, Clock } from "lucide-react";
import { requireRole } from "@/lib/auth/guard";
import { prisma } from "@/lib/db/prisma";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { CourseThumbnail } from "@/components/shared/course-thumbnail";

export const metadata = { title: "My Courses" };
export const dynamic = "force-dynamic";

export default async function InstructorCoursesPage() {
  const session = await requireRole("INSTRUCTOR");
  const courses = await prisma.course.findMany({
    where: { instructorId: session.userId },
    include: { category: true, _count: { select: { enrollments: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Courses</h1>
          <p className="mt-1 text-sm text-slate-500">{courses.length} courses</p>
        </div>
        <Link href="/instructor/courses/new">
          <Button><Plus className="h-4 w-4" /> Create Course</Button>
        </Link>
      </div>

      {courses.length === 0 ? (
        <EmptyState icon={BookOpen} title="No courses yet" description="Create your first course to start building your curriculum." />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <Link key={c.id} href={`/instructor/courses/${c.id}`}>
              <Card className="overflow-hidden transition-shadow hover:shadow-md">
                <div className="relative">
                  <CourseThumbnail title={c.title} categorySlug={c.category.slug} thumbnailUrl={c.thumbnailUrl} />
                  <div className="absolute right-3 top-3"><StatusBadge status={c.status} /></div>
                </div>
                <div className="space-y-2 p-5">
                  <Badge variant="brand">{c.category.name}</Badge>
                  <h3 className="line-clamp-2 font-semibold text-slate-900">{c.title}</h3>
                  <div className="flex items-center gap-4 pt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {c._count.enrollments} students</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {c.duration}</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
