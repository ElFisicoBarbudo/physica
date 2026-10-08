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
  seccion: z.string().optional(), // "Intro", "Verso 1", "Coro", "Puente"...
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
    // Breve historia o descripción del estilo musical.
    genero: z.string().nullish(),
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
    // Canales o personas con las que se hizo la canción (ver la colección `colaboradores`).
    // Pages CMS guarda la ruta del archivo (y una sola como texto suelto): se normaliza a la lista de identificadores.
    colaboradores: z
      .union([z.string(), z.array(z.string())])
      .default([])
      .transform((v) => (Array.isArray(v) ? v : [v]).map((r) => r.split('/').pop()!.replace(/\.md$/, ''))),
    // Una canción sin letra todavía es válida: así un borrador a medias no rompe la publicación.
    letra: z.array(seccion).default([]),
    actividades: z.array(z.string()).default([]),
    referencias: z.array(referencia).default([]),
  }),
});

// Canales y personas que colaboran en alguna canción. Cada una sale en la página de sus canciones.
const colaboradores = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/colaboradores' }),
  schema: z.object({
    nombre: z.string(), // nombre del canal o de la persona
    persona: z.string().optional(), // quién está detrás, si el nombre es de un canal
    youtube: z.string().url().optional(),
    instagram: z.string().url().optional(),
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
    // Resumen del currículum en la columna lateral: cada grupo tiene un título y varias líneas.
    trayectoria: z.array(z.object({ titulo: z.string(), items: z.array(z.string()).default([]) })).default([]),
  }),
});

export const collections = { canciones, colaboradores, paginas };
