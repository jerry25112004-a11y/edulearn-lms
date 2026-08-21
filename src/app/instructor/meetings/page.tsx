import { requireRole } from "@/lib/auth/guard";
import { prisma } from "@/lib/db/prisma";
import { getInstructorMeetings, getEffectiveMeetingStatus } from "@/lib/db/meetings";
import { AddMeetingButton } from "@/components/shared/meeting-form-dialog";
import { MeetingList } from "@/components/shared/meeting-list";
import { StatCard } from "@/components/ui/stat-card";
import { CalendarClock, CalendarCheck, CalendarDays } from "lucide-react";

export const metadata = { title: "Meetings" };
export const dynamic = "force-dynamic";

export default async function InstructorMeetingsPage() {
  const session = await requireRole("INSTRUCTOR");
  const [meetings, courses] = await Promise.all([
    getInstructorMeetings(session.userId),
    prisma.course.findMany({ where: { instructorId: session.userId }, select: { id: true, title: true }, orderBy: { title: "asc" } }),
  ]);

  const rows = meetings.map((m) => ({
    id: m.id,
    courseId: m.courseId,
    title: m.title,
    description: m.description,
    meetingLink: m.meetingLink,
    startTime: m.startTime.toISOString(),
    endTime: m.endTime.toISOString(),
    status: m.status,
    effectiveStatus: getEffectiveMeetingStatus(m),
    courseName: m.course.title,
  }));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todaysClasses = rows.filter((r) => new Date(r.startTime) >= today && new Date(r.startTime) < tomorrow).length;
  const upcoming = rows.filter((r) => r.effectiveStatus === "UPCOMING").length;
  const completed = rows.filter((r) => r.effectiveStatus === "COMPLETED").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Meetings</h1>
          <p className="mt-1 text-sm text-slate-500">Schedule and manage your live classes</p>
        </div>
        <AddMeetingButton courses={courses} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Today's Classes" value={todaysClasses} icon={CalendarDays} accent="brand" />
        <StatCard label="Upcoming Classes" value={upcoming} icon={CalendarClock} accent="amber" />
        <StatCard label="Completed Classes" value={completed} icon={CalendarCheck} accent="emerald" />
      </div>

      <MeetingList meetings={rows} courses={courses} canManage showJoin />
    </div>
  );
}
