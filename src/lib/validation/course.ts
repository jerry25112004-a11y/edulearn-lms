import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(80),
  description: z.string().trim().optional(),
  icon: z.string().trim().optional(),
});

export const courseSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(150),
  description: z.string().trim().min(20, "Description must be at least 20 characters"),
  categoryId: z.string().min(1, "Select a category"),
  instructorId: z.string().min(1, "Select an instructor").optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  duration: z.string().trim().min(1, "Duration is required"),
  objectives: z.string().trim().optional(),
  requirements: z.string().trim().optional(),
  thumbnailUrl: z.string().trim().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "INACTIVE", "COMPLETED"]).optional(),
});

export const moduleSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(150),
  description: z.string().trim().optional(),
});

export const lessonSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(150),
  contentType: z.enum(["VIDEO", "TEXT", "DOCUMENT", "EXTERNAL_LINK", "ASSIGNMENT"]),
  videoUrl: z.string().trim().optional(),
  textContent: z.string().trim().optional(),
  documentUrl: z.string().trim().optional(),
  externalUrl: z.string().trim().optional(),
  assignmentInstructions: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  durationMinutes: z.coerce.number().int().positive().optional(),
});

export const meetingSchema = z.object({
  courseId: z.string().min(1, "Select a course"),
  title: z.string().trim().min(3, "Title is required"),
  description: z.string().trim().optional(),
  meetingLink: z.string().trim().url("Enter a valid meeting URL"),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
});

export const announcementSchema = z.object({
  courseId: z.string().min(1, "Select a course"),
  title: z.string().trim().min(3, "Title is required"),
  content: z.string().trim().min(5, "Content is required"),
});
