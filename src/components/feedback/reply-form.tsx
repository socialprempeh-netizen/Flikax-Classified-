"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { replyToFeedbackAction } from "@/app/u/actions";

export function ReplyForm({ feedbackId, profileId }: { feedbackId: string; profileId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await replyToFeedbackAction(feedbackId, profileId, message);
      if (result.error) {
        setError(result.error);
        return;
      }
      setMessage("");
      router.refresh();
    });
  }

  return (
    <div className="mt-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          placeholder="Write a reply..."
          className="min-w-0 flex-1 rounded-lg border-2 border-slate-strong px-3 py-1.5 text-sm text-neutral-800 outline-none focus:border-brand"
        />
        <button
          type="submit"
          disabled={isPending}
          className="shrink-0 rounded-lg bg-brand px-3 py-1.5 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {isPending ? "..." : "Reply"}
        </button>
      </form>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
