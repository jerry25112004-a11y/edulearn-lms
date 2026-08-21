import { requireRole } from "@/lib/auth/guard";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { ProfileForm } from "@/components/shared/profile-form";
import { ChangePasswordForm } from "@/components/shared/change-password-form";
import { StatCard } from "@/components/ui/stat-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { BookOpen, TrendingUp } from "lucide-react";

export const metadata = { title: "My Profile" };
export const dynamic = "force-dynamic";

export default async function StudentProfilePage() {
  const session = await requireRole("STUDENT");
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { studentProfile: true, enrollments: { where: { status: { in: ["ACTIVE", "APPROVED", "COMPLETED"] } } } },
  });
  if (!user) return null;

  const avgProgress =
    user.enrollments.length > 0
      ? user.enrollments.reduce((s, e) => s + e.progressPercent, 0) / user.enrollments.length
      : 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Avatar name={user.name} src={user.avatarUrl} size="xl" />
        <div>
          <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Enrolled Courses" value={user.enrollments.length} icon={BookOpen} accent="brand" />
        <StatCard label="Avg. Progress" value={`${Math.round(avgProgress)}%`} icon={TrendingUp} accent="emerald" />
      </div>
      <ProgressBar value={avgProgress} />

      <Card>
        <CardHeader><CardTitle>Profile Information</CardTitle></CardHeader>
        <CardContent>
          <ProfileForm role="STUDENT" name={user.name} email={user.email} phone={user.phone} bio={user.studentProfile?.bio} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
        <CardContent><ChangePasswordForm /></CardContent>
      </Card>
    </div>
  );
}
