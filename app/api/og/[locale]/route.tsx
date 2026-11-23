import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getMessages } from "@/i18n/dictionaries";
import { defaultLocale, isLocale, locales } from "@/i18n/routing";

/** Imagem Open Graph por idioma (1200x630). URL estável e sem redirect: /api/og/<locale>. */
export const dynamic = "force-static";
export function generateStaticParams() { return locales.map((locale) => ({ locale })); }

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const m = getMessages(isLocale(raw) ? raw : defaultLocale).meta;
  const logo = await readFile(join(process.cwd(), "public/brand/nexya-logo-escuro.svg"));
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "46px 70px 65px", backgroundColor: "#050505", backgroundImage: "radial-gradient(ellipse at 100% 100%, #2a2a2a 0%, #050505 60%)", color: "#f4f4f2" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      {/* next/image is unavailable in the image renderer; the intact local logo is embedded. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`data:image/svg+xml;base64,${logo.toString("base64")}`} alt="NEXYA" width={420} height={76} />
      <span style={{ color: "#b4b4b2", fontSize: 14, letterSpacing: 4 }}>NEXYATECH.COM.BR</span>
    </div>
    <div style={{ display: "flex", flexDirection: "column", fontSize: 72, letterSpacing: -4, lineHeight: 1.06 }}><span>{m.ogLine1}</span><span>{m.ogLine2}</span></div>
    <div style={{ display: "flex", fontSize: 18, color: "#a3a3a3", letterSpacing: 3 }}>{m.ogTagline}</div>
  </div>, { width: 1200, height: 630 });
}
