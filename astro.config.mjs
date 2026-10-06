// @ts-check
import { defineConfig } from 'astro/config';

// La web se publica en GitHub Pages: https://elfisicobarbudo.github.io/physica/
// Si algún día se usa un dominio propio, cambia `site` y pon `base: '/'`.
export default defineConfig({
  site: 'https://elfisicobarbudo.github.io',
  base: '/physica',
  trailingSlash: 'always',
});
