"use client";

import { useSyncExternalStore } from "react";
import { formatDate } from "@/lib/inspection";

const noopSubscribe = () => () => {};

/**
 * Renders a date in the viewer's own locale, which the server can't know.
 * Falls back to the ISO string on the server so hydration has something
 * deterministic to match against, then swaps once we're on the client.
 */
export function LocaleDate({ iso }: { iso: string }) {
  const onClient = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  return <>{onClient ? formatDate(iso) : iso}</>;
}
