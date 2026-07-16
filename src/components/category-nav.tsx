"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { buildListingsHref, type ListingFilters } from "@/lib/filters";
import type { Category } from "@/components/category-sidebar";
import { resolveCategoryIcon } from "@/lib/category-icons";

const FLYOUT_WIDTH = 260;
const FLYOUT_GAP = 8;
const VIEWPORT_MARGIN = 16;

export function CategoryNav({
  parents,
  categories,
  counts,
  filters,
}: {
  parents: Category[];
  categories: Category[];
  counts: Map<string, number>;
  filters: ListingFilters;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [flyoutPos, setFlyoutPos] = useState<{ top: number; left: number; maxHeight: number } | null>(null);
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function totalFor(parent: Category) {
    const ownCount = counts.get(parent.id) ?? 0;
    const childCount = categories
      .filter((c) => c.parent_id === parent.id)
      .reduce((sum, child) => sum + (counts.get(child.id) ?? 0), 0);
    return ownCount + childCount;
  }

  // Positions the flyout with the viewport itself, not the row, as the frame
  // of reference -- computed fresh on every hover so it never depends on
  // where the row happens to sit in a (possibly long) category list. Flips
  // to the left side of the sidebar if there's no room on the right, and
  // caps its height to whatever vertical space remains below the row
  // (scrollable past that) so a category with many children can never push
  // the panel below the bottom edge of the screen.
  function handleEnter(catId: string) {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setHoveredId(catId);
    const rowEl = rowRefs.current[catId];
    if (!rowEl) return;
    const rect = rowEl.getBoundingClientRect();

    const fitsOnRight = rect.right + FLYOUT_GAP + FLYOUT_WIDTH <= window.innerWidth - VIEWPORT_MARGIN;
    const left = fitsOnRight ? rect.right + FLYOUT_GAP : rect.left - FLYOUT_GAP - FLYOUT_WIDTH;

    const top = Math.min(rect.top, window.innerHeight - VIEWPORT_MARGIN - 80);
    const maxHeight = window.innerHeight - top - VIEWPORT_MARGIN;

    setFlyoutPos({ top, left: Math.max(VIEWPORT_MARGIN, left), maxHeight });
  }

  // Moving the mouse diagonally from the row toward the flyout crosses page
  // background in between (the flyout is `position: fixed`, spatially
  // detached from the row), which would fire this on the way there and close
  // the panel before the cursor ever arrives. Delaying the close -- and
  // cancelling it from either the row's or the flyout's own onMouseEnter --
  // gives the cursor time to land on either without the panel vanishing.
  function handleLeave() {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setHoveredId(null);
      setFlyoutPos(null);
    }, 250);
  }

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  // Belt-and-braces alongside mouse-out: a trackpad tap or a click that
  // lands without a preceding hover-out (e.g. via keyboard focus jumping
  // elsewhere) should still dismiss the flyout.
  useEffect(() => {
    if (!hoveredId) return;
    function handleClick(e: MouseEvent) {
      const rowEl = rowRefs.current[hoveredId!];
      if (rowEl && !rowEl.contains(e.target as Node)) {
        setHoveredId(null);
        setFlyoutPos(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [hoveredId]);

  return (
    <nav className="relative w-full shrink-0 divide-y divide-neutral-100 rounded-xl border border-neutral-100 bg-white shadow-sm sm:w-72">
      {parents.map((cat) => {
        const Icon = resolveCategoryIcon(cat);
        const children = categories.filter((c) => c.parent_id === cat.id);
        const isHovered = hoveredId === cat.id;

        return (
          <div
            key={cat.id}
            ref={(el) => {
              rowRefs.current[cat.id] = el;
            }}
            className="relative"
            onMouseEnter={() => handleEnter(cat.id)}
            onMouseLeave={handleLeave}
          >
            <Link
              href={buildListingsHref({ ...filters, category: cat.slug })}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-brand-light ${
                isHovered ? "bg-brand-light" : ""
              }`}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand">
                <Icon className="size-4.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-neutral-800">
                  {cat.name}
                </span>
                <span className="block text-xs text-neutral-500">{totalFor(cat)} ads</span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-neutral-400" />
            </Link>

            {isHovered && children.length > 0 && flyoutPos && (
              <div
                style={{
                  position: "fixed",
                  top: flyoutPos.top,
                  left: flyoutPos.left,
                  width: FLYOUT_WIDTH,
                  maxHeight: flyoutPos.maxHeight,
                }}
                onMouseEnter={() => handleEnter(cat.id)}
                onMouseLeave={handleLeave}
                className="z-40 overflow-y-auto rounded-xl border border-neutral-100 bg-white p-2 shadow-lg"
              >
                {children.map((child) => (
                  <Link
                    key={child.id}
                    href={`/${child.slug}`}
                    className="flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-neutral-50"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-brand-light text-brand">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-neutral-800">
                        {child.name}
                      </span>
                      <span className="block text-xs text-neutral-400">
                        {counts.get(child.id) ?? 0} ads
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
