import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth/guard";
import { getConversationsForUser, getConversationThread } from "@/lib/db/messaging";
import { ConversationList } from "@/components/shared/messages/conversation-list";
import { ChatThread } from "@/components/shared/messages/chat-thread";
import { markConversationReadAction } from "@/actions/messages";

export const dynamic = "force-dynamic";

export default async function InstructorConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole("INSTRUCTOR");
  const { id } = await params;

  const [conversations, thread] = await Promise.all([
    getConversationsForUser(session.userId, "INSTRUCTOR"),
    getConversationThread(id, session.userId),
  ]);
  if (!thread) notFound();

  await markConversationReadAction(id);

  return (
    <div className="grid h-[calc(100vh-8rem)] grid-cols-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:grid-cols-3">
      <div className="hidden overflow-y-auto border-r border-slate-200 lg:block">
        <ConversationList conversations={conversations} basePath="/instructor/messages" activeId={id} />
      </div>
      <div className="col-span-2 flex flex-col">
        <div className="flex items-center gap-2 border-b border-slate-200 p-4 lg:hidden">
          <Link href="/instructor/messages" className="text-slate-500"><ArrowLeft className="h-4 w-4" /></Link>
          <p className="font-semibold text-slate-900">{thread.otherUserName}</p>
        </div>
        <div className="hidden border-b border-slate-200 p-4 lg:block">
          <p className="font-semibold text-slate-900">{thread.otherUserName}</p>
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatThread conversationId={id} messages={thread.messages} currentUserId={session.userId} otherUserName={thread.otherUserName} />
        </div>
      </div>
    </div>
  );
}
