import { prisma } from "@/lib/db/prisma";
import { DashboardSidebar, type NavItem } from "./dashboard-sidebar";
import { NotificationBell } from "./notification-bell";
import { UserMenu } from "./user-menu";
import type { SessionPayload } from "@/lib/auth/session";

export async function DashboardShell({
  session,
  navItems,
  roleLabel,
  profileHref,
  title,
  description,
  actions,
  children,
}: {
  session: SessionPayload;
  navItems: NavItem[];
  roleLabel: string;
  profileHref: string;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [notifications, unreadCount, user] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.notification.count({ where: { userId: session.userId, isRead: false } }),
    prisma.user.findUnique({ where: { id: session.userId }, select: { avatarUrl: true } }),
  ]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar items={navItems} roleLabel={roleLabel} />
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <div className="lg:hidden">
            <span className="text-sm font-semibold text-slate-900">EduLearn</span>
          </div>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-2">
            <NotificationBell
              initialNotifications={notifications.map((n) => ({
                id: n.id,
                title: n.title,
                message: n.message,
                link: n.link,
                isRead: n.isRead,
                createdAt: n.createdAt.toISOString(),
              }))}
              unreadCount={unreadCount}
            />
            <UserMenu name={session.name} email={session.email} avatarUrl={user?.avatarUrl} profileHref={profileHref} />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {(title || actions) && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                {title && <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>}
                {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
              </div>
              {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
