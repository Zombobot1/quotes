import { sentryVitePlugin } from '@sentry/vite-plugin'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(),
      mode === 'production'
        ? sentryVitePlugin({
            org: 'ali-3wo',
            project: 'mw-th',
          })
        : undefined,
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    optimizeDeps: {
      exclude: ['@sqlite.org/sqlite-wasm'],
      include: ['react/jsx-dev-runtime'],
    },

    build: {
      sourcemap: true,
    },

    test: {
      coverage: {
        provider: 'istanbul',
        include: ['src/**/*'],
        exclude: ['src/initSentry.ts', 'src/main.tsx', 'src/index.css', 'src/reset.css'],
      },
      browser: {
        enabled: true,
        name: 'chrome',
        provider: 'webdriverio',
        // https://webdriver.io
        providerOptions: {},
      },
    },
  }
})
