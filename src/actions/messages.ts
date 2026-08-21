"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/guard";
import { prisma } from "@/lib/db/prisma";
import { createNotification } from "@/lib/db/notifications";
import type { ActionState } from "./auth";

/** Finds or creates a conversation between a student and instructor, optionally scoped to a course. */
export async function getOrCreateConversationAction(
  otherUserId: string,
  courseId?: string
): Promise<{ success: boolean; conversationId?: string; message?: string }> {
  const session = await requireUser();

  let studentId: string;
  let instructorId: string;
  if (session.role === "STUDENT") {
    studentId = session.userId;
    instructorId = otherUserId;
  } else if (session.role === "INSTRUCTOR") {
    studentId = otherUserId;
    instructorId = session.userId;
  } else {
    return { success: false, message: "Only students and instructors can message each other." };
  }

  const existing = await prisma.conversation.findFirst({
    where: { studentId, instructorId, courseId: courseId ?? null },
  });
  if (existing) return { success: true, conversationId: existing.id };

  const created = await prisma.conversation.create({
    data: { studentId, instructorId, courseId: courseId ?? null },
  });
  return { success: true, conversationId: created.id };
}

export async function sendMessageAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireUser();
  const conversationId = formData.get("conversationId") as string;
  const content = (formData.get("content") as string)?.trim();
  if (!content) return { success: false, message: "Message cannot be empty." };

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { student: true, instructor: true },
  });
  if (!conversation) return { success: false, message: "Conversation not found." };
  if (conversation.studentId !== session.userId && conversation.instructorId !== session.userId) {
    return { success: false, message: "You are not part of this conversation." };
  }

  await prisma.message.create({
    data: { conversationId, senderId: session.userId, content },
  });
  await prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });

  const recipientId = conversation.studentId === session.userId ? conversation.instructorId : conversation.studentId;
  await createNotification({
    userId: recipientId,
    type: "NEW_MESSAGE",
    title: `New message from ${session.name}`,
    message: content.slice(0, 120),
    link: session.role === "STUDENT" ? `/instructor/messages/${conversationId}` : `/student/messages/${conversationId}`,
  });

  revalidatePath(`/student/messages/${conversationId}`);
  revalidatePath(`/instructor/messages/${conversationId}`);
  revalidatePath("/student/messages");
  revalidatePath("/instructor/messages");
  return { success: true };
}

export async function markConversationReadAction(conversationId: string) {
  const session = await requireUser();
  await prisma.message.updateMany({
    where: { conversationId, senderId: { not: session.userId }, isRead: false },
    data: { isRead: true },
  });
}
