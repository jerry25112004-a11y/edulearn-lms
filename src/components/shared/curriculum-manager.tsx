"use client";

import * as React from "react";
import { toast } from "sonner";
import { ChevronUp, ChevronDown, Trash2, BookOpen, Video, FileText, Link2, ClipboardCheck, GripVertical } from "lucide-react";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { AddModuleButton, EditModuleButton } from "./module-form-dialog";
import { AddLessonButton, EditLessonButton, type LessonValues } from "./lesson-form-dialog";
import {
  deleteModuleAction,
  deleteLessonAction,
  reorderModuleAction,
  reorderLessonAction,
} from "@/actions/curriculum";

const CONTENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  VIDEO: Video,
  TEXT: FileText,
  DOCUMENT: FileText,
  EXTERNAL_LINK: Link2,
  ASSIGNMENT: ClipboardCheck,
};

export type CurriculumModule = {
  id: string;
  title: string;
  description: string | null;
  order: number;
  lessons: (LessonValues & { id: string; order: number })[];
};

export function CurriculumManager({ courseId, modules }: { courseId: string; modules: CurriculumModule[] }) {
  const confirm = useConfirm();
  const [pending, startTransition] = React.useTransition();

  const handleDeleteModule = async (id: string) => {
    const ok = await confirm({
      title: "Delete this module?",
      description: "All lessons inside this module will also be deleted.",
      confirmLabel: "Delete",
    });
    if (!ok) return;
    startTransition(async () => {
      const result = await deleteModuleAction(id);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  };

  const handleDeleteLesson = async (id: string) => {
    const ok = await confirm({ title: "Delete this lesson?", confirmLabel: "Delete" });
    if (!ok) return;
    startTransition(async () => {
      const result = await deleteLessonAction(id);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Course Content</h2>
          <p className="text-sm text-slate-500">Organize your course into modules and lessons.</p>
        </div>
        <AddModuleButton courseId={courseId} />
      </div>

      {modules.length === 0 ? (
        <EmptyState icon={BookOpen} title="No modules yet" description="Add your first module to start building the curriculum." />
      ) : (
        <div className="space-y-4">
          {modules.map((mod, mIdx) => (
            <div key={mod.id} className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-4">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-slate-300" />
                  <div>
                    <p className="font-semibold text-slate-900">
                      Module {mIdx + 1}: {mod.title}
                    </p>
                    {mod.description && <p className="text-xs text-slate-500">{mod.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    disabled={pending || mIdx === 0}
                    onClick={() => startTransition(() => { void reorderModuleAction(mod.id, "up"); })}
                    className="rounded p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-30"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    disabled={pending || mIdx === modules.length - 1}
                    onClick={() => startTransition(() => { void reorderModuleAction(mod.id, "down"); })}
                    className="rounded p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-30"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <EditModuleButton courseId={courseId} module={{ id: mod.id, title: mod.title, description: mod.description }} />
                  <button onClick={() => handleDeleteModule(mod.id)} className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="divide-y divide-slate-50 p-2">
                {mod.lessons.length === 0 ? (
                  <p className="px-3 py-4 text-sm text-slate-400">No lessons yet in this module.</p>
                ) : (
                  mod.lessons.map((lesson, lIdx) => {
                    const Icon = CONTENT_ICONS[lesson.contentType] ?? FileText;
                    return (
                      <div key={lesson.id} className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-50">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                          <span className="truncate text-sm text-slate-700">{lesson.title}</span>
                          <Badge variant="outline" className="shrink-0">{lesson.contentType.replace("_", " ").toLowerCase()}</Badge>
                          {lesson.durationMinutes ? <span className="shrink-0 text-xs text-slate-400">{lesson.durationMinutes} min</span> : null}
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            disabled={pending || lIdx === 0}
                            onClick={() => startTransition(() => { void reorderLessonAction(lesson.id, "up"); })}
                            className="rounded p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-30"
                          >
                            <ChevronUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            disabled={pending || lIdx === mod.lessons.length - 1}
                            onClick={() => startTransition(() => { void reorderLessonAction(lesson.id, "down"); })}
                            className="rounded p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-30"
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </button>
                          <EditLessonButton moduleId={mod.id} lesson={lesson} />
                          <button onClick={() => handleDeleteLesson(lesson.id)} className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
                <div className="px-3 pt-2">
                  <AddLessonButton moduleId={mod.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
