// Gera public/brand/nexya-wordmark.svg a partir da logo oficial: remove só a tagline e as hairlines; paths intactas.
import { readFileSync, writeFileSync } from "node:fs";
const src = readFileSync("public/brand/nexya-logo-claro.svg", "utf8");
const g = src.match(/<g id="nx-wordmark"[\s\S]*?<\/g>/)[0].replace(/fill="url\(#metal-claro\)"/, 'fill="currentColor"');
const out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="590 365 2020 332" fill="currentColor" role="img" aria-label="NEXYA">\n<title>NEXYA</title>\n${g}\n</svg>\n`;
writeFileSync("public/brand/nexya-wordmark.svg", out);
const paths = (s) => s.match(/ d="[^"]+"/g).join("");
if (!paths(src).includes(paths(out))) throw new Error("paths divergentes");
console.log("ok", out.length);
