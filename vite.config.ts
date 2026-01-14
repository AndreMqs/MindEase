import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

// Host app (container) preparado para Module Federation.
// Você pode futuramente extrair cada pasta em /src/microfrontends/* para projetos separados.
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'mindease_host',
      filename: 'remoteEntry.js',
      exposes: {
        './PanelApp': './src/microfrontends/panel/remote.ts',
        './TasksApp': './src/microfrontends/tasks/remote.ts',
        './ProfileApp': './src/microfrontends/profile/remote.ts',
        './LibraryApp': './src/microfrontends/library/remote.ts',
      },
      // Remotes serão configurados quando você separar os microapps em builds individuais.
      // remotes: { panel: 'http://localhost:5001/assets/remoteEntry.js' },
      shared: ['react', 'react-dom', 'react-router-dom', 'zustand'],
    }),
  ],
  build: {
    target: 'esnext',
    cssCodeSplit: false,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
})
