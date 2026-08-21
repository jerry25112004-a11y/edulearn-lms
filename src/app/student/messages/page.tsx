import { requireRole } from "@/lib/auth/guard";
import { getConversationsForUser } from "@/lib/db/messaging";
import { ConversationList } from "@/components/shared/messages/conversation-list";

export const metadata = { title: "Messages" };
export const dynamic = "force-dynamic";

export default async function StudentMessagesPage() {
  const session = await requireRole("STUDENT");
  const conversations = await getConversationsForUser(session.userId, "STUDENT");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Messages</h1>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <ConversationList conversations={conversations} basePath="/student/messages" />
      </div>
    </div>
  );
}
