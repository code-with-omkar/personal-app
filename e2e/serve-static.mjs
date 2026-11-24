#!/usr/bin/env node
// Minimal static server for the prerendered build (no dependencies).
//   /about      → about/index.html (prerendered)
//   /unknown    → index.csr.html   (client-rendered shell → 404 page)
// Usage: node e2e/serve-static.mjs <dir> [port]
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';

const root = path.resolve(process.argv[2] ?? 'dist/personal-app/browser');
const port = Number(process.argv[3] ?? process.env.PORT ?? 4200);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

async function isFile(p) {
  try {
    return (await stat(p)).isFile();
  } catch {
    return false;
  }
}

async function resolve(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0] ?? '/');
  const target = path.normalize(path.join(root, decoded));
  if (target !== root && !target.startsWith(root + path.sep)) return null; // traversal guard
  if (await isFile(target)) return { file: target, status: 200 };
  const index = path.join(target, 'index.html');
  if (await isFile(index)) return { file: index, status: 200 };
  if (path.extname(decoded)) return null; // missing asset → 404
  return { file: path.join(root, 'index.csr.html'), status: 200 }; // SPA fallback
}

createServer(async (req, res) => {
  const hit = await resolve(req.url ?? '/').catch(() => null);
  if (!hit) {
    res.writeHead(404, { 'content-type': 'text/plain' }).end('Not found');
    return;
  }
  res.writeHead(hit.status, {
    'content-type': TYPES[path.extname(hit.file)] ?? 'application/octet-stream',
    'x-content-type-options': 'nosniff',
  });
  createReadStream(hit.file).pipe(res);
}).listen(port, () => console.log(`Serving ${root} on http://localhost:${port}`));
