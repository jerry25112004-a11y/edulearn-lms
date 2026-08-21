import { prisma } from "@/lib/db/prisma";
import { getAllMeetings, getEffectiveMeetingStatus } from "@/lib/db/meetings";
import { AddMeetingButton } from "@/components/shared/meeting-form-dialog";
import { MeetingList } from "@/components/shared/meeting-list";

export const metadata = { title: "Manage Meetings" };
export const dynamic = "force-dynamic";

export default async function AdminMeetingsPage() {
  const [meetings, courses] = await Promise.all([
    getAllMeetings(),
    prisma.course.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }),
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
    instructorName: m.instructor.name,
  }));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Meetings</h1>
          <p className="mt-1 text-sm text-slate-500">All scheduled live classes across the platform</p>
        </div>
        <AddMeetingButton courses={courses} />
      </div>
      <MeetingList meetings={rows} courses={courses} canManage showJoin={false} />
    </div>
  );
}
