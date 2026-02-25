import { readFileSync } from 'fs';
import { resolve } from 'path';

const DASHBOARD_PATH = 'src/components/deliveries/DeliveryDashboard.tsx';
const WRAPPER_PATH = 'src/components/deliveries/DeliveryDashboardWrapper.tsx';

describe('Delivery Dashboard UX contract (TDD RED)', () => {
  test('usa estado vacío inteligente: oculta bloques de distribución cuando no hay pendientes', () => {
    const content = readFileSync(resolve(DASHBOARD_PATH), 'utf-8');

    expect(content).toMatch(/summary\.countPending\s*>\s*0\s*&&[\s\S]*Por Courier/);
    expect(content).toMatch(/summary\.countPending\s*>\s*0\s*&&[\s\S]*Por Nivel de Alerta/);
  });

  test('reduce ruido visual: sin emojis en títulos y clamp() controlado', () => {
    const content = readFileSync(resolve(DASHBOARD_PATH), 'utf-8');
    const clampUsages = content.match(/clamp\(/g) ?? [];

    expect(content).not.toMatch(/📊/);
    expect(content).not.toMatch(/📦/);
    expect(clampUsages.length).toBeLessThanOrEqual(14);
  });

  test('tabs con semántica accesible y acción volver no destructiva', () => {
    const content = readFileSync(resolve(WRAPPER_PATH), 'utf-8');

    expect(content).toMatch(/role="tablist"/);
    expect(content).toMatch(/role="tab"/);
    expect(content).toMatch(/aria-selected=/);
    expect(content).toMatch(/handleTabKeyDown/);
    expect(content).toMatch(/ArrowRight/);
    expect(content).toMatch(/ArrowLeft/);
    expect(content).toMatch(/NeutralActionButton/);
    expect(content).not.toMatch(/DestructiveActionButton/);
  });

  test('estado vacío incluye CTA accionable hacia Gestión', () => {
    const content = readFileSync(resolve(DASHBOARD_PATH), 'utf-8');

    expect(content).toMatch(/onGoToManagement/);
    expect(content).toMatch(/Ir a Gestión/);
  });
});
