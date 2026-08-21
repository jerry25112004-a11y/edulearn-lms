import { FolderKanban } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { AddCategoryButton, EditCategoryButton } from "./category-form-dialog";
import { CategoryRowActions } from "./category-row-actions";

export const metadata = { title: "Manage Categories" };
export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { courses: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
          <p className="mt-1 text-sm text-slate-500">{categories.length} categories</p>
        </div>
        <AddCategoryButton />
      </div>

      {categories.length === 0 ? (
        <EmptyState icon={FolderKanban} title="No categories yet" description="Create your first course category to get started." />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH>Description</TH>
              <TH>Courses</TH>
              <TH>Status</TH>
              <TH>Actions</TH>
            </TR>
          </THead>
          <TBody>
            {categories.map((cat) => (
              <TR key={cat.id}>
                <TD className="font-medium text-slate-900">{cat.name}</TD>
                <TD className="max-w-xs truncate text-slate-500">{cat.description || "—"}</TD>
                <TD>{cat._count.courses}</TD>
                <TD><StatusBadge status={cat.status} /></TD>
                <TD>
                  <div className="flex items-center gap-1">
                    <EditCategoryButton category={cat} />
                    <CategoryRowActions id={cat.id} status={cat.status} courseCount={cat._count.courses} />
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
