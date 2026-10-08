import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // The lazily loaded three.js chunk is expected to be large; the home page doesn't load it.
  build: { chunkSizeWarningLimit: 1000 },
})
