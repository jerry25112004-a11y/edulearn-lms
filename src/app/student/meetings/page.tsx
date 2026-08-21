import { requireRole } from "@/lib/auth/guard";
import { getStudentMeetings, getEffectiveMeetingStatus } from "@/lib/db/meetings";
import { MeetingList } from "@/components/shared/meeting-list";

export const metadata = { title: "Meetings" };
export const dynamic = "force-dynamic";

export default async function StudentMeetingsPage() {
  const session = await requireRole("STUDENT");
  const meetings = await getStudentMeetings(session.userId);

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Meetings</h1>
        <p className="mt-1 text-sm text-slate-500">Your scheduled live classes</p>
      </div>
      <MeetingList meetings={rows} courses={[]} canManage={false} showJoin />
    </div>
  );
}
