"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { Phone, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { revealPhoneAction } from "@/app/messages/actions";
import { formatRelativeTime } from "@/lib/format-time";

type Message = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export function ChatThread({
  conversationId,
  currentUserId,
  otherPartyName,
  isBuyer,
  initialMessages,
  initialPhoneRevealedByBuyer,
  initialPhoneRevealedBySeller,
  currentUserPhone,
  otherPartyPhone,
}: {
  conversationId: string;
  currentUserId: string;
  otherPartyName: string;
  isBuyer: boolean;
  initialMessages: Message[];
  initialPhoneRevealedByBuyer: boolean;
  initialPhoneRevealedBySeller: boolean;
  currentUserPhone: string | null;
  otherPartyPhone: string | null;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [phoneRevealedByBuyer, setPhoneRevealedByBuyer] = useState(initialPhoneRevealedByBuyer);
  const [phoneRevealedBySeller, setPhoneRevealedBySeller] = useState(initialPhoneRevealedBySeller);
  const [draft, setDraft] = useState("");
  const [isSending, startSendTransition] = useTransition();
  const [isRevealing, startRevealTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const inserted = payload.new as Message;
          setMessages((prev) => (prev.some((m) => m.id === inserted.id) ? prev : [...prev, inserted]));
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "conversations", filter: `id=eq.${conversationId}` },
        (payload) => {
          const updated = payload.new as { phone_revealed_by_buyer: boolean; phone_revealed_by_seller: boolean };
          setPhoneRevealedByBuyer(updated.phone_revealed_by_buyer);
          setPhoneRevealedBySeller(updated.phone_revealed_by_seller);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function handleSend(event: FormEvent) {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;

    setError(null);
    setDraft("");
    startSendTransition(async () => {
      const supabase = createClient();
      const { error: sendError } = await supabase
        .from("messages")
        .insert({ conversation_id: conversationId, sender_id: currentUserId, body });

      if (sendError) {
        setError("Message failed to send. Please try again.");
        setDraft(body);
      }
    });
  }

  function handleReveal() {
    startRevealTransition(async () => {
      try {
        await revealPhoneAction(conversationId);
        if (isBuyer) setPhoneRevealedByBuyer(true);
        else setPhoneRevealedBySeller(true);
      } catch {
        setError("Could not share your phone number. Please try again.");
      }
    });
  }

  const myPhoneShared = isBuyer ? phoneRevealedByBuyer : phoneRevealedBySeller;
  const bothRevealed = phoneRevealedByBuyer && phoneRevealedBySeller;

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-sm">
      <div className="border-b border-neutral-100 p-4">
        {bothRevealed && otherPartyPhone ? (
          <a
            href={`tel:${otherPartyPhone}`}
            className="flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-dark"
          >
            <Phone className="size-4" />
            Call {otherPartyName} — {otherPartyPhone}
          </a>
        ) : myPhoneShared ? (
          <p className="text-center text-sm text-neutral-500">
            Waiting for {otherPartyName} to share their number too...
          </p>
        ) : currentUserPhone ? (
          <button
            type="button"
            onClick={handleReveal}
            disabled={isRevealing}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-bold text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
          >
            <Phone className="size-4" />
            {isRevealing ? "Sharing..." : "Share my phone number"}
          </button>
        ) : (
          <p className="text-center text-xs text-neutral-400">
            Add a phone number in Settings to share contact info in chat.
          </p>
        )}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-neutral-400">
            Say hello — messages about this listing appear here.
          </p>
        )}
        {messages.map((message) => {
          const isMine = message.sender_id === currentUserId;
          return (
            <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  isMine ? "bg-brand text-white" : "bg-neutral-100 text-neutral-800"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.body}</p>
                <p className={`mt-1 text-[10px] ${isMine ? "text-white/70" : "text-neutral-400"}`}>
                  {formatRelativeTime(new Date(message.created_at))}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-neutral-100 p-3">
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Type a message..."
          maxLength={2000}
          className="flex-1 rounded-full border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-brand"
        />
        <button
          type="submit"
          disabled={isSending || !draft.trim()}
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand text-white hover:bg-brand-dark disabled:opacity-50"
        >
          <Send className="size-4" />
        </button>
      </form>
      {error && <p className="px-4 pb-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
