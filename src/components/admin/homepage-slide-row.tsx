"use client";

import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import {
  toggleSlideActiveAction,
  deleteSlideAction,
  reorderSlideAction,
} from "@/app/admin/homepage-slider/actions";
import type { HomepageSlide } from "@/lib/homepage-slides";

export function HomepageSlideRow({
  slide,
  isFirst,
  isLast,
  onEdit,
  onDeleted,
  onReordered,
}: {
  slide: HomepageSlide;
  isFirst: boolean;
  isLast: boolean;
  onEdit: () => void;
  onDeleted: () => void;
  onReordered: (slides: HomepageSlide[]) => void;
}) {
  const [active, setActive] = useState(slide.is_active);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/homepage-slides/${slide.image_path}`;

  function handleToggle() {
    const next = !active;
    setActive(next);
    setError(null);
    startTransition(async () => {
      try {
        await toggleSlideActiveAction(slide.id, next);
      } catch (err) {
        setActive(!next);
        setError(err instanceof Error ? err.message : "Failed to update.");
      }
    });
  }

  function handleDelete() {
    if (!window.confirm("Delete this slide? This can't be undone.")) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteSlideAction(slide.id);
        onDeleted();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete.");
      }
    });
  }

  function handleReorder(direction: "up" | "down") {
    setError(null);
    startTransition(async () => {
      try {
        const reordered = await reorderSlideAction(slide.id, direction);
        onReordered(reordered);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to reorder.");
      }
    });
  }

  return (
    <div className="flex items-center gap-4 p-5">
      <div className="flex shrink-0 flex-col gap-1">
        <button
          type="button"
          onClick={() => handleReorder("up")}
          disabled={isPending || isFirst}
          aria-label="Move up"
          className="flex size-6 items-center justify-center rounded border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-30"
        >
          <ArrowUp className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => handleReorder("down")}
          disabled={isPending || isLast}
          aria-label="Move down"
          className="flex size-6 items-center justify-center rounded border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-30"
        >
          <ArrowDown className="size-3.5" />
        </button>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element -- already-optimized storage image in an admin list, not worth next/image here */}
      <img src={imageUrl} alt="" className="h-16 w-28 shrink-0 rounded-lg border border-neutral-200 object-cover" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-neutral-800">{slide.headline || "(no headline)"}</p>
        {slide.link_url && <p className="truncate text-xs text-neutral-400">{slide.link_url}</p>}
        <p className="mt-0.5 text-xs text-neutral-400">
          {slide.starts_at || slide.ends_at
            ? `Scheduled: ${slide.starts_at ? new Date(slide.starts_at).toLocaleString() : "now"} → ${
                slide.ends_at ? new Date(slide.ends_at).toLocaleString() : "no end"
              }`
            : "Always on while active"}
        </p>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <button type="button" onClick={onEdit} className="text-sm font-medium text-brand hover:underline">
          Edit
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="text-sm font-medium text-red-600 hover:underline disabled:opacity-60"
        >
          Delete
        </button>
        <button
          type="button"
          onClick={handleToggle}
          disabled={isPending}
          aria-pressed={active}
          aria-label={`Toggle slide ${active ? "active" : "inactive"}`}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-60 ${
            active ? "bg-brand" : "bg-neutral-300"
          }`}
        >
          <span
            className={`absolute top-1 size-5 rounded-full bg-white shadow transition-transform ${
              active ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
