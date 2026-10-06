// Genera un PDF por canción a partir de su ficha imprimible (/canciones/<slug>/ficha/).
// Se ejecuta después de `astro build`:  PUBLIC_FICHAS_PDF=true npm run build && npm run build:pdf
// Deja los PDF en dist/fichas/<slug>.pdf.
//
// Usa el Chromium indicado en CHROMIUM_PATH, o el que tenga instalado Playwright.
import { createServer } from 'node:http';
import { readFile, readdir, mkdir, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { chromium } from 'playwright-core';

const DIST = new URL('../dist/', import.meta.url).pathname;
const BASE = '/physica/'; // debe coincidir con `base` en astro.config.mjs

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
};

// Servidor mínimo para que las rutas con /physica/ funcionen igual que en GitHub Pages.
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
const origen = `http://127.0.0.1:${servidor.address().port}`;

const slugs = (await readdir(join(DIST, 'canciones'), { withFileTypes: true })).filter((e) => e.isDirectory()).map((e) => e.name);
await mkdir(join(DIST, 'fichas'), { recursive: true });

const navegador = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const pagina = await navegador.newPage();
await pagina.emulateMedia({ media: 'print', colorScheme: 'light' });

for (const slug of slugs) {
  await pagina.goto(`${origen}${BASE}canciones/${slug}/ficha/`, { waitUntil: 'networkidle' });
  await pagina.evaluate(() => document.fonts.ready);
  const titulo = await pagina.locator('h1').first().innerText();
  await pagina.pdf({
    path: join(DIST, 'fichas', `${slug}.pdf`),
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: `<div style="width:100%;font-size:7pt;color:#888;text-align:center;font-family:sans-serif">Física a todo volumen: ${titulo.replace(/[<>&]/g, '')}, página <span class="pageNumber"></span> de <span class="totalPages"></span></div>`,
  });
  console.log(`✓ fichas/${slug}.pdf`);
}

await navegador.close();
servidor.close();
