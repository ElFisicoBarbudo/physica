// Revisa que una o varias canciones cumplan las pautas de la web (longitudes, campos, TODO pendientes...).
//
//   npm run comprobar -- mi-cancion          # una canción
//   npm run comprobar                        # todas
//
// Los ERRORES rompen la página o dejan texto sin redactar; los AVISOS son pautas de estilo.
// Sale con código 1 si hay algún error.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';

const DIR = 'src/content/canciones';
const SECCIONES = /^(Intro|Verso \d+|Pre-coro|Coro|Puente|Outro)( \d+)?( · .+)?$/;

const palabras = (s) =>
  String(s ?? '')
    .replace(/\$[^$]*\$/g, 'x') // una fórmula cuenta como una palabra
    .replace(/[*_#>`]/g, ' ')
    .split(/\s+/)
    .filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
const negritas = (s) => (String(s ?? '').match(/\*\*[^*]+\*\*/g) ?? []).length;

function comprobar(slug) {
  const errores = [];
  const avisos = [];
  const texto = readFileSync(join(DIR, `${slug}.md`), 'utf8');
  const m = texto.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { errores: ['No tiene cabecera entre líneas ---'], avisos };
  let d;
  try {
    d = yaml.load(m[1]);
  } catch (e) {
    return { errores: [`La cabecera no es YAML válido: ${e.message.split('\n')[0]}`], avisos };
  }
  const cuerpo = m[2].trim();

  if (/\bTODO\b/.test(texto)) errores.push(`Quedan ${texto.match(/\bTODO\b/g).length} marcas TODO sin redactar.`);
  for (const k of ['titulo', 'resumen']) if (!d[k]) errores.push(`Falta «${k}».`);
  if (d.youtube && !/^[\w-]{11}$/.test(d.youtube)) errores.push(`youtube debe ser solo el código de 11 caracteres («${d.youtube}»).`);
  if (!d.youtube) avisos.push('Sin vídeo de YouTube.');
  if (d.spotify && !/^https:\/\/open\.spotify\.com\/track\/\w+$/.test(d.spotify))
    avisos.push(`El enlace de Spotify tiene parámetros o no es de una canción: ${d.spotify}`);
  if (!['es', 'en', 'ru', 'en-ru'].includes(d.idioma ?? 'es')) errores.push(`idioma no válido: ${d.idioma}`);

  const r = palabras(d.resumen);
  if (r < 36 || r > 46) avisos.push(`El resumen tiene ${r} palabras (pauta: 36-46).`);
  if (!d.genero) avisos.push('Falta el texto del género.');
  else {
    const g = palabras(d.genero);
    if (g < 78 || g > 95) avisos.push(`El texto del género tiene ${g} palabras (pauta: 80-90).`);
  }
  const p = palabras(cuerpo);
  if (p < 130 || p > 150) avisos.push(`La presentación tiene ${p} palabras (pauta: 130-150).`);
  const n = negritas(cuerpo);
  if (n < 3 || n > 5) avisos.push(`La presentación tiene ${n} conceptos en negrita (pauta: 3-5).`);

  const letra = d.letra ?? [];
  if (!letra.length) errores.push('No hay letra.');
  if (letra.length && !letra[0].seccion) avisos.push('La primera estrofa no tiene nombre de sección (Intro, Verso 1...).');
  const explicados = new Set();
  let explicaciones = 0;
  letra.forEach((s, i) => {
    if (s.seccion && !SECCIONES.test(s.seccion)) avisos.push(`Sección con nombre poco habitual: «${s.seccion}».`);
    for (const v of s.versos ?? []) {
      if (!v.texto) errores.push(`Hay un verso sin texto en la estrofa ${i + 1}.`);
      if ((d.idioma ?? 'es') !== 'es' && !v.traduccion) avisos.push(`Verso sin traducción: «${v.texto}».`);
      if (v.explicacion) {
        explicaciones++;
        const clave = String(v.texto).trim().toLowerCase();
        if (explicados.has(clave)) avisos.push(`El verso «${v.texto}» se explica más de una vez (basta la primera).`);
        explicados.add(clave);
      }
    }
  });
  if (!explicaciones) avisos.push('Ningún verso tiene explicación.');

  const act = d.actividades ?? [];
  if (act.length < 3 || act.length > 4) avisos.push(`Hay ${act.length} actividades (pauta: 3-4).`);
  for (const a of act)
    if (/\b(calcula|alumnado|alumnos|profesor|pide a|pídeles)\b/i.test(a))
      avisos.push(`Actividad que no va dirigida al alumno o pide cálculos: «${a.slice(0, 70)}…»`);
  const refs = d.referencias ?? [];
  if (refs.length < 2) avisos.push(`Solo hay ${refs.length} referencias.`);
  for (const ref of refs) if (ref.url && !/^https?:\/\//.test(ref.url)) errores.push(`URL no válida en referencias: ${ref.url}`);

  if (!(d.temas ?? []).length) avisos.push('Sin temas: salen de la hoja de Adrián, no los inventes.');
  if (!(d.creditos ?? []).length) avisos.push('Sin créditos: salen de la hoja de Adrián.');
  return { errores, avisos };
}

const pedidas = process.argv.slice(2).map((s) => s.replace(/^.*\//, '').replace(/\.md$/, ''));
const slugs = pedidas.length ? pedidas : readdirSync(DIR).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3));
let fallos = 0;
for (const slug of slugs) {
  const { errores, avisos } = comprobar(slug);
  fallos += errores.length;
  console.log(`${errores.length ? '✗' : avisos.length ? '·' : '✓'} ${slug}`);
  for (const e of errores) console.log(`    ERROR  ${e}`);
  for (const a of avisos) console.log(`    aviso  ${a}`);
}
process.exit(fallos ? 1 : 0);
