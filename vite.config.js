import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Map components import Leaflet; they stay in their own lazy chunks.
const MAP_MODULE = /[\\/]src[\\/]components[\\/](\w+Map|ElectionView)\.jsx$/;
// Libraries only the election page uses (ward-merging geometry) stay out of the vendor file.
// Leaflet's CSS also stays out, so pages without a map don't download it.
const ELECTION_ONLY_LIB = /node_modules[\\/](@turf|polyclip-ts|bignumber\.js|splaytree-ts)[\\/]/;

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  build: {
    rollupOptions: {
      output: {
        // CIV-1762: every file is one billed Vercel request. Libraries go in one long-cached
        // vendor file; small app modules shared by several pages go in one file instead of
        // a dozen 1-3 kB ones. Bigger page modules keep their own chunks.
        codeSplitting: {
          groups: [
            { name: 'vendor', test: (id) => /node_modules/.test(id) && !/\.css$/.test(id) && !ELECTION_ONLY_LIB.test(id), priority: 20 },
            { name: 'shared', test: (id) => /[\\/]src[\\/]/.test(id) && !MAP_MODULE.test(id), minShareCount: 2, maxModuleSize: 10000, priority: 10 },
          ],
        },
      },
    },
  },
})
