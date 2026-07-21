"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

/** Where to drop the brand asset. Any web image format works. */
const LOGO_SRC = "/logo.png";

/**
 * The HarwiGadget logo.
 *
 * Renders `public/logo.png` when it exists and falls back to a CSS wordmark
 * otherwise, so the header is never broken while the asset is missing. Drop the
 * file in and it swaps over on the next load — no code change needed.
 */
export function Logo({
  href = "/",
  tagline = false,
  size = "default",
}: {
  /** Set to null to render a plain (non-linked) logo. */
  href?: string | null;
  tagline?: boolean;
  size?: "default" | "large";
}) {
  const [useImage, setUseImage] = useState(true);

  // A missing file 404s before hydration, so the onError event is often already
  // gone by the time React attaches its handler. This callback ref catches that
  // case on mount; onError covers everything after.
  const detectMissing = useCallback((img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalWidth === 0) setUseImage(false);
  }, []);

  const mark = useImage ? (
    /* eslint-disable-next-line @next/next/no-img-element -- intentionally a
       plain <img> so the fallback can trigger; next/image errors on 404. */
    <img
      ref={detectMissing}
      src={LOGO_SRC}
      alt="HarwiGadget"
      className={`${size === "large" ? "h-10 max-w-[180px] sm:h-12 sm:max-w-[280px]" : "h-9 max-w-[160px] sm:max-w-[220px]"} w-auto object-contain object-left`}
      onError={() => setUseImage(false)}
    />
  ) : (
    <Wordmark tagline={tagline} size={size} />
  );

  if (!href) return mark;

  return (
    <Link href={href} className="flex shrink-0 items-center" aria-label="HarwiGadget — home">
      {mark}
    </Link>
  );
}

/** Typographic stand-in that matches the brand's two-tone wordmark. */
function Wordmark({
  tagline,
  size,
}: {
  tagline: boolean;
  size: "default" | "large";
}) {
  return (
    <span className="flex flex-col gap-px leading-none">
      <span
        className={`${size === "large" ? "text-[21px] sm:text-[24px]" : "text-[19px]"} font-extrabold tracking-[-0.02em]`}
      >
        <span className="text-brand-text">HARWI</span>
        <span className="text-ink">GADGET</span>
      </span>
      {tagline ? (
        <span
          className={`${size === "large" ? "text-[9px]" : "text-[7.5px]"} font-bold uppercase tracking-[0.19em] text-ink-subtle`}
        >
          Your best gadget solution
        </span>
      ) : null}
    </span>
  );
}
