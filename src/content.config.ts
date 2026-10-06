import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Un verso (o grupo de versos) de la letra. `texto` puede ocupar varias líneas.
const verso = z.object({
  texto: z.string(),
  // Traducción al castellano (solo si la canción no está en castellano).
  traduccion: z.string().optional(),
  // Explicación divulgativa del verso. Admite Markdown.
  explicacion: z.string().optional(),
});

const seccion = z.object({
  seccion: z.string().optional(), // "Estrofa 1", "Estribillo"...
  versos: z.array(verso),
});

const referencia = z.object({
  titulo: z.string(),
  url: z.string().url().optional(),
  autor: z.string().optional(),
  nota: z.string().optional(),
});

const canciones = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/canciones' }),
  schema: z.object({
    titulo: z.string(),
    artista: z.string().default('El Físico Barbudo'),
    anio: z.number().int().nullish(),
    idioma: z.enum(['es', 'en', 'ru', 'en-ru']).default('es'),
    // Solo el identificador del vídeo: en https://www.youtube.com/watch?v=dQw4w9WgXcQ es "dQw4w9WgXcQ".
    youtube: z.string().nullish(),
    // Enlace completo a la canción en Spotify.
    spotify: z.string().url().nullish(),
    estilo: z.string().nullish(), // estilo musical: "Deathcore", "Eurobeat"...
    resumen: z.string(),
    temas: z.array(z.string()).default([]),
    nivel: z.string().nullish(),
    orden: z.number().default(100),
    ejemplo: z.boolean().default(false),
    // Textos pendientes de revisión: muestra un aviso en la página.
    borrador: z.boolean().default(false),
    // Avisos para el profesorado (lenguaje malsonante, ironía...).
    avisos: z.array(z.string()).default([]),
    creditos: z.array(z.object({ rol: z.string(), nombre: z.string() })).default([]),
    // Una canción sin letra todavía es válida: así un borrador a medias no rompe la publicación.
    letra: z.array(seccion).default([]),
    actividades: z.array(z.string()).default([]),
    referencias: z.array(referencia).default([]),
  }),
});

// Páginas sueltas editables desde Pages CMS (por ahora, solo "Conóceme").
const paginas = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/paginas' }),
  schema: z.object({
    titulo: z.string(),
    nombre: z.string(),
    lema: z.string().optional(),
    // Enlace completo a una imagen, o ruta dentro de public/ (por ejemplo "media/adrian.jpg").
    foto: z.string().nullish(),
    enlaces: z.array(z.object({ nombre: z.string(), url: z.string().url() })).default([]),
  }),
});

export const collections = { canciones, paginas };
