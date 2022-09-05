import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  base:'./',
  server:{
    host:'0.0.0.0',
    port:3001,
    proxy:{
      '/api':{
        target:'http://117.33.151.81:3000',
        rewrite:path=>path.replace(/^\/api/,'')
      }
    }
  }
})
