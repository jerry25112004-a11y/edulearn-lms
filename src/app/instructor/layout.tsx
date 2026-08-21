import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  Users,
  Video,
  MessageSquare,
  Megaphone,
  User,
} from "lucide-react";
import { requireRole } from "@/lib/auth/guard";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import type { NavItem } from "@/components/shared/dashboard-sidebar";

const NAV_ITEMS: NavItem[] = [
  { href: "/instructor/dashboard", label: "Dashboard", icon: <LayoutDashboard />, exact: true },
  { href: "/instructor/courses", label: "My Courses", icon: <BookOpen /> },
  { href: "/instructor/courses/new", label: "Create Course", icon: <PlusCircle />, exact: true },
  { href: "/instructor/students", label: "Students", icon: <Users /> },
  { href: "/instructor/meetings", label: "Meetings", icon: <Video /> },
  { href: "/instructor/messages", label: "Messages", icon: <MessageSquare /> },
  { href: "/instructor/announcements", label: "Announcements", icon: <Megaphone /> },
  { href: "/instructor/profile", label: "Profile", icon: <User /> },
];

export default async function InstructorLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("INSTRUCTOR");
  return (
    <DashboardShell session={session} navItems={NAV_ITEMS} roleLabel="Instructor" profileHref="/instructor/profile">
      {children}
    </DashboardShell>
  );
}
