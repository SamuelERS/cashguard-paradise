import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist",
      "dist-ssr",
      "dist-backup-*",
      "dev-dist",
      "coverage",
      ".nyc_output",
      "playwright-report",
      "playwright/.cache",
      "test-results",
      "Pruebas Test GitHub",
      "node_modules",
      // 🤖 [IA] - ESLint v9+ flat config - Comprehensive glob patterns for generated directories
      "**/.vinxi/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/dev-dist/**",
      "**/playwright-report/**",
      "**/test-results/**",
      "public/mockServiceWorker.js"
    ]
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  // 🤖 [IA] - v1.2.36a: Silenciar warnings react-refresh para archivos específicos
  {
    files: ["src/__mocks__/**/*.{ts,tsx}"],
    rules: {
      "react-refresh/only-export-components": "off", // Mocks de testing no afectan HMR
    },
  },
  {
    files: ["src/components/ui/form.tsx"],
    rules: {
      "react-refresh/only-export-components": "off", // Patrón shadcn/ui con useFormField hook
    },
  },
  {
    files: ["src/components/ui/neutral-action-button.tsx"],
    rules: {
      "react-refresh/only-export-components": "off", // Patrón shadcn/ui con variants export
    },
  }
);
