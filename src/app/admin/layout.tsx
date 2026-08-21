import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  FolderKanban,
  ClipboardList,
  Video,
  BarChart3,
  Settings,
  User,
} from "lucide-react";
import { requireRole } from "@/lib/auth/guard";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import type { NavItem } from "@/components/shared/dashboard-sidebar";

const NAV_ITEMS: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard />, exact: true },
  { href: "/admin/students", label: "Students", icon: <GraduationCap /> },
  { href: "/admin/instructors", label: "Instructors", icon: <Users /> },
  { href: "/admin/courses", label: "Courses", icon: <BookOpen /> },
  { href: "/admin/categories", label: "Categories", icon: <FolderKanban /> },
  { href: "/admin/enrollments", label: "Enrollments", icon: <ClipboardList /> },
  { href: "/admin/meetings", label: "Meetings", icon: <Video /> },
  { href: "/admin/reports", label: "Reports", icon: <BarChart3 /> },
  { href: "/admin/settings", label: "Settings", icon: <Settings /> },
  { href: "/admin/profile", label: "Profile", icon: <User /> },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("SUPER_ADMIN");
  return (
    <DashboardShell session={session} navItems={NAV_ITEMS} roleLabel="Super Admin" profileHref="/admin/profile">
      {children}
    </DashboardShell>
  );
}
