import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Allows the Vite dev server to be reached through a cloudflared/ngrok
    // tunnel, which forwards requests with a public hostname instead of
    // "localhost".
    allowedHosts: ['.trycloudflare.com', '.ngrok-free.app', '.ngrok.app'],
  },
})
