import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Pass esbuild options directly to the react plugin
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
          '.jsx': 'jsx',
          '.ts': 'tsx',
          '.tsx': 'tsx'
        }
      }
    })
  ]
})
