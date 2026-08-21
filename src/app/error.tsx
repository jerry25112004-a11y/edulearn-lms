"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h1 className="mt-6 text-2xl font-bold text-slate-900">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-slate-500">
        An unexpected error occurred. You can try again, or head back to the homepage.
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={() => reset()}>Try Again</Button>
        <a href="/">
          <Button variant="outline">Back to Home</Button>
        </a>
      </div>
    </div>
  );
}
