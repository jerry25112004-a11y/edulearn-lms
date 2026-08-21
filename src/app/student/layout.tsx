import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Video,
  MessageSquare,
  Bell,
  User,
} from "lucide-react";
import { requireRole } from "@/lib/auth/guard";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import type { NavItem } from "@/components/shared/dashboard-sidebar";

const NAV_ITEMS: NavItem[] = [
  { href: "/student/dashboard", label: "Dashboard", icon: <LayoutDashboard />, exact: true },
  { href: "/student/courses", label: "My Courses", icon: <BookOpen /> },
  { href: "/student/progress", label: "Progress", icon: <BarChart3 />, exact: true },
  { href: "/student/meetings", label: "Meetings", icon: <Video /> },
  { href: "/student/messages", label: "Messages", icon: <MessageSquare /> },
  { href: "/student/notifications", label: "Notifications", icon: <Bell />, exact: true },
  { href: "/student/profile", label: "Profile", icon: <User /> },
];

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("STUDENT");
  return (
    <DashboardShell session={session} navItems={NAV_ITEMS} roleLabel="Student" profileHref="/student/profile">
      {children}
    </DashboardShell>
  );
}
