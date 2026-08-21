import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { CourseLevel, Prisma } from "@prisma/client";

export type CourseFilters = {
  q?: string;
  categoryId?: string;
  instructorId?: string;
  level?: CourseLevel;
};

export async function getPublicCourses(filters: CourseFilters = {}) {
  const where: Prisma.CourseWhereInput = {
    status: "ACTIVE",
    ...(filters.q
      ? { title: { contains: filters.q, mode: "insensitive" } }
      : {}),
    ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
    ...(filters.instructorId ? { instructorId: filters.instructorId } : {}),
    ...(filters.level ? { level: filters.level } : {}),
  };

  return prisma.course.findMany({
    where,
    include: {
      category: true,
      instructor: { select: { id: true, name: true, avatarUrl: true } },
      _count: { select: { enrollments: true, modules: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getFeaturedCourses(limit = 6) {
  return prisma.course.findMany({
    where: { status: "ACTIVE" },
    include: {
      category: true,
      instructor: { select: { id: true, name: true, avatarUrl: true } },
      _count: { select: { enrollments: true } },
    },
    orderBy: { enrollments: { _count: "desc" } },
    take: limit,
  });
}

export async function getCourseBySlug(slug: string) {
  return prisma.course.findUnique({
    where: { slug },
    include: {
      category: true,
      instructor: {
        select: { id: true, name: true, avatarUrl: true, instructorProfile: true },
      },
      modules: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
      _count: { select: { enrollments: true } },
    },
  });
}

export async function getActiveCategories() {
  return prisma.category.findMany({
    where: { status: "ACTIVE" },
    include: { _count: { select: { courses: true } } },
    orderBy: { name: "asc" },
  });
}

export async function getPlatformStats() {
  const [students, instructors, courses, enrollments] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "INSTRUCTOR" } }),
    prisma.course.count({ where: { status: "ACTIVE" } }),
    prisma.enrollment.count(),
  ]);
  return { students, instructors, courses, enrollments };
}
