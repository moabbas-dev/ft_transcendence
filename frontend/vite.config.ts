process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [],
  server: {
    host: true, // allow all hosts or use `pong.local` directly
    port: 5173,
    allowedHosts: ['pong.local'],
  },
})
