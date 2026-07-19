"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff, ChevronLeft, ChevronRight, Camera } from "lucide-react";

export function ListingGallery({ images, title }: { images: string[]; title: string }) {
  const [activeIndex, setActiveIndex] = useState(0);

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

  return (
    <div>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
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
        <div className="mt-3 hidden flex-wrap gap-3 sm:flex">
          {images.map((url, index) => (
            <button
              key={url + index}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View image ${index + 1}`}
              className={`relative size-24 shrink-0 overflow-hidden rounded-lg border-2 sm:size-36 ${
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
