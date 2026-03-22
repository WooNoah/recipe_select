import { defineConfig } from 'vite'
import UniPlugin from '@dcloudio/vite-plugin-uni'
const uni = (UniPlugin as any).default || UniPlugin

const isProduction = process.env.NODE_ENV === 'production'

export default defineConfig({
  base: isProduction ? '/recipe_select/' : '/',
  plugins: [uni()],
  build: {
    sourcemap: false
  }
})
