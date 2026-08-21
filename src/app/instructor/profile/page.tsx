import { requireRole } from "@/lib/auth/guard";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { ProfileForm } from "@/components/shared/profile-form";
import { ChangePasswordForm } from "@/components/shared/change-password-form";
import { StatCard } from "@/components/ui/stat-card";
import { BookOpen, Users } from "lucide-react";

export const metadata = { title: "My Profile" };
export const dynamic = "force-dynamic";

export default async function InstructorProfilePage() {
  const session = await requireRole("INSTRUCTOR");
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { instructorProfile: true, coursesTeaching: { include: { _count: { select: { enrollments: true } } } } },
  });
  if (!user) return null;

  const totalStudents = user.coursesTeaching.reduce((sum, c) => sum + c._count.enrollments, 0);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Avatar name={user.name} src={user.avatarUrl} size="xl" />
        <div>
          <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
          <p className="text-sm text-slate-500">{user.email}</p>
          {user.instructorProfile?.title && <p className="text-sm text-slate-500">{user.instructorProfile.title}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Assigned Courses" value={user.coursesTeaching.length} icon={BookOpen} accent="brand" />
        <StatCard label="Total Students" value={totalStudents} icon={Users} accent="sky" />
      </div>

      <Card>
        <CardHeader><CardTitle>Profile Information</CardTitle></CardHeader>
        <CardContent>
          <ProfileForm
            role="INSTRUCTOR"
            name={user.name}
            email={user.email}
            phone={user.phone}
            bio={user.instructorProfile?.bio}
            title={user.instructorProfile?.title}
            expertise={user.instructorProfile?.expertise}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
        <CardContent><ChangePasswordForm /></CardContent>
      </Card>
    </div>
  );
}
