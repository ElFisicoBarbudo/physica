# Physica

Web de recursos educativos de **Physica**, el proyecto de divulgación de física con música de El Físico Barbudo.

Cada canción tiene su propia página con el videoclip, la letra (con traducción al castellano si está en inglés), una explicación de la física de cada verso relevante, una presentación del tema, actividades, referencias y una **ficha en PDF** para usar en clase.

## Editar sin tocar el código

El repositorio incluye `.pages.yml`, la configuración de [Pages CMS](https://pagescms.org): un editor web gratuito que trabaja directamente sobre este repositorio.

1. Entra en <https://app.pagescms.org> e inicia sesión con la cuenta de GitHub dueña del repositorio.
2. Autoriza el acceso a `ElFisicoBarbudo/physica`.
3. En *Canciones* aparece la lista de canciones, y cada una se edita con formularios: título, enlaces, avisos, créditos y, verso a verso, su traducción y su explicación.

Al guardar, Pages CMS hace el commit y GitHub Actions vuelve a publicar la web en un par de minutos. El resto de este documento explica cómo hacer lo mismo editando los archivos a mano.

## Añadir una canción

1. Copia uno de los archivos de `src/content/canciones/` (por ejemplo `black-hole-spaghettification.md`) y dale un nombre nuevo. El nombre del archivo será la dirección de la página: `mi-cancion.md` → `/canciones/mi-cancion/`.
2. Rellena la cabecera (entre las líneas `---`):

   | Campo | Qué poner |
   | --- | --- |
   | `titulo` | Título de la canción |
   | `anio` | Año (opcional) |
   | `idioma` | `es`, `en` o `ru`. Si no es `es`, la página ofrece mostrar la traducción bajo cada verso |
   | `youtube` | Solo el identificador del vídeo: en `youtube.com/watch?v=dQw4w9WgXcQ` es `dQw4w9WgXcQ` |
   | `spotify` | Enlace completo a la canción en Spotify (opcional) |
   | `avisos` | Lista de avisos para el profesorado: lenguaje malsonante, ironía… (opcional) |
   | `borrador` | `true` muestra un aviso de "pendiente de revisión"; bórralo cuando revises los textos |
   | `estilo` | Estilo musical (opcional) |
   | `resumen` | Una o dos frases para la tarjeta de la portada |
   | `temas` | Lista de temas, sirven para filtrar en la portada |
   | `nivel` | Curso recomendado (opcional) |
   | `orden` | Número para ordenar las canciones en la portada |
   | `creditos` | Lista de `rol` y `nombre` (voz, letra, música, masterización…) |
   | `letra` | Secciones (`seccion`) con sus `versos`. Cada verso lleva `texto`, y opcionalmente `traduccion` y `explicacion` |
   | `actividades` | Preguntas para el alumnado (salen en la ficha con líneas para responder) |
   | `referencias` | `titulo`, `url`, `autor` y `nota` (todos opcionales menos el título) |

3. Debajo de la cabecera, escribe la **presentación del tema** en texto normal (Markdown).

Las explicaciones admiten **negrita**, *cursiva*, enlaces y fórmulas en LaTeX entre dólares: `$F = G\,\dfrac{m_1 m_2}{r^2}$`.

Cada verso suele ser una línea. Si quieres explicar varias líneas juntas, un verso puede ocupar varias con `|`:

```yaml
- texto: |
    We're all falling, falling down,
    nine point eight, all around.
  traduccion: |
    Todos estamos cayendo, cayendo,
    nueve coma ocho, por todas partes.
  explicacion: |
    Cerca de la superficie terrestre...
```

## Trabajar en local

```sh
npm install
npm run dev        # http://localhost:4321/physica/
```

Para generar también los PDF de las fichas en local:

```sh
PUBLIC_FICHAS_PDF=true npm run build
CHROMIUM_PATH=/ruta/a/chrome npm run build:pdf   # deja los PDF en dist/fichas/
```

## Publicación

La web se publica sola en GitHub Pages con cada cambio en `main` (`.github/workflows/deploy.yml`), que además genera los PDF de todas las fichas. Hay que activarlo una vez en **Settings → Pages → Source: GitHub Actions**. La dirección será `https://elfisicobarbudo.github.io/physica/`.

Está hecha con [Astro](https://astro.build). Los textos de la portada están en `src/pages/index.astro`.
