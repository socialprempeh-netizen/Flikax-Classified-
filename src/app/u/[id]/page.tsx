import Link from "next/link";
import { notFound } from "next/navigation";
import { Smile, Meh, Frown, BadgeCheck } from "lucide-react";
import { createClient, getUser } from "@/lib/supabase/server";
import { getInitials } from "@/lib/avatar";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LeaveFeedbackForm } from "@/components/feedback/leave-feedback-form";
import { FeedbackList, type FeedbackEntry } from "@/components/feedback/feedback-list";

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: userData }, { data: profile }, { data: feedback }] = await Promise.all([
    getUser(),
    supabase.from("profiles").select("id, full_name, verified").eq("id", id).maybeSingle(),
    supabase
      .from("profile_feedback")
      .select(
        "id, sentiment, message, created_at, author:profiles!profile_feedback_author_id_fkey(full_name), replies:profile_feedback_replies(id, message, created_at)"
      )
      .eq("profile_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!profile) notFound();

  const viewerId = userData.user?.id;
  const isOwner = viewerId === profile.id;
  const entries: FeedbackEntry[] = feedback ?? [];

  const counts = {
    positive: entries.filter((f) => f.sentiment === "positive").length,
    neutral: entries.filter((f) => f.sentiment === "neutral").length,
    negative: entries.filter((f) => f.sentiment === "negative").length,
  };

  return (
    <div className="flex flex-1 flex-col bg-neutral-50">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 space-y-4 px-4 py-8 sm:px-6">
        <div className="flex items-center gap-3 rounded-2xl bg-white p-5 shadow-md">
          <span className="flex size-14 items-center justify-center rounded-full bg-brand text-lg font-bold text-white">
            {getInitials(profile.full_name) || "F"}
          </span>
          <div>
            <p className="flex items-center gap-1.5 text-lg font-bold text-neutral-800">
              {profile.full_name || "Flikax user"}
              {profile.verified && (
                <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
                  <BadgeCheck className="size-3.5" />
                  Verified
                </span>
              )}
            </p>
            <p className="text-sm text-neutral-500">Seller on Flikax</p>
          </div>
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

        {viewerId && !isOwner && <LeaveFeedbackForm profileId={profile.id} />}
        {!viewerId && (
          <p className="rounded-2xl bg-white p-5 text-sm text-neutral-500 shadow-md">
            <Link href={`/auth/login?redirect=/u/${profile.id}`} className="font-bold text-brand hover:underline">
              Log in
            </Link>{" "}
            to leave feedback for {profile.full_name || "this seller"}.
          </p>
        )}

        <FeedbackList entries={entries} isOwner={isOwner} profileId={profile.id} />
      </main>
      <SiteFooter />
    </div>
  );
}
