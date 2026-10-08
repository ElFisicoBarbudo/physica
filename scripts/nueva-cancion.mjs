// Crea el esqueleto de una canción nueva en src/content/canciones a partir de la letra.
//
//   npm run nueva -- --titulo "Mi canción" --youtube https://youtu.be/XXXXXXXXXXX \
//     --spotify https://open.spotify.com/track/... --estilo Trap --letra letra.txt [--idioma en]
//
// La letra es un archivo de texto con una línea por verso. Una línea en blanco separa estrofas,
// y una línea como "[Coro]", "Verso 2:" o "(Puente)" pone nombre a la estrofa que sigue.
// El archivo sale con `borrador: true` y marcas TODO en los textos que hay que redactar;
// `npm run comprobar -- <slug>` avisa de lo que falte.
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';

const DIR = 'src/content/canciones';

function args(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) continue;
    out[argv[i].slice(2)] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
  }
  return out;
}

export function slugify(s) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function idYoutube(url) {
  const m = String(url).match(/(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/|\/live\/)([\w-]{11})/) ?? String(url).match(/^([\w-]{11})$/);
  if (!m) throw new Error(`No encuentro el identificador de YouTube en «${url}».`);
  return m[1];
}

function enlaceSpotify(url) {
  const m = String(url).match(/open\.spotify\.com\/(?:intl-[a-z]+\/)?track\/(\w+)/);
  if (!m) throw new Error(`«${url}» no parece un enlace a una canción de Spotify (open.spotify.com/track/...).`);
  return `https://open.spotify.com/track/${m[1]}`;
}

// Nombres de sección en inglés o variantes en castellano → los que usa la web.
const SECCIONES = [
  [/^(intro)$/i, 'Intro'],
  [/^(pre-?coro|pre-?chorus|pre-?estribillo)$/i, 'Pre-coro'],
  [/^(coro|estribillo|chorus|hook)$/i, 'Coro'],
  [/^(puente|bridge)$/i, 'Puente'],
  [/^(outro|final)$/i, 'Outro'],
  [/^(verso|verse|estrofa)$/i, 'Verso'],
];

function nombreSeccion(linea) {
  const m = linea.trim().match(/^[\[(]\s*(.+?)\s*[\])]\s*:?$/) ?? linea.trim().match(/^([\p{L}-]+(?:\s+\d+)?)\s*:$/u);
  if (!m) return null;
  const [, dentro] = m;
  const [base, ...resto] = dentro.split(/\s+/);
  for (const [re, nombre] of SECCIONES) if (re.test(base)) return [nombre, ...resto].join(' ');
  return dentro; // "[Ptolomeo]" u otro nombre propio: se respeta tal cual
}

export function parsearLetra(texto) {
  const secciones = [];
  let actual = null;
  let pendiente = null; // nombre leído que se aplica a la siguiente estrofa
  for (const bruta of texto.replace(/\r/g, '').split('\n')) {
    const linea = bruta.trim();
    if (!linea) {
      actual = null;
      continue;
    }
    const nombre = nombreSeccion(linea);
    if (nombre) {
      pendiente = nombre;
      actual = null;
      continue;
    }
    if (!actual) {
      actual = { ...(pendiente ? { seccion: pendiente } : {}), versos: [] };
      secciones.push(actual);
      pendiente = null;
    }
    actual.versos.push({ texto: linea });
  }
  // Numera los versos sin número ("Verso" → "Verso 1", "Verso 2"...).
  let n = 0;
  for (const s of secciones) if (s.seccion === 'Verso') s.seccion = `Verso ${++n}`;
  return secciones;
}

function main() {
  const a = args(process.argv.slice(2));
  const faltan = ['titulo', 'youtube', 'spotify', 'estilo', 'letra'].filter((k) => !a[k]);
  if (faltan.length) {
    console.error(`Faltan: ${faltan.map((k) => '--' + k).join(', ')}`);
    process.exit(1);
  }
  const slug = a.slug ?? slugify(a.titulo);
  const archivo = join(DIR, `${slug}.md`);
  if (existsSync(archivo)) {
    console.error(`Ya existe ${archivo}. Elige otro --slug o edita ese archivo.`);
    process.exit(1);
  }

  const existentes = readdirSync(DIR).filter((f) => f.endsWith('.md'));
  const orden =
    Number(a.orden) ||
    1 +
      Math.max(
        0,
        ...existentes.map((f) => Number(readFileSync(join(DIR, f), 'utf8').match(/^orden:\s*(\d+)/m)?.[1] ?? 0)),
      );

  const letra = parsearLetra(readFileSync(a.letra, 'utf8'));
  const idioma = a.idioma ?? 'es';
  if (idioma !== 'es')
    for (const s of letra) for (const v of s.versos) v.traduccion = 'TODO';

  const datos = {
    titulo: a.titulo,
    artista: 'El Físico Barbudo',
    orden,
    borrador: true,
    youtube: idYoutube(a.youtube),
    spotify: enlaceSpotify(a.spotify),
    estilo: a.estilo,
    genero: 'TODO: 80-90 palabras sobre el género.',
    idioma,
    resumen: 'TODO: 36-46 palabras para la tarjeta de la portada.',
    temas: [],
    creditos: [],
    letra,
    actividades: ['TODO'],
    referencias: [{ titulo: 'TODO' }],
  };
  const cabecera = yaml.dump(datos, { lineWidth: -1, noRefs: true, quotingType: '"' });
  writeFileSync(archivo, `---\n${cabecera}---\n\nTODO: presentación del tema, 130-150 palabras.\n`);

  const versos = letra.reduce((t, s) => t + s.versos.length, 0);
  console.log(`Creado ${archivo}: ${letra.length} estrofas, ${versos} versos, orden ${orden}.`);
  console.log('Secciones:', letra.map((s) => s.seccion ?? '·').join(' | '));
}

if (import.meta.url === `file://${process.argv[1]}`) main();
