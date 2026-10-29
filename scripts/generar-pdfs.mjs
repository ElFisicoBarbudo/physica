// Genera un PDF por canción a partir de su ficha imprimible (/canciones/<slug>/ficha/).
// Se ejecuta después de `astro build`:  PUBLIC_FICHAS_PDF=true npm run build && npm run build:pdf
// Deja los PDF en dist/fichas/<slug>.pdf.
//
// Usa el Chromium indicado en CHROMIUM_PATH, o el que tenga instalado Playwright.
import { readdir, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from 'playwright-core';
import { BASE, DIST, servirDist } from './servidor-dist.mjs';

const { origen, cerrar } = await servirDist();

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
cerrar();
