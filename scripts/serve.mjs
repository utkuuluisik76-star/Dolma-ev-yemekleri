// Serves the static export in /out for local testing: npm start (http://localhost:4173, or $PORT)
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../out', import.meta.url));
// PORT lets two projects preview side by side (the QA scripts read the same variable).
const port = Number(process.env.PORT) || 4182;
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.avif': 'image/avif', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png',
  '.woff2': 'font/woff2', '.txt': 'text/plain', '.xml': 'application/xml', '.webmanifest': 'application/manifest+json',
};

createServer(async (req, res) => {
  let file = join(root, normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)));
  try {
    if (!file.startsWith(root)) throw new Error('outside root');
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    // Behave like a real host: compress text and cache hashed build assets.
    const type = types[extname(file)] ?? 'application/octet-stream';
    let body = await readFile(file);
    const headers = { 'Content-Type': type };
    if (/text|javascript|json|svg|xml/.test(type) && /gzip/.test(req.headers['accept-encoding'] ?? '')) {
      body = gzipSync(body);
      headers['Content-Encoding'] = 'gzip';
    }
    if (file.includes('_next')) headers['Cache-Control'] = 'public, max-age=31536000, immutable';
    res.writeHead(200, headers);
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(await readFile(join(root, '404.html')).catch(() => 'Not found'));
  }
}).listen(port, () => console.log(`http://localhost:${port}`));
