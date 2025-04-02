import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert';
import https from 'https';

export default defineConfig({
  plugins: [mkcert()],
  server: {
    proxy: {
      '/api/auth': {
        target: 'https://localhost:8001',
        changeOrigin: true,
        secure: false, // set false if you're using self-signed certs
        agent: new https.Agent({ rejectUnauthorized: false }),
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/api/notifications': {
        target: 'https://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/notifications/, '')
      }
    }
  },
  logLevel: 'error',
})
