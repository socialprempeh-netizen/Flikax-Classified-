import { Smile, Meh, Frown, type LucideIcon } from "lucide-react";
import { formatRelativeTime } from "@/lib/format-time";
import { ReplyForm } from "@/components/feedback/reply-form";
import { ReportFeedbackButton } from "@/components/feedback/report-feedback-button";

const SENTIMENT_ICON: Record<string, LucideIcon> = { positive: Smile, neutral: Meh, negative: Frown };
const SENTIMENT_COLOR: Record<string, string> = {
  positive: "text-green-600",
  neutral: "text-neutral-500",
  negative: "text-red-600",
};

export type FeedbackEntry = {
  id: string;
  sentiment: string;
  message: string;
  created_at: string;
  author: { full_name: string | null } | null;
  replies: { id: string; message: string; created_at: string }[];
};

export function FeedbackList({
  entries,
  isOwner,
  profileId,
}: {
  entries: FeedbackEntry[];
  isOwner: boolean;
  profileId: string;
}) {
  if (entries.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center text-sm text-neutral-500 shadow-md">No feedback yet.</div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => {
        const Icon = SENTIMENT_ICON[entry.sentiment] ?? Meh;
        return (
          <div key={entry.id} className="rounded-2xl bg-white p-5 shadow-md">
            <div className="flex items-center gap-2">
              <Icon className={`size-4 ${SENTIMENT_COLOR[entry.sentiment] ?? "text-neutral-500"}`} />
              <p className="text-sm font-bold text-neutral-800">{entry.author?.full_name || "Flikax user"}</p>
              <span className="text-xs text-neutral-400">{formatRelativeTime(new Date(entry.created_at))}</span>
            </div>
            <p className="mt-2 text-sm text-neutral-700">{entry.message}</p>

            {entry.replies.map((reply) => (
              <div key={reply.id} className="ml-4 mt-3 rounded-xl bg-brand-light p-3">
                <p className="text-xs font-bold text-brand">Seller reply</p>
                <p className="mt-1 text-sm text-neutral-700">{reply.message}</p>
              </div>
            ))}

            {isOwner && entry.replies.length === 0 && <ReplyForm feedbackId={entry.id} profileId={profileId} />}
            <ReportFeedbackButton feedbackId={entry.id} />
          </div>
        );
      })}
    </div>
  );
}
