"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Prototype routes bring their own header, footer and opening; every other route is unchanged. */
export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return pathname.startsWith("/lab") ? null : children;
}
