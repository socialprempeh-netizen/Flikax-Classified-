import Link from "next/link";
import { redirect } from "next/navigation";
import { Smile, Meh, Frown } from "lucide-react";
import { createClient, getUser } from "@/lib/supabase/server";
import { CopyLinkButton } from "@/components/feedback/copy-link-button";
import { FeedbackList, type FeedbackEntry } from "@/components/feedback/feedback-list";

type Tab = "received" | "sent";

export default async function DashboardFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab: rawTab } = await searchParams;
  const tab: Tab = rawTab === "sent" ? "sent" : "received";

  const supabase = await createClient();
  const {
    data: { user },
  } = await getUser();

  if (!user) {
    redirect("/auth/login?redirect=/dashboard/feedback");
  }

  const [{ data: received }, { data: sent }] = await Promise.all([
    supabase
      .from("profile_feedback")
      .select(
        "id, sentiment, message, created_at, author:profiles!profile_feedback_author_id_fkey(full_name), replies:profile_feedback_replies(id, message, created_at)"
      )
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("profile_feedback")
      .select("id, sentiment, message, created_at, profile:profiles!profile_feedback_profile_id_fkey(id, full_name)")
      .eq("author_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const receivedEntries: FeedbackEntry[] = received ?? [];
  const sentEntries = sent ?? [];

  const counts = {
    positive: receivedEntries.filter((f) => f.sentiment === "positive").length,
    neutral: receivedEntries.filter((f) => f.sentiment === "neutral").length,
    negative: receivedEntries.filter((f) => f.sentiment === "negative").length,
  };

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "received", label: "Received", count: receivedEntries.length },
    { key: "sent", label: "Sent", count: sentEntries.length },
  ];

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="border-l-4 border-brand pl-3 text-xl font-bold uppercase tracking-wide text-neutral-800">
          Feedback
        </h1>
        <CopyLinkButton path={`/u/${user.id}`} />
      </div>

      <div className="flex items-center gap-6 rounded-2xl bg-white p-5 shadow-md">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-green-600">
          <Smile className="size-4" /> {counts.positive} Positive
        </span>
        <span className="flex items-center gap-1.5 text-sm font-semibold text-neutral-500">
          <Meh className="size-4" /> {counts.neutral} Neutral
        </span>
        <span className="flex items-center gap-1.5 text-sm font-semibold text-red-600">
          <Frown className="size-4" /> {counts.negative} Negative
        </span>
      </div>

      <div className="flex items-center gap-6 border-b border-neutral-200">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/dashboard/feedback?tab=${t.key}`}
            className={`border-b-2 pb-3 text-sm font-medium ${
              tab === t.key
                ? "border-brand text-brand"
                : "border-transparent text-neutral-500 hover:text-neutral-700"
            }`}
          >
            {t.label} ({t.count})
          </Link>
        ))}
      </div>

      {tab === "received" ? (
        <FeedbackList entries={receivedEntries} isOwner profileId={user.id} />
      ) : sentEntries.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center text-sm text-neutral-500 shadow-md">
          You haven&apos;t left feedback for anyone yet.
        </div>
      ) : (
        <div className="space-y-3">
          {sentEntries.map((entry) => (
            <div key={entry.id} className="rounded-2xl bg-white p-5 shadow-md">
              <div className="flex items-center gap-2">
                {entry.sentiment === "positive" && <Smile className="size-4 text-green-600" />}
                {entry.sentiment === "neutral" && <Meh className="size-4 text-neutral-500" />}
                {entry.sentiment === "negative" && <Frown className="size-4 text-red-600" />}
                <p className="text-xs text-neutral-400">
                  To{" "}
                  <Link href={`/u/${entry.profile?.id}`} className="font-semibold text-brand hover:underline">
                    {entry.profile?.full_name || "Flikax user"}
                  </Link>
                </p>
              </div>
              <p className="mt-2 text-sm text-neutral-700">{entry.message}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
