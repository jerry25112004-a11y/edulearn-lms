import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Circle, Clock, Video, Megaphone, ExternalLink } from "lucide-react";
import { requireRole } from "@/lib/auth/guard";
import { getStudentCourseView } from "@/lib/db/student-course";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ProgressBar } from "@/components/ui/progress-bar";
import { CourseThumbnail } from "@/components/shared/course-thumbnail";
import { MessageInstructorButton } from "@/components/shared/message-instructor-button";
import { formatDate, formatTime, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StudentCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole("STUDENT");
  const { id } = await params;
  const view = await getStudentCourseView(session.userId, id);
  if (!view) notFound();

  const { enrollment, completedLessonIds, meetings, announcements } = view;
  const course = enrollment.course;
  const totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="w-full shrink-0 sm:w-56">
          <CourseThumbnail title={course.title} categorySlug={course.category.slug} thumbnailUrl={course.thumbnailUrl} className="rounded-xl" />
        </div>
        <div className="flex-1">
          <Badge variant="brand">{course.category.name}</Badge>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">{course.title}</h1>
          <p className="mt-2 text-sm text-slate-600">{course.description}</p>
          <div className="mt-4 flex items-center gap-3">
            <Avatar name={course.instructor.name} src={course.instructor.avatarUrl} size="sm" />
            <span className="text-sm text-slate-600">{course.instructor.name}</span>
            <MessageInstructorButton otherUserId={course.instructor.id} courseId={course.id} basePath="/student/messages" />
          </div>
          <div className="mt-4 max-w-sm">
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">Course Progress</span>
              <span className="text-slate-500">{completedLessonIds.size}/{totalLessons} lessons</span>
            </div>
            <ProgressBar value={enrollment.progressPercent} showLabel />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900">Course Content</h2>
          {course.modules.map((mod, mIdx) => (
            <details key={mod.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm" open={mIdx === 0}>
              <summary className="cursor-pointer bg-slate-50/70 px-4 py-3 text-sm font-semibold text-slate-900">
                Module {mIdx + 1}: {mod.title}
              </summary>
              <ul className="divide-y divide-slate-50">
                {mod.lessons.map((lesson) => {
                  const done = completedLessonIds.has(lesson.id);
                  return (
                    <li key={lesson.id}>
                      <Link
                        href={`/student/courses/${course.id}/lessons/${lesson.id}`}
                        className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50"
                      >
                        <span className="flex items-center gap-2.5 text-sm text-slate-700">
                          {done ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                          ) : (
                            <Circle className="h-4 w-4 shrink-0 text-slate-300" />
                          )}
                          <span className={cn(done && "text-slate-400 line-through")}>{lesson.title}</span>
                        </span>
                        {lesson.durationMinutes && (
                          <span className="flex shrink-0 items-center gap-1 text-xs text-slate-400">
                            <Clock className="h-3 w-3" /> {lesson.durationMinutes} min
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
                {mod.lessons.length === 0 && <li className="px-4 py-3 text-sm text-slate-400">No lessons yet.</li>}
              </ul>
            </details>
          ))}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Video className="h-4 w-4 text-brand-600" /> Upcoming Meetings
            </h3>
            {meetings.length === 0 ? (
              <p className="text-sm text-slate-400">No upcoming meetings scheduled.</p>
            ) : (
              <ul className="space-y-3">
                {meetings.map((m) => (
                  <li key={m.id} className="text-sm">
                    <p className="font-medium text-slate-800">{m.title}</p>
                    <p className="text-xs text-slate-500">{formatDate(m.startTime)} • {formatTime(m.startTime)}</p>
                    <a href={m.meetingLink} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700">
                      Join Meeting <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Megaphone className="h-4 w-4 text-brand-600" /> Announcements
            </h3>
            {announcements.length === 0 ? (
              <p className="text-sm text-slate-400">No announcements yet.</p>
            ) : (
              <ul className="space-y-3">
                {announcements.map((a) => (
                  <li key={a.id} className="text-sm">
                    <p className="font-medium text-slate-800">{a.title}</p>
                    <p className="text-xs text-slate-500">{a.content}</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">{formatDate(a.createdAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
