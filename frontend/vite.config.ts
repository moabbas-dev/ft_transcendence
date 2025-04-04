process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert';
import https from 'https';

export default defineConfig({
  plugins: [],
  server: {},
})
