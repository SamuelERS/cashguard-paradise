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
      // 🤖 [IA] - v1.3.3-ISSUE1: Intento Fix C - fast-check SIN alias
      // Hallazgo: Alias explícito interfiere con resolución natural de Vite
      // Solución: Eliminar alias, dejar que Vite resuelva desde node_modules naturalmente
      // Razón: fast-check es paquete npm estándar (package.json dependencies), NO necesita alias
    },
  },
  test: {
    // Test environment configuration
    environment: 'jsdom',

    // Enable global test APIs (describe, it, expect, etc.)
    globals: true,

    // Setup files to run before tests
    // 🤖 [IA] - OPERACIÓN ISLA RÁPIDA: Migrado a setup mínimo (94 líneas vs 321)
    // Ref: docs/qa/tests/031-operacion-isla-rapida.md
    setupFiles: './src/__tests__/setup.minimal.ts',

    // Coverage configuration
    // 🤖 [IA] - v2.5.0: Expanded to global coverage (all hooks + utils)
    coverage: {
      provider: 'v8',
      // 🤖 [IA] - v1.2.36c: Disable clean to avoid EBUSY with Docker mounted directories
      clean: false,
      reporter: ['text', 'json', 'html', 'lcov'],
      // 🤖 [IA] - v2.5.0: Expanded from Deliveries/PIN → ALL hooks and utils
      // Previous: Only 'src/components/deliveries/**', 'src/hooks/useDeliveries.ts', etc.
      // Now: Full hooks + utils coverage for global metrics
      include: [
        'src/hooks/**',
        'src/utils/**',
        'src/components/deliveries/**',
        'src/components/ui/pin-modal.tsx'
      ],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        'src/__mocks__/',
        '*.config.*',
        'src/main.tsx',
        'src/vite-env.d.ts',
        '**/*.d.ts',
        '**/*.test.*',
        '**/*.spec.*',
        '**/__tests__/**',
        'dist/',
        'coverage/',
        '.docker/',
        'Scripts/',
        'src/types/**',
        'src/pages/**',
        'src/data/**'
      ],
      // 🤖 [IA] - v2.5.1: Thresholds ajustados a 20% para cobertura global
      // Reason: Scope expandido a ALL hooks/utils incluye muchos archivos sin tests
      // Progreso: 15% -> 20% con nuevos tests para propValidation, reportHelpers,
      //          useLocalStorage, useOperationMode, useTheme
      // Target: Incrementar gradualmente a 30%+ conforme se agreguen más tests
      thresholds: {
        branches: 15,
        functions: 20,
        lines: 20,
        statements: 20
      }
    },

    // Test execution configuration
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],

    // Reporter configuration
    reporters: ['verbose'],

    // Test timeout: 30s CI, 15s local (reducido de 120s/60s - batch fix v1.3.7e revertido)
    testTimeout: process.env.CI ? 30000 : 15000,

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

    // 🤖 [IA] - OPERACIÓN ISLA RÁPIDA: Pool configuration para paralelismo estable
    // Decisión: pool: 'forks' (preferido para estabilidad con librerías nativas)
    // Alternativa: pool: 'threads' (más rápido, usar si no hay issues)
    // Ref: docs/qa/tests/031-operacion-isla-rapida.md Tarea D
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: false, // ⚠️ CAMBIADO: false para habilitar paralelismo real
        maxForks: 4, // Límite razonable para evitar saturación
        minForks: 1
      }
    }
  },
});