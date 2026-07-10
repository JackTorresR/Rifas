import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Troque "rifa-beneficente" pelo nome exato do seu repositório no GitHub
// caso o repositório tenha outro nome. Isso é necessário para o GitHub Pages
// servir os arquivos estáticos no caminho correto.
export default defineConfig({
  plugins: [react()],
  base: '/rifa-beneficente/',
});
