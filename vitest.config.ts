// 🤖 [IA] - v1.1.17: Vitest configuration for testing environment
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // 🤖 [IA] - TEST-RESILIENCE-FORTIFICATION: Alias para mock de Framer Motion
      'framer-motion': path.resolve(__dirname, './src/__mocks__/framer-motion.tsx'),
    },
  },
  test: {
    // Test environment configuration
    environment: 'jsdom',
    
    // Enable global test APIs (describe, it, expect, etc.)
    globals: true,
    
    // Setup files to run before tests
    setupFiles: './src/__tests__/setup.ts',
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      // 🤖 [IA] - v1.2.36c: Disable clean to avoid EBUSY with Docker mounted directories
      // Root cause: rmdir() fails on mounted directories (both named volumes and bind mounts)
      // Solution: Let coverage overwrite existing files instead of removing directory
      clean: false,
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        'src/__mocks__/',
        '*.config.*',
        'src/main.tsx',
        'src/vite-env.d.ts',
        '**/*.d.ts',
        'dist/',
        'coverage/',
        '.docker/',
        'Scripts/'
      ],
      thresholds: {
        // Start with achievable thresholds
        branches: 60,
        functions: 60,
        lines: 60,
        statements: 60
      }
    },
    
    // Test execution configuration
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    
    // Reporter configuration
    reporters: ['verbose'],
    
    // Test timeout: 20s in CI, 10s locally
    testTimeout: process.env.CI ? 20000 : 10000,
    
    // CSS handling
    css: {
      modules: {
        classNameStrategy: 'non-scoped'
      }
    },

    // 🤖 [IA] - TEST-RESILIENCE-FORTIFICATION: Configuración para mocks y dependencias (actualizado)
    server: {
      deps: {
        inline: [
          'framer-motion', // Forzar inline para usar nuestro mock
          '@testing-library/user-event' // Mejorar compatibilidad con eventos
        ]
      }
    },

    // Pool configuration para mejor performance con mocks
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true // Evitar conflictos entre workers con mocks globales
      }
    }
  },
});