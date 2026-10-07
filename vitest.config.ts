import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    environmentOptions: { jsdom: { url: 'http://localhost:5173' } },
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.tsx'],
    clearMocks: true,
    restoreMocks: true,
  },
})
