import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Award,
  Video,
  MessageSquare,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/shared/course-card";
import { getFeaturedCourses, getActiveCategories, getPlatformStats } from "@/lib/db/courses";
import { CourseThumbnail } from "@/components/shared/course-thumbnail";
import { ProgressBar } from "@/components/ui/progress-bar";

type CategoryWithCount = {
  id: string;
  name: string;
  slug: string;
  status: string;
  description: string | null;
  icon: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: { courses: number };
};

type CourseCardLike = {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string | null;
  categoryId: string;
  instructorId: string;
  level: string;
  duration: string;
  objectives: string[];
  requirements: string[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
  category: { name: string; slug: string };
  instructor: { name: string };
  _count: { enrollments: number };
};

export const dynamic = "force-dynamic";

const WHY_CHOOSE = [
  {
    icon: Video,
    title: "Live & Self-Paced Learning",
    description: "Join live instructor-led classes via Google Meet, or learn on your own schedule with on-demand lessons.",
  },
  {
    icon: BarChart3,
    title: "Real Progress Tracking",
    description: "Every completed lesson updates your progress automatically, so you always know exactly where you stand.",
  },
  {
    icon: MessageSquare,
    title: "Direct Instructor Access",
    description: "Message your instructor, ask questions and get replies right inside the platform.",
  },
  {
    icon: Award,
    title: "Structured Curriculum",
    description: "Courses are organized into modules and lessons so you build skills step by step.",
  },
];

const PREVIEW_ROWS = [
  { title: "Full Stack Web Development", categorySlug: "web-development", progress: 68 },
  { title: "Machine Learning Foundations", categorySlug: "ai-machine-learning", progress: 42 },
  { title: "UI/UX Design Principles", categorySlug: "ui-ux-design", progress: 90 },
];

export default async function HomePage() {
  const [featuredCourses, categories, stats] = await Promise.all([
    getFeaturedCourses(6),
    getActiveCategories(),
    getPlatformStats(),
  ]) as [CourseCardLike[], CategoryWithCount[], { students: number; instructors: number; courses: number; enrollments: number }];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-14 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-24">
          <div className="animate-fade-up">
            <span className="font-ui inline-flex items-center gap-1.5 rounded-sm border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
              Practical Online Learning
            </span>
            <h1 className="text-balance mt-5 text-[2.75rem] leading-[1.08] font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Learn new skills with expert-led online courses
            </h1>
            <p className="font-ui mt-5 max-w-xl text-lg leading-8 text-slate-600">
              EduLearn brings structured courses, live classes, real progress tracking and direct
              instructor support together in one place — everything you need to actually finish
              what you start.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/courses">
                <Button size="lg">
                  Browse Courses <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline">
                  Create Free Account
                </Button>
              </Link>
            </div>
            <div className="font-ui mt-10 grid grid-cols-3 gap-6 border-t border-slate-200 pt-6">
              <div>
                <p className="font-serif text-2xl font-semibold text-slate-900">{stats.students}+</p>
                <p className="text-sm text-slate-500">Students</p>
              </div>
              <div>
                <p className="font-serif text-2xl font-semibold text-slate-900">{stats.courses}+</p>
                <p className="text-sm text-slate-500">Active Courses</p>
              </div>
              <div>
                <p className="font-serif text-2xl font-semibold text-slate-900">{stats.instructors}+</p>
                <p className="text-sm text-slate-500">Instructors</p>
              </div>
            </div>
          </div>

          {/* Product preview panel — a framed snapshot of the real dashboard UI,
              rather than decorative gradient shapes. */}
          <div className="animate-fade-up relative" style={{ animationDelay: "80ms" }}>
            <div className="absolute -inset-3 -z-10 rounded-xl border border-slate-200 bg-slate-50" />
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft-lg">
              <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                <span className="font-ui ml-3 text-xs font-medium text-slate-400">My Courses</span>
              </div>
              <div className="divide-y divide-slate-100">
                {PREVIEW_ROWS.map((row) => (
                  <div key={row.title} className="flex items-center gap-3 p-4">
                    <CourseThumbnail title={row.title} categorySlug={row.categorySlug} className="h-12 w-16 shrink-0 rounded-md" />
                    <div className="min-w-0 flex-1">
                      <p className="font-ui truncate text-sm font-semibold text-slate-900">{row.title}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <ProgressBar value={row.progress} className="h-1.5" />
                        <span className="font-ui shrink-0 text-xs font-medium text-slate-500">{row.progress}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Explore Categories</h2>
            <p className="font-ui mt-1 text-slate-500">Find the right track for your next skill.</p>
          </div>
          <Link href="/courses" className="font-ui hidden text-sm font-medium text-brand-700 hover:text-brand-800 sm:block">
            View all courses →
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/courses?category=${cat.id}`}
              className="group flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-5 shadow-soft transition-colors duration-150 hover:border-brand-300"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <BookOpen className="h-4.5 w-4.5" />
              </span>
              <span className="font-ui font-semibold text-slate-900 group-hover:text-brand-700">{cat.name}</span>
              <span className="font-ui text-xs text-slate-500">{cat._count.courses} courses</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured courses */}
      <section className="border-y border-slate-200 bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Featured Courses</h2>
              <p className="font-ui mt-1 text-slate-500">Popular picks chosen by our students.</p>
            </div>
            <Link href="/courses" className="font-ui hidden text-sm font-medium text-brand-700 hover:text-brand-800 sm:block">
              View all courses →
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-slate-900">Why Choose EduLearn</h2>
          <p className="font-ui mx-auto mt-2 max-w-2xl text-slate-500">
            A full learning management experience, not just a list of videos.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_CHOOSE.map((item) => (
            <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-soft">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">{item.title}</h3>
              <p className="font-ui mt-2 text-sm text-slate-500">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats band */}
      <section className="bg-slate-900">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-14 text-center sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            { label: "Enrolled Students", value: `${stats.students}+` },
            { label: "Expert Instructors", value: `${stats.instructors}+` },
            { label: "Active Courses", value: `${stats.courses}+` },
            { label: "Total Enrollments", value: `${stats.enrollments}+` },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-serif text-3xl font-semibold text-white">{s.value}</p>
              <p className="font-ui mt-1 text-sm text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <CheckCircle2 className="mx-auto h-9 w-9 text-brand-600" strokeWidth={1.5} />
        <h2 className="mt-4 text-3xl font-semibold text-slate-900">Ready to start learning?</h2>
        <p className="font-ui mx-auto mt-3 max-w-xl text-slate-500">
          Create your free account today and enroll in your first course in minutes.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/register">
            <Button size="lg">Get Started for Free</Button>
          </Link>
          <Link href="/courses">
            <Button size="lg" variant="outline">
              Browse Courses
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
