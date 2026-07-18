import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectRegister: false,
      manifest: {
        name: 'Fuelplan',
        short_name: 'Fuelplan',
        description: 'AI-powered meal, training and recovery planning for athletes.',
        start_url: '/',
        display: 'standalone',
        background_color: '#0e0f11',
        theme_color: '#0e0f11',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      injectManifest: {
        injectionPoint: 'self.__WB_MANIFEST',
        globPatterns: ['**/*.{js,css,html}', 'icons/*.png'],
        // The exercise data (~850KB JSON, bundled as its own JS chunk since
        // it's dynamically imported) matches the js glob above but must NOT
        // be precached — it should only load for users who open Train, and
        // its images are already excluded from precache by not being .js/.css/
        // .html. Match by the chunk name Vite/Rolldown derives from the
        // imported module ('exercises.json' / 'custom-exercises.json').
        globIgnores: ['**/exercises-*.js', '**/custom-exercises-*.js'],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
})
