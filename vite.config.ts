import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUpstream = env.API_UPSTREAM?.trim()

  if (apiUpstream) {
    let upstreamUrl: URL

    try {
      upstreamUrl = new URL(apiUpstream)
    } catch {
      throw new Error('API_UPSTREAM must be a valid http(s) origin without a path.')
    }

    if (
      !['http:', 'https:'].includes(upstreamUrl.protocol) ||
      upstreamUrl.username ||
      upstreamUrl.password ||
      (upstreamUrl.pathname !== '/' && upstreamUrl.pathname !== '') ||
      upstreamUrl.search ||
      upstreamUrl.hash
    ) {
      throw new Error('API_UPSTREAM must be an http(s) origin without credentials, path, query, or hash.')
    }
  }

  return {
    plugins: [react()],
    server: apiUpstream
      ? {
          proxy: {
            '/userController': {
              target: apiUpstream,
              changeOrigin: true,
            },
          },
        }
      : undefined,
  }
})
