"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { getRecentlyViewed, type RecentlyViewedItem } from "@/lib/recently-viewed";

export function SearchQueryField({ defaultQuery }: { defaultQuery?: string }) {
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<RecentlyViewedItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative min-w-0 flex-1">
      <input
        type="text"
        name="q"
        defaultValue={defaultQuery}
        onFocus={() => {
          setRecent(getRecentlyViewed());
          setOpen(true);
        }}
        placeholder="I am looking for..."
        autoComplete="off"
        className="w-full min-w-0 bg-transparent px-1 py-2 text-sm text-neutral-800 outline-none placeholder:text-neutral-400"
      />

      {open && recent.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-40 mt-3 rounded-xl border border-neutral-100 bg-white p-3 text-left shadow-lg">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-neutral-400">Recently Viewed</p>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {recent.map((item) => (
              <Link key={item.id} href={item.href} className="w-24 shrink-0">
                <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-neutral-100 text-neutral-300">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt="" fill sizes="96px" className="object-cover" />
                  ) : (
                    <ImageOff className="size-5" />
                  )}
                </div>
                <p className="mt-1 truncate text-xs font-medium text-neutral-700">{item.title}</p>
                <p className="text-xs font-bold text-brand">{item.priceLabel}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
