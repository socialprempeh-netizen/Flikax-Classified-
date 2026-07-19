"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type SliderSlide = {
  id: string;
  imageUrl: string;
  headline: string | null;
  linkUrl: string | null;
};

const AUTO_ROTATE_MS = 5000;

export function HomepageSlider({ slides }: { slides: SliderSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback(
    (next: number) => {
      if (slides.length === 0) return;
      setIndex(((next % slides.length) + slides.length) % slides.length);
    },
    [slides.length]
  );

  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    timerRef.current = setInterval(() => setIndex((i) => (i + 1) % slides.length), AUTO_ROTATE_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slides.length, paused]);

  if (slides.length === 0) return null;

  const slide = slides[index];
  const content = (
    <div className="relative aspect-[10/3] w-full overflow-hidden rounded-xl bg-neutral-100">
      <Image
        src={slide.imageUrl}
        alt={slide.headline ?? ""}
        fill
        sizes="(min-width: 1280px) 1200px, 100vw"
        priority={index === 0}
        className="object-cover"
      />
      {slide.headline && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 sm:p-6">
          <p className="text-base font-bold text-white sm:text-xl">{slide.headline}</p>
        </div>
      )}
    </div>
  );

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slide.linkUrl ? <Link href={slide.linkUrl}>{content}</Link> : content}

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Previous slide"
            className="absolute left-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-neutral-700 shadow-sm hover:bg-white sm:size-9"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Next slide"
            className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-neutral-700 shadow-sm hover:bg-white sm:size-9"
          >
            <ChevronRight className="size-5" />
          </button>

          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`size-1.5 rounded-full transition-all ${
                  i === index ? "w-4 bg-white" : "bg-white/60 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
