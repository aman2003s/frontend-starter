import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/__tests__/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        '**/node_modules/**',
        '**/__tests__/**',
        '**/*.test.{ts,tsx}',
        '**/server/seeds.ts',
        '**/.eslintrc.cjs',
        '**/vite.config.ts'
      ],
      lines: 90,
      branches: 90,
      functions: 90,
      statements: 90
    }
  }
});
