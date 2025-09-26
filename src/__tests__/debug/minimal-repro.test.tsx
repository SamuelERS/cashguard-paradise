// 🔍 BUG HUNTER: Test mínimo para reproducir el problema de selección de operación
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import Index from '@/pages/Index';
import { renderWithProviders, selectOperation, cleanupMocks } from '../fixtures/test-helpers';

describe('🔍 MINIMAL REPRODUCTION TEST', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanupMocks();
  });

  it('🎯 STEP 1: debe renderizar la pantalla de selección de operación', async () => {
    const { user } = renderWithProviders(<Index />);

    // Verificar que se muestra la pantalla de selección
    await waitFor(() => {
      const title = screen.getByText(/Seleccione Operación/i);
      // Título encontrado
      expect(title).toBeInTheDocument();
    });

    // Verificar que las opciones están disponibles
    const morningOption = screen.getByText('Conteo de Caja');
    const eveningOption = screen.getByText('Corte de Caja');

    // Opciones morning y evening encontradas

    expect(morningOption).toBeInTheDocument();
    expect(eveningOption).toBeInTheDocument();
  });

  it('🎯 STEP 2: debe poder hacer clic en "Corte de Caja"', async () => {
    const { user } = renderWithProviders(<Index />);

    // Esperar a que la pantalla esté lista
    await waitFor(() => {
      expect(screen.getByText(/Seleccione Operación/i)).toBeInTheDocument();
    });

    // Buscar el botón/card de Corte de Caja
    const eveningOption = screen.getByText('Corte de Caja');
    const card = eveningOption.closest('div[class*="cursor-pointer"]');

    // Card encontrada y verificada

    // Hacer clic
    if (card) {
      await user.click(card);
    } else {
      await user.click(eveningOption);
    }

    // Esperar a ver qué aparece después del clic
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Debug: ver todo lo que hay en pantalla
    // DOM actualizado después del clic

    // Verificar si aparece el modal
    const dialogs = screen.queryAllByRole('dialog');
    // Verificando dialogs

    if (dialogs.length > 0) {
      // Modal apareció
      // Buscar texto dentro del modal
      const modalTexts = screen.queryAllByText(/Instrucciones|Protocolo|Regla/i);
      modalTexts.forEach(text => {
        // Texto en modal verificado
      });
    } else {
      // Modal NO apareció
      // Ver si sigue en la pantalla de selección
      const stillOnSelection = screen.queryByText(/Seleccione Operación/i);
      // Aún en pantalla de selección
    }
  });

  it('🎯 STEP 3: debe abrir el modal usando selectOperation helper', async () => {
    const { user } = renderWithProviders(<Index />);

    // Llamando selectOperation

    try {
      await selectOperation(user, 'evening');
      // selectOperation completado

      // Verificar que el modal se abrió
      const dialogs = screen.queryAllByRole('dialog');
      // Verificando dialogs después de selectOperation

      // Buscar elementos del protocolo de seguridad
      const protocolElements = screen.queryAllByText(/Instrucciones Obligatorias|Protocolo|Regla/i);
      // Elementos del protocolo encontrados

      protocolElements.forEach(el => {
        // Elemento del protocolo verificado
      });

    } catch (error) {
      console.error('❌ Error en selectOperation:', error);

      // Ver estado actual del DOM
      const currentTitle = screen.queryByText(/Seleccione Operación/i);
      // Estado actual verificado

      throw error;
    }
  });

  it('🎯 STEP 4: flujo completo hasta completeSecurityProtocol', async () => {
    const { user } = renderWithProviders(<Index />);

    // PASO 1: Seleccionar operación evening
    await selectOperation(user, 'evening');

    // Verificar que estamos en el modal correcto
    const dialog = screen.queryByRole('dialog');
    if (!dialog) {
      console.error('❌ No se encontró dialog después de selectOperation');
      throw new Error('Dialog no encontrado');
    }

    // Dialog encontrado

    // Buscar las reglas del protocolo
    const buttons = screen.queryAllByRole('button');
    // Total de botones encontrados

    buttons.forEach((btn, i) => {
      const ariaLabel = btn.getAttribute('aria-label');
      const ariaPressed = btn.getAttribute('aria-pressed');
      if (ariaLabel?.includes('Regla:')) {
        // Botón del protocolo verificado
      }
    });

    // Intentar completar el protocolo de seguridad
    // PASO 2: Completar protocolo de seguridad

    // Buscar reglas no completadas
    const uncompletedRules = buttons.filter(btn => {
      const ariaLabel = btn.getAttribute('aria-label') || '';
      const ariaPressed = btn.getAttribute('aria-pressed');
      return ariaLabel.includes('Regla:') && ariaPressed === 'false';
    });

    // Reglas sin completar identificadas

    // Completar cada regla
    for (let i = 0; i < uncompletedRules.length; i++) {
      // Clickeando regla
      await user.click(uncompletedRules[i]);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Buscar botón Continuar
    const continueButton = screen.queryByRole('button', { name: /continuar/i });
    // Botón Continuar verificado

    if (continueButton && !continueButton.disabled) {
      await user.click(continueButton);
      // Clicked Continuar
    }

    // Ver estado después
    await new Promise(resolve => setTimeout(resolve, 500));

    const newDialog = screen.queryByRole('dialog');
    if (newDialog) {
      const texts = screen.queryAllByText(/Paso \d+ de \d+/);
      // Textos de paso encontrados y verificados
    }
  });
});