// Converte as capturas da conta de DEMONSTRAÇÃO (dados fictícios) em AVIF + WebP para public/images/demo.
import sharp from 'sharp';
const [raw, out] = process.argv.slice(2);
const jobs = [['desktop-dashboard', 'nexya-auto-painel', 1600], ['desktop-service-orders', 'nexya-auto-os', 1600], ['desktop-budgets', 'nexya-auto-orcamentos', 1600], ['mobile-dashboard', 'nexya-auto-celular-painel', 600], ['mobile-service-orders', 'nexya-auto-celular-os', 600]];
for (const [src, name, w] of jobs) {
  const img = sharp(`${raw}/${src}.png`).resize({ width: w });
  await img.clone().webp({ quality: 82 }).toFile(`${out}/${name}.webp`);
  await img.clone().avif({ quality: 55 }).toFile(`${out}/${name}.avif`);
}
// Imagem alta para a "rolagem" dentro da tela do notebook: 3 telas empilhadas.
const w = 1200, h = 750;
const parts = await Promise.all(['desktop-dashboard', 'desktop-service-orders', 'desktop-budgets'].map((n) => sharp(`${raw}/${n}.png`).resize({ width: w, height: h }).toBuffer()));
const tall = sharp({ create: { width: w, height: h * 3, channels: 3, background: '#0b0c0e' } }).composite(parts.map((input, i) => ({ input, top: i * h, left: 0 })));
const buf = await tall.png().toBuffer();
await sharp(buf).webp({ quality: 80 }).toFile(`${out}/nexya-auto-rolagem.webp`);
await sharp(buf).avif({ quality: 50 }).toFile(`${out}/nexya-auto-rolagem.avif`);
