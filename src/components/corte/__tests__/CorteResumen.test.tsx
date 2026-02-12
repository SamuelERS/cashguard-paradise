// 🤖 [IA] - v1.0.0: Tests CorteResumen — Orden #007
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { CorteResumen } from '../CorteResumen';
import type { Corte } from '../../../types/auditoria';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const corteBase: Corte = {
  id: 'test-corte-id',
  correlativo: 'CORTE-2026-02-12-H-001',
  sucursal_id: 'sucursal-1',
  cajero: 'Maria Lopez',
  testigo: 'Carlos Rivas',
  estado: 'FINALIZADO',
  fase_actual: 3,
  intento_actual: 1,
  venta_esperada: 500.00,
  datos_conteo: null,
  datos_entrega: null,
  datos_verificacion: null,
  datos_reporte: null,
  reporte_hash: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
  created_at: '2026-02-12T08:00:00.000Z',
  updated_at: '2026-02-12T08:45:00.000Z',
  finalizado_at: '2026-02-12T08:45:00.000Z',
  motivo_aborto: null,
};

const corteAbortado: Corte = {
  ...corteBase,
  estado: 'ABORTADO',
  fase_actual: 2,
  reporte_hash: null,
  finalizado_at: '2026-02-12T08:30:00.000Z',
  motivo_aborto: 'Error en conteo inicial, cajero solicito reinicio completo',
};

// ---------------------------------------------------------------------------
// Helper de renderizado
// ---------------------------------------------------------------------------

function renderCorteResumen(overrides?: Partial<{
  corte: Corte;
  nombreSucursal: string;
  onCerrar: () => void;
  onCompartir: () => void;
}>) {
  const defaults = {
    corte: corteBase,
    nombreSucursal: 'Los Heroes',
    onCerrar: vi.fn(),
    ...overrides,
  };
  return { ...render(<CorteResumen {...defaults} />), props: defaults };
}

// ---------------------------------------------------------------------------
// SUITE 1: Renderizado por estado
// ---------------------------------------------------------------------------

describe('Suite 1: Renderizado por estado', () => {
  it('1.1 - FINALIZADO muestra titulo "Corte Finalizado"', () => {
    renderCorteResumen();
    expect(screen.getByText('Corte Finalizado')).toBeInTheDocument();
  });

  it('1.2 - ABORTADO muestra titulo "Corte Abortado"', () => {
    renderCorteResumen({ corte: corteAbortado });
    expect(screen.getByText('Corte Abortado')).toBeInTheDocument();
  });

  it('1.3 - FINALIZADO muestra badge verde con texto "Finalizado"', () => {
    renderCorteResumen();
    const badge = screen.getByText('Finalizado');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-green-900/60');
  });

  it('1.4 - ABORTADO usa colores rojos en el badge de estado', () => {
    renderCorteResumen({ corte: corteAbortado });
    const badge = screen.getByText('Abortado');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-red-900/60');
  });
});

// ---------------------------------------------------------------------------
// SUITE 2: Metadata
// ---------------------------------------------------------------------------

