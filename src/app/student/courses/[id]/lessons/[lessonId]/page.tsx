import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, FileText, Link2, ClipboardCheck, Download } from "lucide-react";
import { requireRole } from "@/lib/auth/guard";
import { prisma } from "@/lib/db/prisma";
import { Badge } from "@/components/ui/badge";
import { LessonCompleteButton } from "@/components/shared/lesson-complete-button";
import { getEmbedUrl } from "@/lib/video-embed";
import { trackLessonAccessAction } from "@/actions/progress";

export const dynamic = "force-dynamic";

export default async function LessonViewerPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const session = await requireRole("STUDENT");
  const { id: courseId, lessonId } = await params;

  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId: session.userId, courseId } },
  });
  if (!enrollment || !["ACTIVE", "APPROVED", "COMPLETED"].includes(enrollment.status)) notFound();

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { modules: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" }, include: { materials: true } } } } },
  });
  if (!course) notFound();

  const allLessons = course.modules.flatMap((m) => m.lessons);
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const lesson = allLessons[currentIndex];
  if (!lesson) notFound();

  const prevLesson = allLessons[currentIndex - 1];
  const nextLesson = allLessons[currentIndex + 1];

  const progress = await prisma.lessonProgress.findUnique({
    where: { enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId } },
  });

  await trackLessonAccessAction(lessonId, courseId);

  const embedUrl = lesson.videoUrl ? getEmbedUrl(lesson.videoUrl) : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href={`/student/courses/${courseId}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" /> Back to Course
      </Link>

      <div>
        <Badge variant="outline">{lesson.contentType.replace("_", " ")}</Badge>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">{lesson.title}</h1>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {lesson.contentType === "VIDEO" && lesson.videoUrl && (
          <div className="aspect-video w-full overflow-hidden rounded-lg bg-slate-900">
            {embedUrl ? (
              <iframe src={embedUrl} title={lesson.title} className="h-full w-full" allowFullScreen />
            ) : (
              <div className="flex h-full items-center justify-center">
                <a href={lesson.videoUrl} target="_blank" rel="noopener noreferrer" className="text-brand-300 underline">
                  Open video in new tab
                </a>
              </div>
            )}
          </div>
        )}

        {lesson.contentType === "TEXT" && lesson.textContent && (
          <div className="prose prose-slate max-w-none whitespace-pre-wrap text-sm text-slate-700">{lesson.textContent}</div>
        )}

        {lesson.contentType === "DOCUMENT" && lesson.documentUrl && (
          <a href={lesson.documentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 hover:bg-slate-50">
            <FileText className="h-8 w-8 text-brand-600" />
            <div>
              <p className="font-medium text-slate-900">View Document</p>
              <p className="text-xs text-slate-500">{lesson.documentUrl}</p>
            </div>
          </a>
        )}

        {lesson.contentType === "EXTERNAL_LINK" && lesson.externalUrl && (
          <a href={lesson.externalUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 hover:bg-slate-50">
            <Link2 className="h-8 w-8 text-brand-600" />
            <div>
              <p className="font-medium text-slate-900">Open External Resource</p>
              <p className="text-xs text-slate-500">{lesson.externalUrl}</p>
            </div>
          </a>
        )}

        {lesson.contentType === "ASSIGNMENT" && lesson.assignmentInstructions && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="mb-2 flex items-center gap-2 font-medium text-amber-900"><ClipboardCheck className="h-4 w-4" /> Assignment</p>
            <p className="whitespace-pre-wrap text-sm text-amber-900">{lesson.assignmentInstructions}</p>
          </div>
        )}

        {lesson.notes && (
          <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
            <p className="mb-1 font-medium text-slate-700">Notes</p>
            {lesson.notes}
          </div>
        )}

        {lesson.materials.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-slate-700">Additional Materials</p>
            {lesson.materials.map((m) => (
              <a key={m.id} href={m.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700">
                <Download className="h-3.5 w-3.5" /> {m.title}
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <LessonCompleteButton lessonId={lessonId} courseId={courseId} initiallyCompleted={progress?.completed ?? false} />
        <div className="flex items-center gap-2">
          {prevLesson && (
            <Link href={`/student/courses/${courseId}/lessons/${prevLesson.id}`} className="inline-flex h-10 items-center gap-1 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <ChevronLeft className="h-4 w-4" /> Previous
            </Link>
          )}
          {nextLesson && (
            <Link href={`/student/courses/${courseId}/lessons/${nextLesson.id}`} className="inline-flex h-10 items-center gap-1 rounded-lg bg-brand-600 px-3 text-sm font-medium text-white hover:bg-brand-700">
              Next <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
