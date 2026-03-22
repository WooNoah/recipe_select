import { defineConfig } from 'vite'
// @ts-ignore
import UniPlugin from '@dcloudio/vite-plugin-uni'

const uni = typeof UniPlugin === 'function' ? UniPlugin : UniPlugin.default

const isProduction = process.env.NODE_ENV === 'production'

export default defineConfig({
  base: isProduction ? '/recipe_select/' : '/',
  plugins: [uni()],
  build: {
    sourcemap: false
  }
})
