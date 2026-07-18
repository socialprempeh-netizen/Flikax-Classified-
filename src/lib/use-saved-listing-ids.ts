"use client";

import { useEffect, useState } from "react";

// A grid page can render dozens of save buttons -- deduped to one shared
// request via an in-flight promise (same pattern as use-session-summary)
// rather than each button firing its own fetch. `refetch` lets a toggle
// action force a fresh read next time a button mounts (e.g. after
// navigating away and back) instead of trusting a stale in-memory set.
let inFlight: Promise<Set<string>> | null = null;

function fetchSavedIds(): Promise<Set<string>> {
  if (!inFlight) {
    inFlight = fetch("/api/saved-listings/ids", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { ids: [] }))
      .then((data: { ids: string[] }) => new Set(data.ids))
      .catch(() => new Set<string>())
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
}

// Starts empty (nothing shows as saved) until the client fetch resolves --
// same tradeoff as useSessionSummary, kept for the same reason: it lets the
// surrounding page stay cacheable instead of computing per-viewer save
// state on the server for every request.
export function useSavedListingIds(): Set<string> {
  const [ids, setIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    fetchSavedIds().then((data) => {
      if (!cancelled) setIds(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return ids;
}
