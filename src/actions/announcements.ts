"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/guard";
import { prisma } from "@/lib/db/prisma";
import { announcementSchema } from "@/lib/validation/course";
import { createNotificationsForMany } from "@/lib/db/notifications";
import { logActivity } from "@/lib/db/activity";
import type { ActionState } from "./auth";

export async function createAnnouncementAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireRole("INSTRUCTOR");
  const parsed = announcementSchema.safeParse({
    courseId: formData.get("courseId"),
    title: formData.get("title"),
    content: formData.get("content"),
  });
  if (!parsed.success) return { success: false, errors: parsed.error.flatten().fieldErrors };

  const course = await prisma.course.findUnique({ where: { id: parsed.data.courseId } });
  if (!course || course.instructorId !== session.userId) {
    return { success: false, message: "You can only post announcements for your own courses." };
  }

  const announcement = await prisma.announcement.create({
    data: { courseId: course.id, instructorId: session.userId, title: parsed.data.title, content: parsed.data.content },
  });

  const enrollments = await prisma.enrollment.findMany({
    where: { courseId: course.id, status: { in: ["ACTIVE", "APPROVED"] } },
    select: { studentId: true },
  });
  await createNotificationsForMany(
    enrollments.map((e) => e.studentId),
    {
      type: "ANNOUNCEMENT",
      title: `Announcement: ${announcement.title}`,
      message: announcement.content,
      link: `/student/courses/${course.id}`,
    }
  );
  await logActivity(`Announcement posted for "${course.title}"`, session.userId);

  revalidatePath("/instructor/announcements");
  revalidatePath(`/student/courses/${course.id}`);
  return { success: true, message: "Announcement posted." };
}

export async function deleteAnnouncementAction(id: string): Promise<ActionState> {
  const session = await requireRole("INSTRUCTOR");
  const announcement = await prisma.announcement.findUnique({ where: { id } });
  if (!announcement || announcement.instructorId !== session.userId) {
    return { success: false, message: "You can only delete your own announcements." };
  }
  await prisma.announcement.delete({ where: { id } });
  revalidatePath("/instructor/announcements");
  return { success: true, message: "Announcement deleted." };
}
