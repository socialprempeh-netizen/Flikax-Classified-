"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Smile, Meh, Frown, type LucideIcon } from "lucide-react";
import { submitFeedbackAction, type Sentiment } from "@/app/u/actions";

const OPTIONS: { value: Sentiment; label: string; icon: LucideIcon; activeClass: string }[] = [
  { value: "positive", label: "Positive", icon: Smile, activeClass: "border-green-300 bg-green-100 text-green-700" },
  { value: "neutral", label: "Neutral", icon: Meh, activeClass: "border-neutral-300 bg-neutral-100 text-neutral-600" },
  { value: "negative", label: "Negative", icon: Frown, activeClass: "border-red-300 bg-red-100 text-red-700" },
];

export function LeaveFeedbackForm({ profileId }: { profileId: string }) {
  const router = useRouter();
  const [sentiment, setSentiment] = useState<Sentiment>("positive");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await submitFeedbackAction(profileId, sentiment, message);
      if (result.error) {
        setError(result.error);
        return;
      }
      setMessage("");
      setSuccess(true);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl bg-white p-5 shadow-md">
      <h2 className="text-sm font-bold text-neutral-800">Leave feedback</h2>
      <div className="flex gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setSentiment(opt.value)}
            className={`flex flex-1 flex-col items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold ${
              sentiment === opt.value ? opt.activeClass : "border-neutral-200 text-neutral-500 hover:bg-neutral-50"
            }`}
          >
            <opt.icon className="size-5" />
            {opt.label}
          </button>
        ))}
      </div>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
        rows={3}
        placeholder="Share your experience..."
        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">Thanks for your feedback!</p>}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {isPending ? "Submitting..." : "Submit feedback"}
      </button>
    </form>
  );
}
