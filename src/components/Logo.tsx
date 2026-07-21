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
    <span
      className={`${size === "large" ? "h-11 w-[148px] sm:h-12 sm:w-[164px]" : "h-9 w-[120px] sm:h-10 sm:w-[136px]"} relative block shrink-0 overflow-hidden`}
    >
      {/* The supplied logo has generous vertical canvas space. Cropping it in
          the viewport keeps the source untouched while making the visible mark
          an intentional size. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- intentionally a
          plain <img> so the missing-asset fallback can trigger. */}
      <img
        ref={detectMissing}
        src={LOGO_SRC}
        alt="HarwiGadget"
        className={`${size === "large" ? "w-[166px] sm:w-[184px]" : "w-[134px] sm:w-[152px]"} absolute top-1/2 left-1/2 h-auto max-w-none -translate-x-1/2 -translate-y-1/2`}
        onError={() => setUseImage(false)}
      />
    </span>
  ) : (
    <Wordmark tagline={tagline} size={size} />
  );

  if (!href) return mark;

  return (
    <Link
      href={href}
      className="flex shrink-0 items-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
      aria-label="HarwiGadget — home"
    >
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
