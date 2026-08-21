import { Logo } from "@/components/shared/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <div className="flex justify-center pt-8">
        <Logo />
      </div>
      <div className="flex flex-1 items-center justify-center px-4 py-10">{children}</div>
    </div>
  );
}
