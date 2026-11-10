import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  const isLocal = ["localhost", "127.0.0.1"].includes(new URL(siteConfig.url).hostname);
  return { rules: { userAgent: "*", ...(isLocal ? { disallow: "/" } : { allow: "/" }) }, sitemap: new URL("/sitemap.xml", siteConfig.url).toString() };
}
