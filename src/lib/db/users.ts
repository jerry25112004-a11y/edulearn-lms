import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

export async function getStudents(q?: string) {
  const where: Prisma.UserWhereInput = {
    role: "STUDENT",
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  return prisma.user.findMany({
    where,
    include: {
      studentProfile: true,
      enrollments: { include: { course: { select: { title: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getStudentDetail(id: string) {
  return prisma.user.findUnique({
    where: { id, role: "STUDENT" },
    include: {
      studentProfile: true,
      enrollments: {
        include: { course: { select: { id: true, title: true, slug: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getInstructors(q?: string) {
  const where: Prisma.UserWhereInput = {
    role: "INSTRUCTOR",
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  return prisma.user.findMany({
    where,
    include: {
      instructorProfile: true,
      coursesTeaching: { select: { id: true, _count: { select: { enrollments: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getInstructorDetail(id: string) {
  return prisma.user.findUnique({
    where: { id, role: "INSTRUCTOR" },
    include: {
      instructorProfile: true,
      coursesTeaching: {
        include: { category: true, _count: { select: { enrollments: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getAllInstructorsBasic() {
  return prisma.user.findMany({
    where: { role: "INSTRUCTOR", status: "ACTIVE" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}
