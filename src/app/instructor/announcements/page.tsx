import { requireRole } from "@/lib/auth/guard";
import { prisma } from "@/lib/db/prisma";
import { EmptyState } from "@/components/ui/empty-state";
import { Megaphone } from "lucide-react";
import { AddAnnouncementButton } from "./announcement-form-dialog";
import { AnnouncementRow } from "./announcement-row";

export const metadata = { title: "Announcements" };
export const dynamic = "force-dynamic";

export default async function InstructorAnnouncementsPage() {
  const session = await requireRole("INSTRUCTOR");
  const [announcements, courses] = await Promise.all([
    prisma.announcement.findMany({
      where: { instructorId: session.userId },
      include: { course: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.course.findMany({ where: { instructorId: session.userId }, select: { id: true, title: true }, orderBy: { title: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Announcements</h1>
          <p className="mt-1 text-sm text-slate-500">Post updates that your enrolled students will see.</p>
        </div>
        <AddAnnouncementButton courses={courses} />
      </div>

      {announcements.length === 0 ? (
        <EmptyState icon={Megaphone} title="No announcements yet" description="Post your first course announcement to keep students informed." />
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <AnnouncementRow key={a.id} id={a.id} title={a.title} content={a.content} courseTitle={a.course.title} createdAt={a.createdAt.toISOString()} />
          ))}
        </div>
      )}
    </div>
  );
}
