import { Target, Users, Rocket, HeartHandshake } from "lucide-react";
import { getPlatformStats } from "@/lib/db/courses";

export const metadata = { title: "About Us" };
export const dynamic = "force-dynamic";

const VALUES = [
  {
    icon: Target,
    title: "Outcome-Focused",
    description: "Every course is built around real, practical skills — not just passive video watching.",
  },
  {
    icon: Users,
    title: "Community-Driven",
    description: "Direct messaging and live classes keep students connected to real instructors.",
  },
  {
    icon: Rocket,
    title: "Always Improving",
    description: "We track progress and outcomes to continuously improve every course we publish.",
  },
  {
    icon: HeartHandshake,
    title: "Accessible Learning",
    description: "Flexible, affordable and available on any device — learning that fits your life.",
  },
];

export default async function AboutPage() {
  const stats = await getPlatformStats();
  return (
    <div>
      <section className="border-b border-slate-200 bg-slate-50 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">About EduLearn</h1>
          <p className="font-ui mt-4 text-lg text-slate-600">
            EduLearn is a complete online learning management platform built to help students go
            from curious to capable — through structured courses, live instruction, and honest
            progress tracking.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Our Mission</h2>
            <p className="mt-4 text-slate-600">
              We believe learning platforms should do more than host videos. EduLearn combines
              course management, live meetings, messaging, and analytics into a single system so
              instructors can teach effectively and students can actually finish what they start.
            </p>
            <p className="mt-4 text-slate-600">
              Whether you are an instructor building a curriculum or a student working through
              your first course, EduLearn gives you the structure and visibility to succeed.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Students", value: stats.students },
              { label: "Instructors", value: stats.instructors },
              { label: "Active Courses", value: stats.courses },
              { label: "Enrollments", value: stats.enrollments },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                <p className="text-3xl font-bold text-brand-600">{s.value}</p>
                <p className="mt-1 text-sm text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-slate-900">What We Value</h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <div key={v.title} className="rounded-xl border border-slate-200 bg-white p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <v.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{v.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
