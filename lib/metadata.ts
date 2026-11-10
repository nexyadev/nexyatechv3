import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";

export function pageMetadata(title: string, description: string, path: string): Metadata {
  return {
    title: { absolute: `${title} | NEXYA Tech` },
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | NEXYA Tech`, description,
      url: new URL(path, siteConfig.url).toString(),
      siteName: "NEXYA Tech", locale: "pt_BR", type: "website",
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "NEXYA Tech — Tecnologia em movimento" }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/opengraph-image"] },
  };
}
