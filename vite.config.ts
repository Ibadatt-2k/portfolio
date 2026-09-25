import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command, isPreview }) => ({
  plugins: [react(), tailwindcss()],
  // GitHub Pages serves the site from /portfolio/ (so builds, and previews of
  // them, use that); the dev server stays at /.
  base: command === 'build' || isPreview ? '/portfolio/' : '/',
}))
