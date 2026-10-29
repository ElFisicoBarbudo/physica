// Mapa del sitio para buscadores: se genera solo en cada publicación con todas las páginas públicas.
import type { APIRoute } from 'astro';
import { cancionesOrdenadas } from '../lib/util';

export const GET: APIRoute = async ({ site }) => {
  const canciones = await cancionesOrdenadas();
  const rutas = ['', 'conoceme/', 'faq/', 'feedback/', ...canciones.map((c) => `canciones/${c.id}/`)];
  const urls = rutas.map((r) => `  <url><loc>${new URL(r, site).href}</loc></url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  });
};
