"use client";

import { useEffect, useState } from "react";

export type SessionSummary = {
  isLoggedIn: boolean;
  userId?: string;
  avatarUrl?: string;
  initials?: string;
  hasUnreadMessages: boolean;
};

const DEFAULT_SUMMARY: SessionSummary = { isLoggedIn: false, hasUnreadMessages: false };

// Both MobileNavDrawer and HeaderUserActions mount on the same page load and
// both need this -- deduped to one request via a shared in-flight promise
// rather than each firing its own fetch. Not cached beyond that single
// in-flight request: every fresh mount (e.g. a client-side navigation to
// another page, which remounts SiteHeader) refetches, so login/logout state
// is never more than one navigation stale.
let inFlight: Promise<SessionSummary> | null = null;

function fetchSessionSummary(): Promise<SessionSummary> {
  if (!inFlight) {
    inFlight = fetch("/api/session-summary", { cache: "no-store" })
      .then((res) => (res.ok ? (res.json() as Promise<SessionSummary>) : DEFAULT_SUMMARY))
      .catch(() => DEFAULT_SUMMARY)
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
}

// Starts as logged-out/no-unread (DEFAULT_SUMMARY) until the client fetch
// resolves -- a brief, standard tradeoff for keeping the surrounding page
// statically cacheable instead of forcing it dynamic for every visitor to
// avoid a flash of logged-out UI for the already-logged-in minority.
export function useSessionSummary(): SessionSummary {
  const [summary, setSummary] = useState<SessionSummary>(DEFAULT_SUMMARY);

  useEffect(() => {
    let cancelled = false;
    fetchSessionSummary().then((data) => {
      if (!cancelled) setSummary(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return summary;
}
