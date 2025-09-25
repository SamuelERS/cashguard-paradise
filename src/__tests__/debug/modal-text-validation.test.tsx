// 🤖 [IA] - Test de validación para verificar corrección de selectOperation - VALIDATION FINAL
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import Index from '@/pages/Index';
import { renderWithProviders, cleanupMocks, selectOperation } from '../fixtures/test-helpers';

describe('🔍 SelectOperation Validation - CORRECCIÓN FINAL', () => {

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanupMocks();
  });

  it('debe abrir modal correctamente para Corte de Caja', async () => {
    const { user } = renderWithProviders(<Index />);

    // Usar helper corregido
    await selectOperation(user, 'evening');

    // Verificar que el modal se abrió con el título correcto
    expect(screen.getByText(/Instrucciones Obligatorias Iniciales/)).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('debe abrir modal correctamente para Conteo de Caja', async () => {
    const { user } = renderWithProviders(<Index />);

    // Usar helper corregido
    await selectOperation(user, 'morning');

    // Verificar que el modal se abrió con el título correcto
    expect(screen.getByText(/Instrucciones Obligatorias Iniciales/)).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});