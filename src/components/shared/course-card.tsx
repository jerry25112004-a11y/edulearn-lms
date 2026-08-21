import Link from "next/link";
import { Clock, Users, Signal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CourseThumbnail } from "./course-thumbnail";

export type CourseCardData = {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl?: string | null;
  duration: string;
  level: string;
  category: { name: string; slug: string };
  instructor: { name: string };
  _count?: { enrollments?: number };
};

export function CourseCard({ course }: { course: CourseCardData }) {
  return (
    <Card hover className="flex flex-col overflow-hidden">
      <Link href={`/courses/${course.slug}`}>
        <CourseThumbnail title={course.title} categorySlug={course.category.slug} thumbnailUrl={course.thumbnailUrl} />
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <Badge variant="brand">{course.category.name}</Badge>
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Signal className="h-3.5 w-3.5" /> {course.level.charAt(0) + course.level.slice(1).toLowerCase()}
          </span>
        </div>
        <Link href={`/courses/${course.slug}`}>
          <h3 className="line-clamp-2 text-base font-semibold text-slate-900 transition-colors hover:text-brand-600">
            {course.title}
          </h3>
        </Link>
        <p className="line-clamp-2 text-sm text-slate-500">{course.description}</p>
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
          <span>By {course.instructor.name}</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {course.duration}
            </span>
            {course._count?.enrollments !== undefined && (
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" /> {course._count.enrollments}
              </span>
            )}
          </div>
        </div>
        <Link
          href={`/courses/${course.slug}`}
          className="font-ui mt-2 inline-flex h-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-medium text-white shadow-soft transition-colors duration-150 hover:bg-brand-700"
        >
          View Course
        </Link>
      </div>
    </Card>
  );
}
