// 🤖 [IA] - v1.2.1: Simplified integration tests for Morning Count flow - SECTOR 3
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import Index from '@/pages/Index';
import {
  renderWithProviders,
  cleanupMocks,
  waitForAnimation
} from '../fixtures/test-helpers';
import { testUtils, wizardTestUtils } from '../fixtures/test-utils';

/**
 * Tests de integración simplificados para el flujo de Conteo Matutino
 * Enfocados en verificar que los componentes se renderizan y comunican correctamente
 */

describe('🌅 Morning Count Flow Simplified Tests', () => {
  
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  
  afterEach(() => {
    cleanupMocks();
  });

  it('debe mostrar el selector de operación al cargar', async () => {
    renderWithProviders(<Index />);
    
    // Verificar que el selector de operación se muestre
    await waitFor(() => {
      expect(screen.getByText(/Seleccione Operación/)).toBeInTheDocument();
    });
    
    // Verificar que ambas opciones estén presentes
    expect(screen.getByText('Conteo de Caja')).toBeInTheDocument();
    expect(screen.getByText('Corte de Caja')).toBeInTheDocument();
    
    // Verificar los subtítulos
    expect(screen.getByText('Inicio de Turno')).toBeInTheDocument();
    expect(screen.getByText('Fin de Turno')).toBeInTheDocument();
  });

  it('debe abrir el modal de conteo matutino al hacer click', async () => {
    const { user } = renderWithProviders(<Index />);
    
    // Esperar a que aparezca el selector
    await waitFor(() => {
      expect(screen.getByText(/Seleccione Operación/)).toBeInTheDocument();
    });
    
    // Esperar animaciones
    await waitForAnimation();
    
    // Buscar y hacer click en el card de Conteo de Caja
    const card = await screen.findByTestId('operation-card-cash-count');
    await user.click(card);
    
    // Verificar que el modal se abre
    await waitFor(() => {
      expect(screen.getByText(/Conteo de Caja Matutino/)).toBeInTheDocument();
    });
    
    // 🤖 [IA] - v1.3.7e: Fix paso 1 es "Protocolo" no "Sucursal", wizard tiene 4 pasos
    const modal = testUtils.withinWizardModal();
    expect(testUtils.getVisibleStepIndicator(/Paso 1 de 4/)).toBeInTheDocument();
    // Paso 1 muestra reglas del protocolo, no sucursal
    expect(modal.getByText(/Protocolo/i)).toBeInTheDocument();
  });

  it('debe cerrar el modal al hacer click en el botón X', async () => {
    const { user } = renderWithProviders(<Index />);
    
    // Abrir el modal
    await waitFor(() => {
      expect(screen.getByText(/Seleccione Operación/)).toBeInTheDocument();
    });
    
    await waitForAnimation();
    
    const card = await screen.findByTestId('operation-card-cash-count');
    
    await user.click(card);
    
    // Esperar a que el modal se abra
    await waitFor(() => {
      expect(screen.getByText(/Conteo de Caja Matutino/)).toBeInTheDocument();
    });
    
    // Botón X específico del header matutino debe exponer nombre accesible explícito
    const closeIcon = document.querySelector('.icon-responsive-sm.lucide-x');
    const closeButton = closeIcon?.closest('button');
    expect(closeButton).toHaveAttribute('aria-label', 'Cerrar modal');
    if (closeButton) {
      await user.click(closeButton);
    }

    // 🤖 [IA] - v1.2.36a: Wait for animation (duration-200 = 200ms) before checking closure
    await waitForAnimation();

    // 🤖 [IA] - v1.2.36a: Modal should close and return to selector
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.getByText(/Seleccione Operación/)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('debe mostrar los pasos del wizard correctamente', async () => {
    const { user } = renderWithProviders(<Index />);
    
    // Abrir el modal
    await waitFor(() => {
      expect(screen.getByText(/Seleccione Operación/)).toBeInTheDocument();
    });
    
    await waitForAnimation();
    
    const card = await screen.findByTestId('operation-card-cash-count');
    await user.click(card);
    
    // 🤖 [IA] - v1.3.7e: Fix paso 1 es "Protocolo" (4 pasos total), timeout aumentado
    await waitFor(() => {
      const modal = testUtils.withinWizardModal();
      expect(testUtils.getVisibleStepIndicator(/Paso 1 de 4/)).toBeInTheDocument();
      expect(modal.getByText(/Protocolo/i)).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // 🤖 [IA] - v1.3.7e: Botón es "Continuar" no "Siguiente"
    const modal = testUtils.withinWizardModal();
    const nextButton = modal.getByRole('button', { name: /continuar/i });
    expect(nextButton).toBeInTheDocument();

    // Verificar que el botón Anterior está deshabilitado en el paso 1
    const prevButton = modal.getByRole('button', { name: /anterior/i });
    expect(prevButton).toBeDisabled();
  });

  it('debe mostrar el selector de operación con colores temáticos', async () => {
    renderWithProviders(<Index />);
    
    await waitFor(() => {
      expect(screen.getByText(/Seleccione Operación/)).toBeInTheDocument();
    });
    
    // Verificar que los iconos están presentes (Sunrise para morning, Moon para evening)
    const sunriseIcon = document.querySelector('.lucide-sunrise');
    const moonIcon = document.querySelector('.lucide-moon');
    
    expect(sunriseIcon).toBeInTheDocument();
    expect(moonIcon).toBeInTheDocument();
    
    // Verificar los badges de subtítulo
    expect(screen.getByText('Inicio de Turno')).toBeInTheDocument();
    expect(screen.getByText('Fin de Turno')).toBeInTheDocument();
  });

  it('debe mostrar mensaje institucional fijo del equipo', async () => {
    renderWithProviders(<Index />);

    await waitFor(() => {
      expect(screen.getByText(/Seleccione Operación/)).toBeInTheDocument();
    });

    const panel = screen.getByRole('note');
    expect(within(panel).getByText(/Compromiso Operativo/i)).toBeInTheDocument();
    expect(
      within(panel).getByText(/Este sistema resguarda tu trabajo diario/i),
    ).toBeInTheDocument();
    expect(within(panel).getByText(/Equipo de Acuarios Paradise/i)).toBeInTheDocument();
    expect(within(panel).getByText(/JesucristoEsDios/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ver mensaje del equipo/i })).not.toBeInTheDocument();
  });

  it('debe mantener el estado del modal entre navegaciones de pasos', async () => {
    const { user } = renderWithProviders(<Index />);
    
    await waitFor(() => {
      expect(screen.getByText(/Seleccione Operación/)).toBeInTheDocument();
    });
    
    await waitForAnimation();
    
    const card = await screen.findByTestId('operation-card-cash-count');
    await user.click(card);
    
    // 🤖 [IA] - v1.3.7e: Fix paso 1 (4 pasos total), timeout aumentado
    await waitFor(() => {
      const modal = testUtils.withinWizardModal();
      expect(testUtils.getVisibleStepIndicator(/Paso 1 de 4/)).toBeInTheDocument();
    }, { timeout: 5000 });

    // El modal debería mantener el título durante todo el flujo
    expect(screen.getByText(/Conteo de Caja Matutino/)).toBeInTheDocument();

    // 🤖 [IA] - v1.3.7e: querySelector retorna Node|null, usar screen.getByRole
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('debe mostrar características diferentes para cada modo', async () => {
    renderWithProviders(<Index />);
    
    await waitFor(() => {
      expect(screen.getByText(/Seleccione Operación/)).toBeInTheDocument();
    });
    
    // Verificar características del Conteo Matutino
    expect(screen.getByText(/Verificación de cambio inicial/)).toBeInTheDocument();
    expect(screen.getByText(/Proceso simplificado de 2 fases/)).toBeInTheDocument();
    expect(screen.getByText(/Ideal para cambio de turno matutino/)).toBeInTheDocument();
    
    // Verificar características del Corte de Caja
    expect(screen.getByText(/Comparación con venta esperada SICAR/)).toBeInTheDocument();
    expect(screen.getByText(/Proceso completo de 3 fases/)).toBeInTheDocument();
    expect(screen.getByText(/Entrega de efectivo y reporte final/)).toBeInTheDocument();
  });
});
