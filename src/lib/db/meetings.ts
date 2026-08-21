import "server-only";
import { prisma } from "@/lib/db/prisma";

export function getEffectiveMeetingStatus(meeting: { status: string; startTime: Date; endTime: Date }) {
  if (meeting.status === "CANCELLED") return "CANCELLED";
  const now = new Date();
  if (now < meeting.startTime) return "UPCOMING";
  if (now >= meeting.startTime && now <= meeting.endTime) return "LIVE";
  return "COMPLETED";
}

export async function getInstructorMeetings(instructorId: string) {
  return prisma.meeting.findMany({
    where: { instructorId },
    include: { course: { select: { id: true, title: true } } },
    orderBy: { startTime: "asc" },
  });
}

export async function getStudentMeetings(studentId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId, status: { in: ["ACTIVE", "APPROVED", "COMPLETED"] } },
    select: { courseId: true },
  });
  const courseIds = enrollments.map((e) => e.courseId);
  if (courseIds.length === 0) return [];
  return prisma.meeting.findMany({
    where: { courseId: { in: courseIds } },
    include: { course: { select: { id: true, title: true } }, instructor: { select: { name: true } } },
    orderBy: { startTime: "asc" },
  });
}

export async function getAllMeetings() {
  return prisma.meeting.findMany({
    include: { course: { select: { id: true, title: true } }, instructor: { select: { name: true } } },
    orderBy: { startTime: "asc" },
  });
}
