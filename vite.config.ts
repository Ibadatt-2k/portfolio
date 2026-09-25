import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Served from the root of the custom domain (ibadatt.dev), so no base path.
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
