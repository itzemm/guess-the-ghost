// Tiny local server for testing without a Vercel account: `npm run dev`
// Serves public/ and runs the functions in api/ the same way Vercel does.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = join(import.meta.dirname, 'public');
const TYPES = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp',
};

createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');

  if (pathname.startsWith('/api/')) {
    try {
      const mod = await import(`./api/${pathname.slice(5).replace(/[^\w-]/g, '')}.js`);
      let raw = '';
      for await (const chunk of req) raw += chunk;
      req.body = raw ? JSON.parse(raw) : undefined;
      return await mod.default(req, res);
    } catch (err) {
      console.error(err);
      res.statusCode = 404;
      return res.end('Not found');
    }
  }

  const file = normalize(join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname));
  if (!file.startsWith(PUBLIC_DIR)) return res.writeHead(403).end();
  try {
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' }).end(data);
  } catch {
    res.writeHead(404).end('Not found');
  }
}).listen(PORT, () => console.log(`Guess the Ghost running at http://localhost:${PORT}`));
