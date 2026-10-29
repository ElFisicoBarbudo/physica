// Genera las imágenes que se ven al compartir un enlace (1200×630): una general y una por canción.
// Se ejecuta después de `astro build`:  npm run build && npm run build:imagenes
// Fotografía las plantillas de /og/<slug>/ (src/pages/og/[slug].astro), deja dist/og/<slug>.png
// y borra las plantillas para que no queden como páginas sueltas en la web.
//
// Usa el Chromium indicado en CHROMIUM_PATH, o el que tenga instalado Playwright.
import { readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from 'playwright-core';
import { BASE, DIST, servirDist } from './servidor-dist.mjs';

const { origen, cerrar } = await servirDist();
const carpeta = join(DIST, 'og');
const slugs = (await readdir(carpeta, { withFileTypes: true })).filter((e) => e.isDirectory()).map((e) => e.name);

const navegador = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const pagina = await navegador.newPage({ viewport: { width: 1200, height: 630 } });

for (const slug of slugs) {
  await pagina.goto(`${origen}${BASE}og/${slug}/`, { waitUntil: 'networkidle' });
  await pagina.evaluate(() => document.fonts.ready);
  await pagina.screenshot({ path: join(carpeta, `${slug}.png`) });
  await rm(join(carpeta, slug), { recursive: true });
  console.log(`✓ og/${slug}.png`);
}

await navegador.close();
cerrar();
