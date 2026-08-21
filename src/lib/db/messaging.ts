import "server-only";
import { prisma } from "@/lib/db/prisma";

export async function getConversationsForUser(userId: string, role: "STUDENT" | "INSTRUCTOR") {
  const conversations = await prisma.conversation.findMany({
    where: role === "STUDENT" ? { studentId: userId } : { instructorId: userId },
    include: {
      student: { select: { id: true, name: true, avatarUrl: true } },
      instructor: { select: { id: true, name: true, avatarUrl: true } },
      course: { select: { title: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { messages: { where: { isRead: false, senderId: { not: userId } } } } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return conversations.map((c) => {
    const other = role === "STUDENT" ? c.instructor : c.student;
    return {
      id: c.id,
      otherUserId: other.id,
      otherUserName: other.name,
      otherUserAvatar: other.avatarUrl,
      courseName: c.course?.title ?? null,
      lastMessage: c.messages[0]?.content ?? null,
      lastMessageAt: (c.messages[0]?.createdAt ?? c.createdAt).toISOString(),
      unreadCount: c._count.messages,
    };
  });
}

export async function getConversationThread(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      student: { select: { id: true, name: true } },
      instructor: { select: { id: true, name: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!conversation) return null;
  if (conversation.studentId !== userId && conversation.instructorId !== userId) return null;

  const otherUser = conversation.studentId === userId ? conversation.instructor : conversation.student;

  return {
    id: conversation.id,
    otherUserName: otherUser.name,
    messages: conversation.messages.map((m) => ({
      id: m.id,
      senderId: m.senderId,
      senderName: m.senderId === conversation.student.id ? conversation.student.name : conversation.instructor.name,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    })),
  };
}
