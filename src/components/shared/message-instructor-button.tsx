"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOrCreateConversationAction } from "@/actions/messages";

export function MessageInstructorButton({
  otherUserId,
  courseId,
  basePath,
  label = "Message Instructor",
}: {
  otherUserId: string;
  courseId?: string;
  basePath: string;
  label?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const result = await getOrCreateConversationAction(otherUserId, courseId);
      if (result.success && result.conversationId) {
        router.push(`${basePath}/${result.conversationId}`);
      } else {
        toast.error(result.message ?? "Could not start conversation.");
      }
    });
  };

  return (
    <Button variant="outline" onClick={handleClick} loading={pending}>
      <MessageSquare className="h-4 w-4" /> {label}
    </Button>
  );
}
