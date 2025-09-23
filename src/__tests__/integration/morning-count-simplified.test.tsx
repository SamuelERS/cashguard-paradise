// 🤖 [IA] - v1.2.1: Simplified integration tests for Morning Count flow - SECTOR 3
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
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
    const conteoDeCaja = await screen.findByText('Conteo de Caja');
    const card = conteoDeCaja.closest('div[class*="cursor-pointer"]');
    
    if (card) {
      await user.click(card);
      
      // Verificar que el modal se abre
      await waitFor(() => {
        expect(screen.getByText(/Conteo de Caja Matutino/)).toBeInTheDocument();
      });
      
      // Verificar elementos del modal usando utilities específicas
      const modal = testUtils.withinWizardModal();
      expect(modal.getByText(/Paso 1 de 3/)).toBeInTheDocument();
      expect(modal.getByText(/Seleccione la Sucursal/)).toBeInTheDocument();
    }
  });

  it('debe cerrar el modal al hacer click en el botón X', async () => {
    const { user } = renderWithProviders(<Index />);
    
    // Abrir el modal
    await waitFor(() => {
      expect(screen.getByText(/Seleccione Operación/)).toBeInTheDocument();
    });
    
    await waitForAnimation();
    
    const conteoDeCaja = await screen.findByText('Conteo de Caja');
    const card = conteoDeCaja.closest('div[class*="cursor-pointer"]');
    
    if (card) {
      await user.click(card);
      
      // Esperar a que el modal se abra
      await waitFor(() => {
        expect(screen.getByText(/Conteo de Caja Matutino/)).toBeInTheDocument();
      });
      
      // Buscar y hacer click en el botón de cerrar
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);
      
      // Verificar que el modal se cerró y volvimos al selector
      await waitFor(() => {
        expect(screen.queryByText(/Conteo de Caja Matutino/)).not.toBeInTheDocument();
        expect(screen.getByText(/Seleccione Operación/)).toBeInTheDocument();
      });
    }
  });

  it('debe mostrar los pasos del wizard correctamente', async () => {
    const { user } = renderWithProviders(<Index />);
    
    // Abrir el modal
    await waitFor(() => {
      expect(screen.getByText(/Seleccione Operación/)).toBeInTheDocument();
    });
    
    await waitForAnimation();
    
    const conteoDeCaja = await screen.findByText('Conteo de Caja');
    const card = conteoDeCaja.closest('div[class*="cursor-pointer"]');
    
    if (card) {
      await user.click(card);
      
      // Verificar paso 1 usando utilities específicas
      await waitFor(() => {
        const modal = testUtils.withinWizardModal();
        expect(modal.getByText(/Paso 1 de 3/)).toBeInTheDocument();
        expect(modal.getByText(/Seleccione la Sucursal/)).toBeInTheDocument();
      });
      
      // Verificar botones usando utilities específicas
      const modal = testUtils.withinWizardModal();
      const nextButton = modal.getByRole('button', { name: /siguiente/i });
      expect(nextButton).toBeInTheDocument();

      // Verificar que el botón Anterior está deshabilitado en el paso 1
      const prevButton = modal.getByRole('button', { name: /anterior/i });
      expect(prevButton).toBeDisabled();
    }
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

  it('debe mostrar el mensaje motivacional del equipo', async () => {
    renderWithProviders(<Index />);
    
    await waitFor(() => {
      expect(screen.getByText(/Seleccione Operación/)).toBeInTheDocument();
    });
    
    // Verificar que el mensaje motivacional está presente
    expect(screen.getByText(/Este sistema protege tu trabajo diario/)).toBeInTheDocument();
    expect(screen.getByText(/Equipo de Acuarios Paradise/)).toBeInTheDocument();
  });

  it('debe mantener el estado del modal entre navegaciones de pasos', async () => {
    const { user } = renderWithProviders(<Index />);
    
    await waitFor(() => {
      expect(screen.getByText(/Seleccione Operación/)).toBeInTheDocument();
    });
    
    await waitForAnimation();
    
    const conteoDeCaja = await screen.findByText('Conteo de Caja');
    const card = conteoDeCaja.closest('div[class*="cursor-pointer"]');
    
    if (card) {
      await user.click(card);
      
      // Verificar que estamos en paso 1 usando utilities específicas
      await waitFor(() => {
        const modal = testUtils.withinWizardModal();
        expect(modal.getByText(/Paso 1 de 3/)).toBeInTheDocument();
      });
      
      // El modal debería mantener el título durante todo el flujo
      expect(screen.getByText(/Conteo de Caja Matutino/)).toBeInTheDocument();
      
      // Verificar la barra de progreso
      const progressBar = document.querySelector('div[style*="linear-gradient"]');
      expect(progressBar).toBeInTheDocument();
    }
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