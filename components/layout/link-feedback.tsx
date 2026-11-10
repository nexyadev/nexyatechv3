"use client";

import { useLinkStatus } from "next/link";

/** Inline pending feedback preserves server-rendered content without a global Suspense shell. */
export function LinkFeedback() {
  const { pending } = useLinkStatus();
  return <span className={`link-loading ${pending ? "is-pending" : ""}`} aria-hidden="true" />;
}
