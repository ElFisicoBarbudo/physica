// Servidor mínimo de la carpeta dist/ para que los scripts de después de compilar (fichas en PDF,
// imágenes para compartir) abran las páginas igual que en GitHub Pages.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

export const DIST = new URL('../dist/', import.meta.url).pathname;
export const BASE = '/'; // debe coincidir con `base` en astro.config.mjs

const tipos = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
};

/** Arranca el servidor y devuelve su dirección (http://127.0.0.1:<puerto>) y una función para cerrarlo. */
export async function servirDist() {
  const servidor = createServer(async (req, res) => {
    try {
      let ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (!ruta.startsWith(BASE)) throw new Error('fuera de base');
      ruta = normalize(join(DIST, ruta.slice(BASE.length)));
      if (!ruta.startsWith(DIST)) throw new Error('ruta no válida');
      if ((await stat(ruta)).isDirectory()) ruta = join(ruta, 'index.html');
      res.writeHead(200, { 'content-type': tipos[extname(ruta)] ?? 'application/octet-stream' });
      res.end(await readFile(ruta));
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((ok) => servidor.listen(0, '127.0.0.1', ok));
  return { origen: `http://127.0.0.1:${servidor.address().port}`, cerrar: () => servidor.close() };
}
