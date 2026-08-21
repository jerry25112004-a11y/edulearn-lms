import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, Signal, Users, BookOpen, CheckCircle2, ListChecks } from "lucide-react";
import { getCourseBySlug } from "@/lib/db/courses";
import { getOptionalUser } from "@/lib/auth/guard";
import { prisma } from "@/lib/db/prisma";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { CourseThumbnail } from "@/components/shared/course-thumbnail";
import { EnrollButton } from "./enroll-button";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  return { title: course?.title ?? "Course" };
}

export const dynamic = "force-dynamic";

export default async function CourseDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course || course.status !== "ACTIVE") notFound();

  const user = await getOptionalUser();
  let enrollment = null;
  if (user && user.role === "STUDENT") {
    enrollment = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: user.userId, courseId: course.id } },
    });
  }

  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);

  return (
    <div>
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div className="lg:col-span-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand">{course.category.name}</Badge>
              <Badge variant="outline">{course.level.charAt(0) + course.level.slice(1).toLowerCase()}</Badge>
            </div>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">{course.title}</h1>
            <p className="mt-3 text-slate-600">{course.description}</p>
            <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {course.duration}</span>
              <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4" /> {totalLessons} lessons</span>
              <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {course._count.enrollments} students enrolled</span>
              <span className="flex items-center gap-1.5"><Signal className="h-4 w-4" /> {course.level.charAt(0) + course.level.slice(1).toLowerCase()}</span>
            </div>
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-slate-200 p-4">
              <Avatar name={course.instructor.name} src={course.instructor.avatarUrl} size="lg" />
              <div>
                <p className="text-xs text-slate-500">Instructor</p>
                <p className="font-semibold text-slate-900">{course.instructor.name}</p>
                {course.instructor.instructorProfile?.title && (
                  <p className="text-sm text-slate-500">{course.instructor.instructorProfile.title}</p>
                )}
              </div>
            </div>
          </div>

          <div className="lg:row-span-2">
            <div className="sticky top-24 overflow-hidden rounded-xl border border-slate-200 shadow-sm">
              <CourseThumbnail title={course.title} categorySlug={course.category.slug} thumbnailUrl={course.thumbnailUrl} />
              <div className="p-5">
                <EnrollButton courseId={course.id} isAuthed={!!user} isStudent={user?.role === "STUDENT"} enrollmentStatus={enrollment?.status} courseSlug={course.slug} />
                <ul className="mt-5 space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Full lifetime access</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Live instructor sessions</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Progress tracking & certificate</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Direct messaging with instructor</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="space-y-10 lg:col-span-2">
          {course.objectives.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-slate-900">What You'll Learn</h2>
              <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {course.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" /> {obj}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {course.requirements.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-slate-900">Requirements</h2>
              <ul className="mt-4 space-y-2">
                {course.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <ListChecks className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /> {req}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="text-xl font-semibold text-slate-900">Course Content</h2>
            <p className="mt-1 text-sm text-slate-500">
              {course.modules.length} modules • {totalLessons} lessons
            </p>
            <div className="mt-4 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200">
              {course.modules.map((module, idx) => (
                <details key={module.id} className="group bg-white" open={idx === 0}>
                  <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-4 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                    <span>
                      Module {idx + 1}: {module.title}
                    </span>
                    <span className="text-xs font-normal text-slate-400">{module.lessons.length} lessons</span>
                  </summary>
                  <ul className="divide-y divide-slate-100 bg-slate-50/50 px-5">
                    {module.lessons.map((lesson) => (
                      <li key={lesson.id} className="flex items-center justify-between py-3 text-sm text-slate-600">
                        <span className="flex items-center gap-2">
                          <BookOpen className="h-3.5 w-3.5 text-slate-400" /> {lesson.title}
                        </span>
                        {lesson.durationMinutes && (
                          <span className="text-xs text-slate-400">{lesson.durationMinutes} min</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
              {course.modules.length === 0 && (
                <p className="p-5 text-sm text-slate-500">Course content is being prepared.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
