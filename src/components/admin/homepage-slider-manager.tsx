"use client";

import { useState } from "react";
import { HomepageSlideForm } from "@/components/admin/homepage-slide-form";
import { HomepageSlideRow } from "@/components/admin/homepage-slide-row";
import type { HomepageSlide } from "@/lib/homepage-slides";

export function HomepageSliderManager({ initialSlides }: { initialSlides: HomepageSlide[] }) {
  const [slides, setSlides] = useState(initialSlides);
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);

  const editingSlide = slides.find((s) => s.id === editingSlideId) ?? null;

  function handleSaved(saved: HomepageSlide) {
    setSlides((prev) => {
      const exists = prev.some((s) => s.id === saved.id);
      const next = exists ? prev.map((s) => (s.id === saved.id ? saved : s)) : [...prev, saved];
      return [...next].sort((a, b) => a.display_order - b.display_order);
    });
    setEditingSlideId(null);
  }

  function handleDeleted(id: string) {
    setSlides((prev) => prev.filter((s) => s.id !== id));
    if (editingSlideId === id) setEditingSlideId(null);
  }

  return (
    <>
      <div className="rounded-2xl border border-neutral-100 bg-white p-5">
        <h2 className="text-sm font-bold text-neutral-800">
          {editingSlide ? "Edit slide" : "Add a slide"}
        </h2>
        <div className="mt-3">
          <HomepageSlideForm
            key={editingSlide?.id ?? "new"}
            editingSlide={editingSlide}
            onSaved={handleSaved}
            onCancelEdit={() => setEditingSlideId(null)}
          />
        </div>
      </div>

      <div className="mt-6 divide-y divide-neutral-100 rounded-2xl border border-neutral-100 bg-white">
        {slides.length === 0 ? (
          <p className="p-6 text-sm text-neutral-400">
            No slides yet. Add one above — it appears on the homepage as soon as it&apos;s active.
          </p>
        ) : (
          slides.map((slide, i) => (
            <HomepageSlideRow
              key={slide.id}
              slide={slide}
              isFirst={i === 0}
              isLast={i === slides.length - 1}
              onEdit={() => setEditingSlideId(slide.id)}
              onDeleted={() => handleDeleted(slide.id)}
              onReordered={setSlides}
            />
          ))
        )}
      </div>
    </>
  );
}
