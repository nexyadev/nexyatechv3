import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "NEXYA Tech — Tecnologia que transforma ideias em soluções.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logo = await readFile(join(process.cwd(), "public/images/logo-nexya.png"));
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "46px 70px 65px", backgroundColor: "#08090b", backgroundImage: "radial-gradient(ellipse at 100% 100%, #18274e 0%, #08090b 65%)", color: "#f4f4f5" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      {/* next/image is unavailable in the image renderer; the intact local logo is embedded. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`data:image/png;base64,${logo.toString("base64")}`} alt="NEXYA" width={270} height={90} />
      <span style={{ color: "#a2b8ff", fontSize: 14, letterSpacing: 4 }}>TECNOLOGIA EM MOVIMENTO</span>
    </div>
    <div style={{ display: "flex", flexDirection: "column", fontSize: 76, letterSpacing: -4, lineHeight: 1.06 }}><span>Tecnologia que transforma</span><span>ideias em soluções.</span></div>
    <div style={{ display: "flex", fontSize: 18, color: "#a2a6b1", letterSpacing: 3 }}>SISTEMAS · AUTOMAÇÕES · EXPERIÊNCIAS DIGITAIS</div>
  </div>, size);
}
