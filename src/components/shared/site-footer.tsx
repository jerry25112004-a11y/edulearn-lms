import Link from "next/link";
import { Logo } from "./logo";
import { Globe, Mail, MessageCircle, Link2 } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2">
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-slate-500">
              A complete online learning platform to help students build real skills through
              structured courses, live classes, and hands-on progress tracking.
            </p>
            <div className="mt-4 flex gap-2 text-slate-400">
              {[Globe, MessageCircle, Mail, Link2].map((Icon, i) => (
                <span
                  key={i}
                  className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-brand-50 hover:text-brand-600"
                >
                  <Icon className="h-4.5 w-4.5" />
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Platform</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li><Link href="/courses" className="hover:text-brand-600">Courses</Link></li>
              <li><Link href="/about" className="hover:text-brand-600">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-brand-600">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Account</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li><Link href="/login" className="hover:text-brand-600">Log in</Link></li>
              <li><Link href="/register" className="hover:text-brand-600">Register</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Categories</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li><Link href="/courses" className="hover:text-brand-600">Web Development</Link></li>
              <li><Link href="/courses" className="hover:text-brand-600">Data & AI</Link></li>
              <li><Link href="/courses" className="hover:text-brand-600">UI/UX Design</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} EduLearn. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
