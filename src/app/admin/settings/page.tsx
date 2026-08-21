import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChangePasswordForm } from "@/components/shared/change-password-form";
import { getAdminDashboardStats } from "@/lib/db/admin-stats";
import { requireRole } from "@/lib/auth/guard";

export const metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireRole("SUPER_ADMIN");
  const stats = await getAdminDashboardStats();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Platform configuration and account security</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Overview</CardTitle>
          <CardDescription>Live snapshot of platform scale</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-slate-500">Students</dt>
              <dd className="text-lg font-semibold text-slate-900">{stats.totalStudents}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Instructors</dt>
              <dd className="text-lg font-semibold text-slate-900">{stats.totalInstructors}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Courses</dt>
              <dd className="text-lg font-semibold text-slate-900">{stats.totalCourses}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Enrollments</dt>
              <dd className="text-lg font-semibold text-slate-900">{stats.totalEnrollments}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Security</CardTitle>
          <CardDescription>Update the password used to log in to the Super Admin account.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environment</CardTitle>
          <CardDescription>
            Database connection, authentication secrets and email configuration are managed through
            environment variables. See the project README for full deployment instructions.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
