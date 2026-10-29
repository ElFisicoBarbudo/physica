// @ts-check
import { defineConfig } from 'astro/config';

// La web se publica en GitHub Pages con dominio propio: https://fisicaatodovolumen.com/
// (el dominio se configura en Settings → Pages → Custom domain).
export default defineConfig({
  site: 'https://fisicaatodovolumen.com',
  base: '/',
  trailingSlash: 'always',
  // Imágenes externas que se descargan al publicar y se sirven desde la web (la foto de «Conóceme»).
  image: {
    domains: ['www.elfisicobarbudo.com', 'elfisicobarbudo.com'],
  },
});
