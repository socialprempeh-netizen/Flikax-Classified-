"use client";

import { useEffect } from "react";
import { addRecentlyViewed } from "@/lib/recently-viewed";

/** Renders nothing -- just records this listing into localStorage's recently-viewed list on mount. */
export function TrackRecentlyViewed({
  id,
  href,
  title,
  priceLabel,
  imageUrl,
}: {
  id: string;
  href: string;
  title: string;
  priceLabel: string;
  imageUrl: string | null;
}) {
  useEffect(() => {
    addRecentlyViewed({ id, href, title, priceLabel, imageUrl });
  }, [id, href, title, priceLabel, imageUrl]);

  return null;
}
