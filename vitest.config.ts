// 🤖 [IA] - v1.1.17: Vitest configuration for testing environment
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
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
    
    // Test timeout
    testTimeout: 10000,
    
    // CSS handling
    css: {
      modules: {
        classNameStrategy: 'non-scoped'
      }
    }
  },
});