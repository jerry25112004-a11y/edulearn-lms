"use client";

import * as React from "react";
import { useActionState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { sendMessageAction } from "@/actions/messages";
import { cn, formatDateTime } from "@/lib/utils";
import type { ActionState } from "@/actions/auth";

const initial: ActionState = { success: false };

export type ChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
};

export function ChatThread({
  conversationId,
  messages,
  currentUserId,
  otherUserName,
}: {
  conversationId: string;
  messages: ChatMessage[];
  currentUserId: string;
  otherUserName: string;
}) {
  const [state, formAction, pending] = useActionState(sendMessageAction, initial);
  const formRef = useRef<HTMLFormElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            No messages yet. Say hello to {otherUserName}!
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === currentUserId;
            return (
              <div key={m.id} className={cn("flex items-end gap-2", mine && "flex-row-reverse")}>
                <Avatar name={m.senderName} size="xs" />
                <div className={cn("max-w-[75%] rounded-2xl px-4 py-2 text-sm", mine ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-800")}>
                  <p className="whitespace-pre-wrap">{m.content}</p>
                  <p className={cn("mt-1 text-[10px]", mine ? "text-brand-100" : "text-slate-400")}>{formatDateTime(m.createdAt)}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
      <form ref={formRef} action={formAction} className="flex items-center gap-2 border-t border-slate-200 p-3">
        <input type="hidden" name="conversationId" value={conversationId} />
        <input
          name="content"
          placeholder="Type a message..."
          autoComplete="off"
          required
          className="flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
        <Button type="submit" size="icon" loading={pending} aria-label="Send message">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
