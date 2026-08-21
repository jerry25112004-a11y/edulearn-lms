import Link from "next/link";
import { getOptionalUser } from "@/lib/auth/guard";
import { dashboardPathForRole } from "@/lib/auth/guard";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { MobileNav } from "./mobile-nav";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export async function SiteHeader() {
  const session = await getOptionalUser();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-[var(--background)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="font-ui hidden items-center gap-9 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative py-1 text-[13px] font-semibold uppercase tracking-[0.08em] text-slate-500 transition-colors hover:text-slate-900"
            >
              {link.label}
              <span className="absolute inset-x-0 -bottom-0.5 h-px scale-x-0 bg-brand-600 transition-transform duration-200 group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          {session ? (
            <Link href={dashboardPathForRole(session.role)}>
              <Button size="sm">Go to Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>
        <MobileNav links={NAV_LINKS} isAuthed={!!session} dashboardHref={session ? dashboardPathForRole(session.role) : undefined} />
      </div>
    </header>
  );
}
