import { requireUser } from "@/lib/auth/guard";
import { prisma } from "@/lib/db/prisma";
import { NotificationsList } from "@/components/shared/notifications-list";

export const metadata = { title: "Notifications" };
export const dynamic = "force-dynamic";

export default async function StudentNotificationsPage() {
  const session = await requireUser();
  const notifications = await prisma.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Notifications</h1>
      <NotificationsList
        notifications={notifications.map((n) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          link: n.link,
          isRead: n.isRead,
          createdAt: n.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
