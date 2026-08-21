"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/guard";
import { prisma } from "@/lib/db/prisma";
import { slugify } from "@/lib/utils";
import { logActivity } from "@/lib/db/activity";
import { categorySchema } from "@/lib/validation/course";
import type { ActionState } from "./auth";

export async function createCategoryAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("SUPER_ADMIN");
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    icon: formData.get("icon") || undefined,
  });
  if (!parsed.success) return { success: false, errors: parsed.error.flatten().fieldErrors };

  const slug = slugify(parsed.data.name);
  const existing = await prisma.category.findFirst({ where: { OR: [{ name: parsed.data.name }, { slug }] } });
  if (existing) return { success: false, errors: { name: ["A category with this name already exists"] } };

  await prisma.category.create({ data: { ...parsed.data, slug } });
  await logActivity(`Category "${parsed.data.name}" was created`);
  revalidatePath("/admin/categories");
  return { success: true, message: "Category created successfully." };
}

export async function updateCategoryAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("SUPER_ADMIN");
  const id = formData.get("id") as string;
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    icon: formData.get("icon") || undefined,
  });
  if (!parsed.success) return { success: false, errors: parsed.error.flatten().fieldErrors };

  await prisma.category.update({
    where: { id },
    data: { ...parsed.data, slug: slugify(parsed.data.name) },
  });
  revalidatePath("/admin/categories");
  return { success: true, message: "Category updated successfully." };
}

export async function toggleCategoryStatusAction(id: string): Promise<ActionState> {
  await requireRole("SUPER_ADMIN");
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) return { success: false, message: "Category not found." };
  await prisma.category.update({
    where: { id },
    data: { status: category.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" },
  });
  revalidatePath("/admin/categories");
  return { success: true, message: "Category status updated." };
}

export async function deleteCategoryAction(id: string): Promise<ActionState> {
  await requireRole("SUPER_ADMIN");
  const courseCount = await prisma.course.count({ where: { categoryId: id } });
  if (courseCount > 0) {
    return { success: false, message: "This category has courses assigned. Reassign or delete them first." };
  }
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  return { success: true, message: "Category deleted." };
}
