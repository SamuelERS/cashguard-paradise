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
      // 🤖 [IA] - v1.2.36c: Thresholds intermedios - Baseline realista + commitment de mejora gradual
      // Actual coverage: 18.41% lines/statements, 23.25% functions, 56.25% branches
      // Strategy: Establecer baseline alcanzable + buffer mínimo para fluctuaciones
      // Roadmap de mejora comprometida:
      //   - Q1 2025 (Marzo): 30% coverage (Fase 2: hooks críticos)
      //   - Q2 2025 (Junio): 35% coverage (Fase 2: componentes de cálculo)
      //   - Q3 2025 (Septiembre): 50% coverage (Fase 3: flows completos)
      //   - Q4 2025 (Diciembre): 60% coverage (Fase 4: profesionalización)
      // Critical: calculations.ts ya en 100% coverage ✅
      thresholds: {
        branches: 55,      // Actual: 56.25% ✅
        functions: 25,     // Actual: 23.25% + buffer 1.75%
        lines: 20,         // Actual: 18.41% + buffer 1.59%
        statements: 20     // Actual: 18.41% + buffer 1.59%
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