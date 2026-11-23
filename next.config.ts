import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: { formats: ["image/avif", "image/webp"] },
  // /portfolio virou /projetos (mesma palavra do menu). 301 explícito, como pedido.
  async redirects() {
    return [
      { source: "/portfolio", destination: "/projetos", statusCode: 301 },
      { source: "/portfolio/:slug", destination: "/projetos/:slug", statusCode: 301 },
    ];
  },
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    }];
  },
};
export default withNextIntl(nextConfig);
