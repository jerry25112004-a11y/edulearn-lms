import Link from "next/link";
import { RegisterForm } from "./register-form";

export const metadata = { title: "Create Account" };

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">Join EduLearn as a student — it&apos;s free.</p>
      </div>
      <div className="mt-6">
        <RegisterForm />
      </div>
      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
          Log in
        </Link>
      </p>
      <p className="mt-3 text-center text-xs text-slate-400">
        Instructor and Super Admin accounts are created by the platform administrator.
      </p>
    </div>
  );
}
