import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata = { title: "Log In" };

export default function LoginPage() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Log in to continue your learning journey.</p>
      </div>
      <div className="mt-6">
        <LoginForm />
      </div>
      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-brand-600 hover:text-brand-700">
          Sign up for free
        </Link>
      </p>

      <div className="mt-6 rounded-lg bg-slate-50 p-4 text-xs text-slate-500">
        <p className="font-semibold text-slate-700">Demo accounts</p>
        <p className="mt-1">Super Admin: admin@edulearn.dev / Passw0rd!</p>
        <p>Instructor: sarah.chen@edulearn.dev / Passw0rd!</p>
        <p>Student: alex.morgan@edulearn.dev / Passw0rd!</p>
      </div>
    </div>
  );
}