describe('Suite 2: Metadata', () => {
  it('2.1 - Muestra el correlativo del corte', () => {
    renderCorteResumen();
    expect(screen.getByText('CORTE-2026-02-12-H-001')).toBeInTheDocument();
  });

  it('2.2 - Muestra cajero y testigo', () => {
    renderCorteResumen();
    expect(screen.getByText(/Maria Lopez/)).toBeInTheDocument();
    expect(screen.getByText(/Carlos Rivas/)).toBeInTheDocument();
  });

  it('2.3 - Muestra el nombre de la sucursal', () => {
    renderCorteResumen();
    expect(screen.getByText('Los Heroes')).toBeInTheDocument();
  });

  it('2.4 - Muestra la fecha de inicio formateada', () => {
    renderCorteResumen();
    // formatearFecha uses toLocaleString('es-SV') — check that "Inicio:" text exists
    const inicioElement = screen.getByText(/Inicio:/);
    expect(inicioElement).toBeInTheDocument();
  });

  it('2.5 - Muestra numero de intento', () => {
    renderCorteResumen();
    expect(screen.getByText(/Intento #1/)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// SUITE 3: Timeline y duracion
// ---------------------------------------------------------------------------

describe('Suite 3: Timeline y duracion', () => {
  it('3.1 - Calcula y muestra "45 minutos" para un corte de 45 min', () => {
    renderCorteResumen();
    // corteBase: 08:00 -> 08:45 = 45 minutos
    expect(screen.getByText(/45 minutos/)).toBeInTheDocument();
  });

  it('3.2 - Muestra "1 hora y 30 minutos" para un corte de 90 min', () => {
    const corte90min: Corte = {
      ...corteBase,
      created_at: '2026-02-12T08:00:00.000Z',
      finalizado_at: '2026-02-12T09:30:00.000Z',
    };
    renderCorteResumen({ corte: corte90min });
    expect(screen.getByText(/1 hora y 30 minutos/)).toBeInTheDocument();
  });

  it('3.3 - Muestra "Menos de un minuto" para duracion < 60 segundos', () => {
    const corteRapido: Corte = {
      ...corteBase,
      created_at: '2026-02-12T08:00:00.000Z',
      finalizado_at: '2026-02-12T08:00:30.000Z',
    };
    renderCorteResumen({ corte: corteRapido });
    expect(screen.getByText(/Menos de un minuto/)).toBeInTheDocument();
  });

  it('3.4 - No muestra linea de fin cuando finalizado_at es null', () => {
    const corteSinFin: Corte = {
      ...corteBase,
      finalizado_at: null,
    };
    renderCorteResumen({ corte: corteSinFin });
    expect(screen.queryByText(/^Fin:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Duración:/)).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// SUITE 4: Estado FINALIZADO
// ---------------------------------------------------------------------------

describe('Suite 4: Estado FINALIZADO', () => {
  it('4.1 - Muestra hash del reporte truncado', () => {
    renderCorteResumen();
    // Hash: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4' (32 chars > 16)
    // Truncado: 'a1b2c3d4...c3d4'
    expect(screen.getByText('a1b2c3d4...c3d4')).toBeInTheDocument();
  });

  it('4.2 - Muestra texto "Reporte verificado"', () => {
    renderCorteResumen();
    expect(screen.getByText('Reporte verificado')).toBeInTheDocument();
  });

  it('4.3 - Muestra "Fase 3: Reporte Final" como fase completada', () => {
    renderCorteResumen();
    expect(screen.getByText('Fase completada: 3 de 3')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// SUITE 5: Estado ABORTADO
// ---------------------------------------------------------------------------

describe('Suite 5: Estado ABORTADO', () => {
  it('5.1 - Muestra el motivo de aborto', () => {
    renderCorteResumen({ corte: corteAbortado });
    expect(screen.getByText(/Error en conteo inicial/)).toBeInTheDocument();
  });

  it('5.2 - Muestra texto "Corte abortado"', () => {
    renderCorteResumen({ corte: corteAbortado });
    expect(screen.getByText('Corte abortado')).toBeInTheDocument();
  });

  it('5.3 - Muestra la fase donde fue abortado', () => {
    renderCorteResumen({ corte: corteAbortado });
    // fase_actual=2 -> "Fase 2: Entrega a Gerencia"
    expect(screen.getByText(/Abortado en: Fase 2: Entrega a Gerencia/)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// SUITE 6: Acciones / callbacks
// ---------------------------------------------------------------------------

describe('Suite 6: Acciones / callbacks', () => {
  it('6.1 - onCerrar se llama al hacer click en "Cerrar"', async () => {
    const user = userEvent.setup();
    const { props } = renderCorteResumen();

    const botonCerrar = screen.getByRole('button', { name: /cerrar/i });
    await user.click(botonCerrar);

    expect(props.onCerrar).toHaveBeenCalledTimes(1);
  });

  it('6.2 - onCompartir se llama al hacer click en "Compartir Recibo"', async () => {
    const user = userEvent.setup();
    const onCompartir = vi.fn();
    renderCorteResumen({ onCompartir });

    const botonCompartir = screen.getByRole('button', { name: /compartir recibo/i });
    await user.click(botonCompartir);

    expect(onCompartir).toHaveBeenCalledTimes(1);
  });

  it('6.3 - Boton "Compartir Recibo" visible solo si onCompartir fue proporcionado', () => {
    const onCompartir = vi.fn();
    renderCorteResumen({ onCompartir });

    expect(screen.getByRole('button', { name: /compartir recibo/i })).toBeInTheDocument();
  });

  it('6.4 - Boton "Compartir Recibo" NO visible si onCompartir NO fue proporcionado', () => {
    renderCorteResumen(); // No onCompartir provided
    expect(screen.queryByRole('button', { name: /compartir recibo/i })).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// SUITE 7: Helpers edge cases
// ---------------------------------------------------------------------------

describe('Suite 7: Helpers edge cases', () => {
  it('7.1 - Fase desconocida muestra "Fase desconocida"', () => {
    const corteRaro: Corte = {
      ...corteBase,
      fase_actual: 99,
    };
    renderCorteResumen({ corte: corteRaro });
    expect(screen.getByText('Fase desconocida')).toBeInTheDocument();
  });

  it('7.2 - Hash corto (<= 16 chars) se muestra sin truncar', () => {
    const corteHashCorto: Corte = {
      ...corteBase,
      reporte_hash: 'abc123',
    };
    renderCorteResumen({ corte: corteHashCorto });
    expect(screen.getByText('abc123')).toBeInTheDocument();
  });

  it('7.3 - Duracion de exactamente 1 hora muestra "1 hora"', () => {
    const corte1h: Corte = {
      ...corteBase,
      created_at: '2026-02-12T08:00:00.000Z',
      finalizado_at: '2026-02-12T09:00:00.000Z',
    };
    renderCorteResumen({ corte: corte1h });
    expect(screen.getByText(/Duración: 1 hora$/)).toBeInTheDocument();
  });

  it('7.4 - Duracion de exactamente 1 minuto muestra "1 minuto"', () => {
    const corte1min: Corte = {
      ...corteBase,
      created_at: '2026-02-12T08:00:00.000Z',
      finalizado_at: '2026-02-12T08:01:00.000Z',
    };
    renderCorteResumen({ corte: corte1min });
    expect(screen.getByText(/Duración: 1 minuto$/)).toBeInTheDocument();
  });

  it('7.5 - Corte abortado sin motivo no muestra linea de motivo', () => {
    const corteAbortadoSinMotivo: Corte = {
      ...corteAbortado,
      motivo_aborto: null,
    };
    renderCorteResumen({ corte: corteAbortadoSinMotivo });
    expect(screen.queryByText(/Motivo:/)).not.toBeInTheDocument();
  });

  it('7.6 - Corte finalizado sin hash no muestra linea de hash', () => {
    const corteSinHash: Corte = {
      ...corteBase,
      reporte_hash: null,
    };
    renderCorteResumen({ corte: corteSinHash });
    // Should still show "Reporte verificado" but NOT the hash line
    expect(screen.getByText('Reporte verificado')).toBeInTheDocument();
    expect(screen.queryByText(/\.\.\./)).not.toBeInTheDocument();
  });

  it('7.7 - Intento mayor a 1 se muestra correctamente', () => {
    const corteIntento3: Corte = {
      ...corteBase,
      intento_actual: 3,
    };
    renderCorteResumen({ corte: corteIntento3 });
    expect(screen.getByText(/Intento #3/)).toBeInTheDocument();
  });
});
