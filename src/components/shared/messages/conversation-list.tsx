import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { MessageSquare } from "lucide-react";
import { timeAgo, cn } from "@/lib/utils";

export type ConversationSummary = {
  id: string;
  otherUserName: string;
  otherUserAvatar: string | null;
  courseName: string | null;
  lastMessage: string | null;
  lastMessageAt: string;
  unreadCount: number;
};

export function ConversationList({
  conversations,
  basePath,
  activeId,
}: {
  conversations: ConversationSummary[];
  basePath: string;
  activeId?: string;
}) {
  if (conversations.length === 0) {
    return <EmptyState icon={MessageSquare} title="No conversations yet" description="Messages with your contacts will appear here." />;
  }

  return (
    <div className="divide-y divide-slate-100">
      {conversations.map((c) => (
        <Link
          key={c.id}
          href={`${basePath}/${c.id}`}
          className={cn(
            "flex items-start gap-3 p-4 hover:bg-slate-50",
            activeId === c.id && "bg-brand-50/60"
          )}
        >
          <Avatar name={c.otherUserName} src={c.otherUserAvatar} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-semibold text-slate-900">{c.otherUserName}</p>
              <span className="shrink-0 text-[11px] text-slate-400">{timeAgo(c.lastMessageAt)}</span>
            </div>
            {c.courseName && <p className="truncate text-xs text-slate-400">{c.courseName}</p>}
            <p className="mt-0.5 truncate text-xs text-slate-500">{c.lastMessage ?? "No messages yet"}</p>
          </div>
          {c.unreadCount > 0 && (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-semibold text-white">
              {c.unreadCount}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
