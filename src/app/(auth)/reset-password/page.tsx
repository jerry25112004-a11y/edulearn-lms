import Link from "next/link";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata = { title: "Reset Password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">Reset your password</h1>
        <p className="mt-1 text-sm text-slate-500">Choose a new password for your account.</p>
      </div>
      <div className="mt-6">
        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <p className="text-center text-sm text-rose-600">
            Missing reset token. Please use the link from your password reset email.
          </p>
        )}
      </div>
      <p className="mt-6 text-center text-sm text-slate-500">
        <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
