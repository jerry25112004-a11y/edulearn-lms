"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/guard";
import { prisma } from "@/lib/db/prisma";
import { meetingSchema } from "@/lib/validation/course";
import { createNotificationsForMany } from "@/lib/db/notifications";
import { logActivity } from "@/lib/db/activity";
import type { ActionState } from "./auth";

export async function createMeetingAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireRole(["SUPER_ADMIN", "INSTRUCTOR"]);
  const parsed = meetingSchema.safeParse({
    courseId: formData.get("courseId"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    meetingLink: formData.get("meetingLink"),
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
  });
  if (!parsed.success) return { success: false, errors: parsed.error.flatten().fieldErrors };

  const course = await prisma.course.findUnique({ where: { id: parsed.data.courseId } });
  if (!course) return { success: false, message: "Course not found." };
  if (session.role === "INSTRUCTOR" && course.instructorId !== session.userId) {
    return { success: false, message: "You can only schedule meetings for your own courses." };
  }

  const startTime = new Date(`${parsed.data.date}T${parsed.data.startTime}`);
  const endTime = new Date(`${parsed.data.date}T${parsed.data.endTime}`);
  if (endTime <= startTime) {
    return { success: false, errors: { endTime: ["End time must be after start time"] } };
  }

  const meeting = await prisma.meeting.create({
    data: {
      courseId: parsed.data.courseId,
      instructorId: course.instructorId,
      title: parsed.data.title,
      description: parsed.data.description,
      meetingLink: parsed.data.meetingLink,
      startTime,
      endTime,
    },
  });

  const enrollments = await prisma.enrollment.findMany({
    where: { courseId: course.id, status: { in: ["ACTIVE", "APPROVED"] } },
    select: { studentId: true },
  });
  await createNotificationsForMany(
    enrollments.map((e) => e.studentId),
    {
      type: "MEETING_SCHEDULED",
      title: "New class scheduled",
      message: `"${meeting.title}" for ${course.title} is scheduled on ${startTime.toLocaleString()}.`,
      link: "/student/meetings",
    }
  );
  await logActivity(`Meeting "${meeting.title}" scheduled for "${course.title}"`, session.userId);

  revalidatePath("/instructor/meetings");
  revalidatePath("/admin/meetings");
  revalidatePath("/student/meetings");
  return { success: true, message: "Meeting scheduled successfully." };
}

export async function updateMeetingAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireRole(["SUPER_ADMIN", "INSTRUCTOR"]);
  const id = formData.get("id") as string;
  const parsed = meetingSchema.safeParse({
    courseId: formData.get("courseId"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    meetingLink: formData.get("meetingLink"),
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
  });
  if (!parsed.success) return { success: false, errors: parsed.error.flatten().fieldErrors };

  const meeting = await prisma.meeting.findUnique({ where: { id } });
  if (!meeting) return { success: false, message: "Meeting not found." };
  if (session.role === "INSTRUCTOR" && meeting.instructorId !== session.userId) {
    return { success: false, message: "You can only manage your own meetings." };
  }

  const startTime = new Date(`${parsed.data.date}T${parsed.data.startTime}`);
  const endTime = new Date(`${parsed.data.date}T${parsed.data.endTime}`);

  await prisma.meeting.update({
    where: { id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      meetingLink: parsed.data.meetingLink,
      startTime,
      endTime,
    },
  });

  revalidatePath("/instructor/meetings");
  revalidatePath("/admin/meetings");
  revalidatePath("/student/meetings");
  return { success: true, message: "Meeting updated." };
}

export async function cancelMeetingAction(id: string): Promise<ActionState> {
  const session = await requireRole(["SUPER_ADMIN", "INSTRUCTOR"]);
  const meeting = await prisma.meeting.findUnique({ where: { id } });
  if (!meeting) return { success: false, message: "Meeting not found." };
  if (session.role === "INSTRUCTOR" && meeting.instructorId !== session.userId) {
    return { success: false, message: "You can only manage your own meetings." };
  }
  await prisma.meeting.update({ where: { id }, data: { status: "CANCELLED" } });
  revalidatePath("/instructor/meetings");
  revalidatePath("/admin/meetings");
  revalidatePath("/student/meetings");
  return { success: true, message: "Meeting cancelled." };
}

export async function deleteMeetingAction(id: string): Promise<ActionState> {
  const session = await requireRole(["SUPER_ADMIN", "INSTRUCTOR"]);
  const meeting = await prisma.meeting.findUnique({ where: { id } });
  if (!meeting) return { success: false, message: "Meeting not found." };
  if (session.role === "INSTRUCTOR" && meeting.instructorId !== session.userId) {
    return { success: false, message: "You can only manage your own meetings." };
  }
  await prisma.meeting.delete({ where: { id } });
  revalidatePath("/instructor/meetings");
  revalidatePath("/admin/meetings");
  revalidatePath("/student/meetings");
  return { success: true, message: "Meeting deleted." };
}
