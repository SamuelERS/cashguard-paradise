// 🤖 [IA] - Test TDD estático: Auto-setup .env profesional
// Valida que .env.example contenga credenciales reales (publishable),
// que setup-env.sh sea idempotente, y que package.json prepare hook lo ejecute.
// Patrón readFileSync + regex — sin render, sin jsdom, máxima velocidad.

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// Lectura de archivos fuente
// ---------------------------------------------------------------------------

const ROOT = resolve(__dirname, '../..');

const envExamplePath = resolve(ROOT, '.env.example');
const setupEnvPath = resolve(ROOT, 'Scripts/setup-env.sh');
const packageJsonPath = resolve(ROOT, 'package.json');

const envExample = readFileSync(envExamplePath, 'utf-8');
const setupEnv = readFileSync(setupEnvPath, 'utf-8');
const packageJson = readFileSync(packageJsonPath, 'utf-8');

// ---------------------------------------------------------------------------
// Suite 1: .env.example contiene credenciales Supabase reales (publishable)
// ---------------------------------------------------------------------------

describe('.env.example — credenciales Supabase publishable', () => {
  it('contiene VITE_SUPABASE_URL apuntando a supabase.co (no placeholder)', () => {
    expect(envExample).toMatch(/VITE_SUPABASE_URL=https:\/\/\w+\.supabase\.co/);
    expect(envExample).not.toContain('your_supabase_url_here');
  });

  it('contiene VITE_SUPABASE_ANON_KEY con valor real (no placeholder)', () => {
    expect(envExample).toMatch(/VITE_SUPABASE_ANON_KEY=\S{20,}/);
    expect(envExample).not.toContain('your_supabase_anon_key_here');
  });

  it('define VITE_APP_ENV=development', () => {
    expect(envExample).toContain('VITE_APP_ENV=development');
  });
});

// ---------------------------------------------------------------------------
// Suite 2: setup-env.sh es idempotente y defensivo
// ---------------------------------------------------------------------------

describe('Scripts/setup-env.sh — auto-setup idempotente', () => {
  it('existe el archivo', () => {
    expect(existsSync(setupEnvPath)).toBe(true);
  });

  it('usa set -eu (modo estricto POSIX)', () => {
    expect(setupEnv).toContain('set -eu');
  });

  it('verifica si .env ya existe antes de copiar (idempotente)', () => {
    expect(setupEnv).toMatch(/if\s*\[\s*!\s*-f\s*"\$ENV_FILE"\s*\]/);
  });

  it('copia desde .env.example cuando .env no existe', () => {
    expect(setupEnv).toMatch(/cp\s+"\$ENV_EXAMPLE"\s+"\$ENV_FILE"/);
  });

  it('no sobreescribe .env existente', () => {
    // El flujo else final NO ejecuta cp, solo imprime mensaje
    expect(setupEnv).toMatch(/\.env ya existe/);
  });

  it('maneja caso donde .env.example no existe (exit 0, no falla)', () => {
    expect(setupEnv).toMatch(/No se encontr/);
    expect(setupEnv).toContain('exit 0');
  });
});

// ---------------------------------------------------------------------------
// Suite 3: package.json prepare hook ejecuta setup-env.sh
// ---------------------------------------------------------------------------

describe('package.json — prepare hook con auto-setup', () => {
  it('tiene script prepare que ejecuta setup-env.sh', () => {
    expect(packageJson).toMatch(/"prepare"\s*:\s*"[^"]*setup-env\.sh[^"]*"/);
  });

  it('prepare también ejecuta husky install', () => {
    expect(packageJson).toMatch(/"prepare"\s*:\s*"[^"]*husky install[^"]*"/);
  });

  it('husky install va ANTES de setup-env (orden correcto)', () => {
    const prepareMatch = packageJson.match(/"prepare"\s*:\s*"([^"]*)"/);
    expect(prepareMatch).not.toBeNull();
    const prepareValue = prepareMatch![1];
    const huskyIdx = prepareValue.indexOf('husky install');
    const setupIdx = prepareValue.indexOf('setup-env.sh');
    expect(huskyIdx).toBeLessThan(setupIdx);
  });
});
