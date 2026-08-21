import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOptionalUser, dashboardPathForRole } from "@/lib/auth/guard";

export const metadata = { title: "Unauthorized" };

export default async function UnauthorizedPage() {
  const session = await getOptionalUser();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <h1 className="mt-6 text-2xl font-bold text-slate-900">Access Denied</h1>
      <p className="mt-2 max-w-sm text-slate-500">
        You don&apos;t have permission to view this page. If you believe this is a mistake,
        contact your platform administrator.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href={session ? dashboardPathForRole(session.role) : "/"}>
          <Button>Go to {session ? "Dashboard" : "Home"}</Button>
        </Link>
        {!session && (
          <Link href="/login">
            <Button variant="outline">Log In</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
