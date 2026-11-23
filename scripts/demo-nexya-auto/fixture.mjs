// Servidor de DEMONSTRAÇÃO local: dados 100% fictícios. Nunca toca o sistema real.
import http from 'node:http';
import { readFileSync, appendFileSync } from 'node:fs';
const dir = new URL('.', import.meta.url);
const data = () => JSON.parse(readFileSync(new URL('data.json', dir), 'utf8'));
http.createServer(async (req, res) => {
  const path = req.url.split('?')[0];
  const d = data();
  const key = `${req.method} ${path}`;
  const hit = d[key] ?? d[`${req.method} ${path.replace(/\/[a-z0-9-]{6,}(?=\/|$)/g, '/:id')}`];
  appendFileSync(new URL('log.txt', dir), `${hit === undefined ? 'MISS' : 'ok  '} ${req.method} ${req.url}\n`);
  res.writeHead(hit === undefined ? 404 : 200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...(path === '/api/auth/login' ? { 'Set-Cookie': 'nexya_session=demo; Path=/; HttpOnly; SameSite=Lax' } : {}) });
  res.end(JSON.stringify(hit ?? { message: 'não simulado' }));
}).listen(3341, '127.0.0.1');
