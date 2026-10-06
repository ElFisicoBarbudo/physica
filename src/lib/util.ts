import { marked } from 'marked';
import markedKatex from 'marked-katex-extension';

// Fórmulas con sintaxis LaTeX: $F = ma$ en línea, $$...$$ en bloque.
marked.use(markedKatex({ throwOnError: false, nonStandard: true }));
import { getCollection } from 'astro:content';

/** Markdown en línea (sin <p> envolvente), para versos y notas cortas. */
export const mdInline = (s = '') => marked.parseInline(s) as string;

/** Markdown de bloque, para explicaciones con varios párrafos. */
export const md = (s = '') => marked.parse(s) as string;

/** Ruta interna respetando el `base` de Astro (GitHub Pages sirve la web en /physica/). */
export const url = (path = '') => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${path.replace(/^\//, '')}`;
};

/** Nombre del proyecto. Cambiarlo aquí lo cambia en toda la web. */
export const NOMBRE = 'Física a todo volumen';

export const youtubeUrl = (id?: string | null) => (id ? `https://www.youtube.com/watch?v=${id}` : undefined);

export async function cancionesOrdenadas() {
  const todas = await getCollection('canciones');
  return todas.sort((a, b) => a.data.orden - b.data.orden || a.data.titulo.localeCompare(b.data.titulo, 'es'));
}

export const idiomas = { es: 'Castellano', en: 'Inglés', ru: 'Ruso', 'en-ru': 'Inglés y ruso' } as const;

/** Para frases como "Deathcore, en inglés". */
export const idiomaEn = { es: 'en castellano', en: 'en inglés', ru: 'en ruso', 'en-ru': 'en inglés y ruso' } as const;
