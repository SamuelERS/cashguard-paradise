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
    // 🤖 [IA] - Operación Cristal Fase 1: Coverage scoped to Deliveries/PIN module
    coverage: {
      provider: 'v8',
      // 🤖 [IA] - v1.2.36c: Disable clean to avoid EBUSY with Docker mounted directories
      clean: false,
      reporter: ['text', 'json', 'html', 'lcov'],
      // 🤖 [IA] - Operación Cristal Fase 1: Include ONLY Deliveries/PIN scope
      include: [
        'src/components/deliveries/**',
        'src/components/ui/pin-modal.tsx',
        'src/hooks/useDeliveries.ts',
        'src/utils/deliveryCalculation.ts'
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
      // 🤖 [IA] - OPERACIÓN CRISTAL FASE 2: Thresholds raised 10% → 50% for Deliveries/PIN scope
      // Scoped to: deliveries components, pin-modal, useDeliveries hook, deliveryCalculation util
      // Phase 1 baseline: 12.38% lines (Wrapper 96%, pin-modal 88%, rest 0%)
      // Phase 2 improvement: pin-modal 80%+ functions (20 tests: 14 original + 6 new onOpenChange/onEscapeKeyDown)
      // Thresholds raised per ORDEN DE TRABAJO section 4.2: 10% → 50% minimum for module
      // Global thresholds (pre-Cristal): branches: 55, functions: 23, lines: 19, statements: 19
      thresholds: {
        branches: 50,
        functions: 50,
        lines: 50,
        statements: 50
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