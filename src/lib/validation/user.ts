import { z } from "zod";

export const createStudentSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email").toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().trim().optional(),
});

export const updateStudentSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email").toLowerCase(),
  phone: z.string().trim().optional(),
  bio: z.string().trim().optional(),
});

export const createInstructorSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email").toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().trim().optional(),
  title: z.string().trim().optional(),
  bio: z.string().trim().optional(),
  expertise: z.string().trim().optional(),
});

export const updateInstructorSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email").toLowerCase(),
  phone: z.string().trim().optional(),
  title: z.string().trim().optional(),
  bio: z.string().trim().optional(),
  expertise: z.string().trim().optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  phone: z.string().trim().optional(),
  bio: z.string().trim().optional(),
  title: z.string().trim().optional(),
  expertise: z.string().trim().optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
