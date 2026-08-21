"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/guard";
import { prisma } from "@/lib/db/prisma";

export async function markNotificationReadAction(id: string) {
  const session = await requireUser();
  await prisma.notification.updateMany({
    where: { id, userId: session.userId },
    data: { isRead: true },
  });
}

export async function markAllNotificationsReadAction() {
  const session = await requireUser();
  await prisma.notification.updateMany({
    where: { userId: session.userId, isRead: false },
    data: { isRead: true },
  });
  revalidatePath("/", "layout");
}
