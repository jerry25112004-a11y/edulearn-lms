import { Badge } from "@/components/ui/badge";

const MAP: Record<string, { label: string; variant: "default" | "brand" | "success" | "warning" | "danger" | "info" | "outline" }> = {
  ACTIVE: { label: "Active", variant: "success" },
  INACTIVE: { label: "Inactive", variant: "default" },
  DRAFT: { label: "Draft", variant: "warning" },
  COMPLETED: { label: "Completed", variant: "info" },
  PENDING: { label: "Pending", variant: "warning" },
  APPROVED: { label: "Approved", variant: "success" },
  REJECTED: { label: "Rejected", variant: "danger" },
  UPCOMING: { label: "Upcoming", variant: "brand" },
  LIVE: { label: "Live", variant: "danger" },
  CANCELLED: { label: "Cancelled", variant: "default" },
  BEGINNER: { label: "Beginner", variant: "success" },
  INTERMEDIATE: { label: "Intermediate", variant: "warning" },
  ADVANCED: { label: "Advanced", variant: "danger" },
};

export function StatusBadge({ status }: { status: string }) {
  const cfg = MAP[status] ?? { label: status, variant: "default" as const };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
