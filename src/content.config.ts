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
    idioma: z.enum(['es', 'en']).default('es'),
    // Solo el identificador del vídeo: en https://www.youtube.com/watch?v=dQw4w9WgXcQ es "dQw4w9WgXcQ".
    youtube: z.string().nullish(),
    resumen: z.string(),
    temas: z.array(z.string()).default([]),
    nivel: z.string().nullish(),
    orden: z.number().default(100),
    ejemplo: z.boolean().default(false),
    letra: z.array(seccion),
    actividades: z.array(z.string()).default([]),
    referencias: z.array(referencia).default([]),
  }),
});

export const collections = { canciones };
