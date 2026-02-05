import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  // Load env file based on mode (development, production, etc.)
  const env = loadEnv(mode, process.cwd(), '')
  const apiKey = env.SPORTSDB_API_KEY || '123'

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "sass:color";\n@use "@/styles/_variables" as *;`,
          api: 'modern-compiler'
        }
      }
    },
    server: {
      proxy: {
        // Proxy API requests to TheSportsDB during development
        // The API key is injected server-side, never exposed to frontend
        '/api/leagues': {
          target: `https://www.thesportsdb.com/api/v1/json/${apiKey}`,
          changeOrigin: true,
          rewrite: () => '/all_leagues.php'
        },
        // For seasons, we use configure to access the full request URL including query params
        '/api/seasons': {
          target: `https://www.thesportsdb.com`,
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              // Get league ID from query string
              const reqUrl = new URL(req.url || '', `http://${req.headers.host}`)
              const leagueId = reqUrl.searchParams.get('id') || ''
              // Rewrite to the correct TheSportsDB endpoint
              proxyReq.path = `/api/v1/json/${apiKey}/search_all_seasons.php?badge=1&id=${leagueId}`
            })
          }
        }
      }
    }
  }
})
