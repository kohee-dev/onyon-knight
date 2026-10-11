import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.SITE_URL ?? 'http://localhost:4321',
  base: process.env.BASE_PATH ?? '/',
  // 'ignore': las imágenes y el manifiesto son archivos (sin barra final); las páginas se enlazan con barra.
  trailingSlash: 'ignore',
  build: { format: 'directory' },
});
