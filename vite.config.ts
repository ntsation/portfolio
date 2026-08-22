import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // The Docker/nginx deploy serves the site at "/", but GitHub Pages serves
  // it as a project site at ntsation.github.io/portfolio/ — the Pages
  // workflow sets VITE_BASE_PATH so only that build gets the prefix.
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react()],
  server: {
    // Allows the Vite dev server to be reached through a cloudflared/ngrok
    // tunnel, which forwards requests with a public hostname instead of
    // "localhost".
    allowedHosts: ['.trycloudflare.com', '.ngrok-free.app', '.ngrok.app'],
  },
})
