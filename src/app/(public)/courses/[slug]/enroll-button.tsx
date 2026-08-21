"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { requestEnrollmentAction } from "@/actions/enrollment";
import type { EnrollmentStatus } from "@prisma/client";

export function EnrollButton({
  courseId,
  courseSlug,
  isAuthed,
  isStudent,
  enrollmentStatus,
}: {
  courseId: string;
  courseSlug: string;
  isAuthed: boolean;
  isStudent: boolean;
  enrollmentStatus?: EnrollmentStatus;
}) {
  const [pending, startTransition] = React.useTransition();

  if (!isAuthed) {
    return (
      <Link href={`/login?next=/courses/${courseSlug}`}>
        <Button className="w-full" size="lg">
          Log in to Enroll
        </Button>
      </Link>
    );
  }

  if (!isStudent) {
    return (
      <Button className="w-full" size="lg" disabled>
        Only students can enroll
      </Button>
    );
  }

  if (enrollmentStatus === "PENDING") {
    return (
      <Button className="w-full" size="lg" variant="outline" disabled>
        Enrollment Pending Approval
      </Button>
    );
  }

  if (enrollmentStatus === "ACTIVE" || enrollmentStatus === "APPROVED" || enrollmentStatus === "COMPLETED") {
    return (
      <Link href={`/student/courses/${courseId}`}>
        <Button className="w-full" size="lg" variant="success">
          Go to Course
        </Button>
      </Link>
    );
  }

  return (
    <Button
      className="w-full"
      size="lg"
      loading={pending}
      onClick={() => {
        startTransition(async () => {
          const result = await requestEnrollmentAction(courseId);
          if (result.success) toast.success(result.message);
          else toast.error(result.message);
        });
      }}
    >
      {enrollmentStatus === "REJECTED" ? "Request Enrollment Again" : "Enroll Now"}
    </Button>
  );
}
