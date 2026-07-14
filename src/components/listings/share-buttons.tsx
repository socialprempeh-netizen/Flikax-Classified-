"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { FacebookIcon, XIcon, WhatsAppIcon, TikTokIcon } from "@/components/icons/social-icons";

const ICON_BUTTON_CLASS =
  "flex size-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 hover:bg-brand-light hover:text-brand";

export function ShareButtons({ title, priceLabel }: { title: string; priceLabel: string }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  // Deferred to an effect (rather than read directly during render) so the
  // server-rendered and first client render match — window isn't available
  // during SSR, and reading it inline would cause a hydration mismatch.
  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const shareText = `${title} - ${priceLabel} on Flikax`;

  async function copyForTikTok() {
    await navigator.clipboard.writeText(`${shareText} ${url}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-neutral-500">Share:</span>

      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareText)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        className={ICON_BUTTON_CLASS}
      >
        <FacebookIcon className="size-4" />
      </a>

      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
        className={ICON_BUTTON_CLASS}
      >
        <WhatsAppIcon className="size-4" />
      </a>

      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
        className={ICON_BUTTON_CLASS}
      >
        <XIcon className="size-4" />
      </a>

      <button
        type="button"
        onClick={copyForTikTok}
        aria-label="Copy link to share on TikTok"
        title="TikTok doesn't support pre-filled link sharing — this copies the listing details instead"
        className={
          copied
            ? "flex size-9 items-center justify-center rounded-full bg-green-100 text-green-600"
            : ICON_BUTTON_CLASS
        }
      >
        {copied ? <Check className="size-4" /> : <TikTokIcon className="size-4" />}
      </button>

      {copied && (
        <span className="text-xs font-medium text-green-600">Copied! Paste it in your TikTok caption.</span>
      )}
    </div>
  );
}
