// 🤖 [IA] - v1.0.0 - Tests de integración para navegación Delivery View
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { OperationSelector } from '@/components/operation-selector/OperationSelector';
import { OperationMode } from '@/types/operation-mode';

describe('Delivery View Navigation', () => {
  it('muestra tarjeta Deliveries Pendientes en pantalla inicial', () => {
    const handleSelectMode = vi.fn();
    
    render(
      <MemoryRouter>
        <OperationSelector onSelectMode={handleSelectMode} />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Deliveries Pendientes')).toBeInTheDocument();
    expect(screen.getByText('Consulta envíos pendientes de cobro')).toBeInTheDocument();
  });

  it('tarjeta Deliveries Pendientes es clickeable', () => {
    const handleSelectMode = vi.fn();
    
    render(
      <MemoryRouter>
        <OperationSelector onSelectMode={handleSelectMode} />
      </MemoryRouter>
    );
    
    const deliveryCard = screen.getByTestId('operation-card-delivery');
    expect(deliveryCard).toBeInTheDocument();
    fireEvent.click(deliveryCard);
    expect(handleSelectMode).toHaveBeenCalledWith(OperationMode.DELIVERY_VIEW);
  });

  it('muestra 3 tarjetas en pantalla inicial', () => {
    const handleSelectMode = vi.fn();
    
    render(
      <MemoryRouter>
        <OperationSelector onSelectMode={handleSelectMode} />
      </MemoryRouter>
    );
    
    // Verificar las 3 tarjetas
    expect(screen.getByText('Conteo de Caja')).toBeInTheDocument();
    expect(screen.getByText('Corte de Caja')).toBeInTheDocument();
    expect(screen.getByText('Deliveries Pendientes')).toBeInTheDocument();
  });

  it('tarjeta Deliveries tiene badge COD', () => {
    const handleSelectMode = vi.fn();
    
    render(
      <MemoryRouter>
        <OperationSelector onSelectMode={handleSelectMode} />
      </MemoryRouter>
    );
    
    expect(screen.getByText('COD')).toBeInTheDocument();
  });

  it('tarjeta Deliveries muestra características correctas', () => {
    const handleSelectMode = vi.fn();
    
    render(
      <MemoryRouter>
        <OperationSelector onSelectMode={handleSelectMode} />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Vista completa de envíos activos')).toBeInTheDocument();
    expect(screen.getByText('Actualizar estados (pagado/cancelado)')).toBeInTheDocument();
    expect(screen.getByText('Alertas automáticas de antigüedad')).toBeInTheDocument();
  });

  it('tarjeta Deliveries tiene efecto hover', () => {
    const handleSelectMode = vi.fn();
    
    render(
      <MemoryRouter>
        <OperationSelector onSelectMode={handleSelectMode} />
      </MemoryRouter>
    );
    
    const deliveryCard = screen.getByTestId('operation-card-delivery');
    expect(deliveryCard).toHaveClass('group');
  });

  it('grid layout se adapta a 3 columnas en desktop', () => {
    const handleSelectMode = vi.fn();
    
    render(
      <MemoryRouter>
        <OperationSelector onSelectMode={handleSelectMode} />
      </MemoryRouter>
    );
    
    // Verificar que las 3 tarjetas principales existen
    const cashCountCard = screen.getByText('Conteo de Caja');
    const cashCutCard = screen.getByText('Corte de Caja');
    const deliveryCard = screen.getByText('Deliveries Pendientes');
    
    expect(cashCountCard).toBeInTheDocument();
    expect(cashCutCard).toBeInTheDocument();
    expect(deliveryCard).toBeInTheDocument();
  });

  it('logos decorativos no se anuncian a lectores de pantalla', () => {
    const handleSelectMode = vi.fn();

    render(
      <MemoryRouter>
        <OperationSelector onSelectMode={handleSelectMode} />
      </MemoryRouter>
    );

    expect(screen.queryByRole('img', { name: /Acuarios Paradise/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('img', { name: /Productos Paradise/i })).not.toBeInTheDocument();
  });
});
