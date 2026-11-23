// Roda depois do build (npm "postbuild"). Falha se o HTML pré-renderizado, os dicionários ou o README tiverem:
// - emoji ou símbolo que vira emoji (Unicode Extended_Pictographic, bandeiras, setas, visto, estrelas, play, VS16);
// - marcadores de conteúdo pendente: [PREENCHER] ou [FOTO REAL AQUI].
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const EMOJI = /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}←-⇿✓-✘★☆✦➜➔▶▸◀️]/gu;
const PENDING = /\[PREENCHER\]|\[FOTO REAL AQUI\]/g;

function walk(dir, filter, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, filter, out);
    else if (filter(p)) out.push(p);
  }
  return out;
}

// Só o texto visível e os atributos do HTML (ignora <script>/<style>, onde comentários de código podem ter setas).
const htmlText = (html) => html.replace(/<script[\s\S]*?<\/script>/g, (s) => (s.includes("application/ld+json") ? s : "")).replace(/<style[\s\S]*?<\/style>/g, "");
// Nos fontes de texto, ignora comentários de código.
const stripComments = (src) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

const targets = [
  ...walk(".next/server/app", (p) => p.endsWith(".html")).map((p) => [p, htmlText(readFileSync(p, "utf8"))]),
  ...walk("i18n/messages", (p) => p.endsWith(".ts")).map((p) => [p, stripComments(readFileSync(p, "utf8"))]),
  ["README.md", readFileSync("README.md", "utf8")],
];

const problems = [];
for (const [file, text] of targets) {
  for (const m of text.matchAll(EMOJI)) problems.push(`${file}: emoji/símbolo ${JSON.stringify(m[0])} perto de "${text.slice(Math.max(0, m.index - 40), m.index + 20).replace(/\s+/g, " ")}"`);
  if (file.endsWith(".html")) for (const m of text.matchAll(PENDING)) problems.push(`${file}: marcador pendente ${m[0]} no HTML de produção`);
}

if (problems.length) {
  console.error(`check-release: ${problems.length} problema(s)\n` + problems.slice(0, 40).join("\n"));
  process.exit(1);
}
console.log(`check-release: OK (${targets.length} arquivos verificados, nenhum emoji e nenhum marcador pendente)`);
