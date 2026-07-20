"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { ListingGrid, type ListingCard } from "@/components/listing-grid";

type LoadMoreResult = { listings: ListingCard[]; totalCount: number };

export function InfiniteListingGrid({
  initialListings,
  initialTotalCount,
  variant,
  loadMore,
}: {
  initialListings: ListingCard[];
  initialTotalCount: number;
  variant?: "default" | "home";
  loadMore: (page: number) => Promise<LoadMoreResult>;
}) {
  const [listings, setListings] = useState(initialListings);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [loading, setLoading] = useState(false);
  const [errored, setErrored] = useState(false);
  const pageRef = useRef(1);
  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // A filter/sort/search change re-renders this component (new key) with a
  // fresh server-rendered first page -- reset the accumulated pages so they
  // don't linger and get appended to under the new filter.
  useEffect(() => {
    setListings(initialListings);
    setTotalCount(initialTotalCount);
    pageRef.current = 1;
    setErrored(false);
  }, [initialListings, initialTotalCount]);

  const hasMore = listings.length < totalCount;

  async function loadNext() {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setErrored(false);
    try {
      const nextPage = pageRef.current + 1;
      const result = await loadMore(nextPage);
      setListings((prev) => [...prev, ...result.listings]);
      setTotalCount(result.totalCount);
      pageRef.current = nextPage;
    } catch {
      setErrored(true);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadNext();
      },
      { rootMargin: "800px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore]);

  return (
    <>
      <ListingGrid listings={listings} variant={variant} />
      {hasMore && (
        <div ref={sentinelRef} className="flex items-center justify-center py-8">
          {errored ? (
            <button
              type="button"
              onClick={loadNext}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              Couldn&apos;t load more — try again
            </button>
          ) : (
            loading && <Loader2 className="size-5 animate-spin text-neutral-400" />
          )}
        </div>
      )}
    </>
  );
}
