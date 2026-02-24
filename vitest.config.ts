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

    // 🤖 [IA] - ORDEN-DACC/FASE-2+3: Pool config — API Vitest 4 (poolOptions eliminado)
    // Vitest 4 breaking change: poolOptions removido, opciones son ahora top-level
    // Ref: https://vitest.dev/guide/migration#pool-rework
    // maxForks → maxWorkers | minForks → eliminado | execArgv → top-level
    pool: 'forks',
    maxWorkers: 2, // Reducido de 4: cada fork puede usar hasta 12GB → 2×12GB=24GB = límite máquina
    // 🤖 [IA] - ORDEN-DACC/FASE-2: Fix OOM en fork processes
    // Root cause: CashCalculation.test.tsx + jsdom + React infraestructura consume >8GB
    // Fork processes heredan el límite default de Node.js (~4GB) → FATAL OOM a ~4085 MB
    // execArgv top-level en Vitest 4 se propaga a CADA proceso hijo fork
    // Aumentado de 8192 → 12288: test consume >8GB, máquina tiene 24GB RAM
    execArgv: ['--max-old-space-size=12288'],
  },
});