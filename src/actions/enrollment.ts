"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/guard";
import { prisma } from "@/lib/db/prisma";
import { logActivity } from "@/lib/db/activity";
import { createNotification } from "@/lib/db/notifications";

export type SimpleActionState = { success: boolean; message?: string };

export async function requestEnrollmentAction(courseId: string): Promise<SimpleActionState> {
  const session = await requireRole("STUDENT");

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || course.status !== "ACTIVE") {
    return { success: false, message: "This course is not available for enrollment." };
  }

  const existing = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId: session.userId, courseId } },
  });
  if (existing) {
    return { success: false, message: "You already have an enrollment request for this course." };
  }

  await prisma.enrollment.create({
    data: { studentId: session.userId, courseId, status: "PENDING" },
  });

  await logActivity(`${session.name} requested enrollment in "${course.title}"`, session.userId);
  await createNotification({
    userId: course.instructorId,
    type: "ENROLLMENT_REQUEST",
    title: "New enrollment request",
    message: `${session.name} requested to enroll in "${course.title}".`,
    link: `/instructor/courses/${course.id}/students`,
  });

  revalidatePath(`/courses/${course.slug}`);
  revalidatePath("/student/dashboard");
  return { success: true, message: "Enrollment request submitted. You'll be notified once it's approved." };
}

export async function approveEnrollmentAction(
  enrollmentId: string,
  approverRole: "SUPER_ADMIN" | "INSTRUCTOR"
): Promise<SimpleActionState> {
  const session = await requireRole([approverRole]);

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: { course: true, student: true },
  });
  if (!enrollment) return { success: false, message: "Enrollment not found." };

  if (approverRole === "INSTRUCTOR" && enrollment.course.instructorId !== session.userId) {
    return { success: false, message: "You can only manage enrollments for your own courses." };
  }

  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { status: "ACTIVE", approvedAt: new Date(), approvedById: session.userId },
  });

  await logActivity(
    `${enrollment.student.name}'s enrollment in "${enrollment.course.title}" was approved`,
    session.userId
  );
  await createNotification({
    userId: enrollment.studentId,
    type: "ENROLLMENT_APPROVED",
    title: "Enrollment approved",
    message: `Your enrollment in "${enrollment.course.title}" has been approved. Start learning now!`,
    link: `/student/courses/${enrollment.courseId}`,
  });

  revalidatePath("/instructor/students");
  revalidatePath("/admin/enrollments");
  revalidatePath("/student/dashboard");
  return { success: true, message: "Enrollment approved." };
}

export async function rejectEnrollmentAction(
  enrollmentId: string,
  approverRole: "SUPER_ADMIN" | "INSTRUCTOR"
): Promise<SimpleActionState> {
  const session = await requireRole([approverRole]);

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: { course: true, student: true },
  });
  if (!enrollment) return { success: false, message: "Enrollment not found." };

  if (approverRole === "INSTRUCTOR" && enrollment.course.instructorId !== session.userId) {
    return { success: false, message: "You can only manage enrollments for your own courses." };
  }

  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { status: "REJECTED" },
  });

  await createNotification({
    userId: enrollment.studentId,
    type: "ENROLLMENT_REJECTED",
    title: "Enrollment request declined",
    message: `Your enrollment request for "${enrollment.course.title}" was declined.`,
    link: `/courses/${enrollment.course.slug}`,
  });

  revalidatePath("/instructor/students");
  revalidatePath("/admin/enrollments");
  return { success: true, message: "Enrollment rejected." };
}

export async function removeEnrollmentAction(
  enrollmentId: string,
  actorRole: "SUPER_ADMIN" | "INSTRUCTOR"
): Promise<SimpleActionState> {
  const session = await requireRole([actorRole]);
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: { course: true },
  });
  if (!enrollment) return { success: false, message: "Enrollment not found." };
  if (actorRole === "INSTRUCTOR" && enrollment.course.instructorId !== session.userId) {
    return { success: false, message: "You can only manage your own courses." };
  }

  await prisma.enrollment.delete({ where: { id: enrollmentId } });
  revalidatePath("/instructor/students");
  revalidatePath("/admin/enrollments");
  return { success: true, message: "Student removed from course." };
}

export async function addStudentToCourseAction(
  courseId: string,
  studentEmail: string,
  actorRole: "SUPER_ADMIN" | "INSTRUCTOR"
): Promise<SimpleActionState> {
  const session = await requireRole([actorRole]);
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return { success: false, message: "Course not found." };
  if (actorRole === "INSTRUCTOR" && course.instructorId !== session.userId) {
    return { success: false, message: "You can only manage your own courses." };
  }

  const student = await prisma.user.findUnique({ where: { email: studentEmail.toLowerCase().trim() } });
  if (!student || student.role !== "STUDENT") {
    return { success: false, message: "No student account found with that email." };
  }

  const existing = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId: student.id, courseId } },
  });
  if (existing) return { success: false, message: "This student is already enrolled or has a pending request." };

  await prisma.enrollment.create({
    data: {
      studentId: student.id,
      courseId,
      status: "ACTIVE",
      approvedAt: new Date(),
      approvedById: session.userId,
    },
  });

  await createNotification({
    userId: student.id,
    type: "ENROLLMENT_APPROVED",
    title: "You've been enrolled in a course",
    message: `You were added to "${course.title}".`,
    link: `/student/courses/${course.id}`,
  });

  revalidatePath("/instructor/students");
  revalidatePath("/admin/enrollments");
  return { success: true, message: "Student added to course." };
}
