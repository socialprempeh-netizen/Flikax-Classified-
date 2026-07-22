"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImageOff, ChevronLeft, ChevronRight, Camera } from "lucide-react";

// Below this drag distance, a pointer down/up is treated as a tap/click
// (e.g. on the image itself) rather than an intentional swipe.
const SWIPE_THRESHOLD_PX = 50;

export function ListingGallery({ images, title }: { images: string[]; title: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const dragStartX = useRef<number | null>(null);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-brand-light text-brand/40">
        <ImageOff className="size-10" />
      </div>
    );
  }

  function prev() {
    setActiveIndex((i) => (i - 1 + images.length) % images.length);
  }

  function next() {
    setActiveIndex((i) => (i + 1) % images.length);
  }

  function handlePointerDown(e: React.PointerEvent) {
    dragStartX.current = e.clientX;
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (dragStartX.current === null) return;
    const deltaX = e.clientX - dragStartX.current;
    dragStartX.current = null;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return;
    if (deltaX > 0) prev();
    else next();
  }

  return (
    <div>
      <div
        className="relative aspect-[4/3] w-full touch-pan-y select-none overflow-hidden rounded-xl"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          dragStartX.current = null;
        }}
      >
        <Image
          src={images[activeIndex]}
          alt={title}
          fill
          priority={activeIndex === 0}
          sizes="(min-width: 640px) 75vw, 100vw"
          quality={82}
          className="object-cover"
        />
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow hover:bg-white"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow hover:bg-white"
            >
              <ChevronRight className="size-5" />
            </button>
            <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white sm:hidden">
              <Camera className="size-3.5" />
              {activeIndex + 1}/{images.length}
            </span>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 hidden grid-cols-5 gap-3 sm:grid">
          {images.map((url, index) => (
            <button
              key={url + index}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View image ${index + 1}`}
              className={`relative aspect-square w-full overflow-hidden rounded-lg border-2 ${
                index === activeIndex
                  ? "border-brand ring-2 ring-brand ring-offset-2"
                  : "border-neutral-200 hover:border-neutral-300"
              }`}
            >
              <Image src={url} alt="" fill sizes="144px" quality={82} className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
