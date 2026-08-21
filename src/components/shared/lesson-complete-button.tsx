"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleLessonCompleteAction } from "@/actions/progress";

export function LessonCompleteButton({
  lessonId,
  courseId,
  initiallyCompleted,
}: {
  lessonId: string;
  courseId: string;
  initiallyCompleted: boolean;
}) {
  const [completed, setCompleted] = React.useState(initiallyCompleted);
  const [pending, startTransition] = React.useTransition();
  const router = useRouter();

  const handleToggle = () => {
    const next = !completed;
    setCompleted(next);
    startTransition(async () => {
      const result = await toggleLessonCompleteAction(lessonId, courseId, next);
      if (result.success) {
        toast.success(result.message);
        if (result.id === "completed") toast.success("🎉 Course completed! Great work.");
        router.refresh();
      } else {
        setCompleted(!next);
        toast.error(result.message);
      }
    });
  };

  return (
    <Button variant={completed ? "success" : "primary"} onClick={handleToggle} loading={pending}>
      {completed ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
      {completed ? "Completed" : "Mark as Complete"}
    </Button>
  );
}
