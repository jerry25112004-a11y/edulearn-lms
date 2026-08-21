import "server-only";
import { prisma } from "@/lib/db/prisma";

export async function logActivity(message: string, userId?: string) {
  await prisma.activityLog.create({
    data: { message, userId },
  });
}

export async function getRecentActivity(limit = 10) {
  return prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { user: { select: { name: true, role: true } } },
  });
}
