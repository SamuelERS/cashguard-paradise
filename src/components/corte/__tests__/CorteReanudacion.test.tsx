// 🤖 [IA] - v1.0.0: Tests CorteReanudacion — Orden #005
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { CorteReanudacion } from '../CorteReanudacion';
import type { Corte, CorteIntento } from '../../../types/auditoria';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const CORTE_FIXTURE: Corte = {
  id: 'corte-uuid-001',
  correlativo: 'CORTE-2026-02-09-H-001',
  sucursal_id: 'sucursal-uuid-heroes',
  cajero: 'Tito Gomez',
  testigo: 'Adonay Torres',
  estado: 'EN_PROGRESO',
  fase_actual: 2,
  intento_actual: 1,
  venta_esperada: null,
  datos_conteo: { parcial: true },
  datos_entrega: null,
  datos_verificacion: null,
  datos_reporte: null,
  reporte_hash: null,
  created_at: '2026-02-09T08:30:00.000Z',
  updated_at: '2026-02-09T09:15:00.000Z',
  finalizado_at: null,
  motivo_aborto: null,
};

const INTENTO_FIXTURE: CorteIntento = {
  id: 'intento-uuid-001',
  corte_id: 'corte-uuid-001',
  attempt_number: 1,
  estado: 'ACTIVO',
  snapshot_datos: null,
  motivo_reinicio: null,
  created_at: '2026-02-09T08:30:00.000Z',
  finalizado_at: null,
};

// ---------------------------------------------------------------------------
// Helper de renderizado
// ---------------------------------------------------------------------------

function renderCorteReanudacion(overrides?: Partial<{
  corte: Corte;
  intento: CorteIntento | null;
  cargando: boolean;
  onReanudar: () => void;
  onNuevoIntento: (motivo: string) => void;
  onAbortarCorte: (motivo: string) => void;
}>) {
  const defaultProps = {
    corte: CORTE_FIXTURE,
    intento: INTENTO_FIXTURE,
    cargando: false,
    onReanudar: vi.fn(),
    onNuevoIntento: vi.fn(),
    onAbortarCorte: vi.fn(),
    ...overrides,
  };
  return { ...render(<CorteReanudacion {...defaultProps} />), props: defaultProps };
}

// ---------------------------------------------------------------------------
// SUITE 1: Renderizado de informacion del corte
// ---------------------------------------------------------------------------

describe('Suite 1: Renderizado de informacion del corte', () => {
  it('1.1 - Muestra el correlativo del corte', () => {
    renderCorteReanudacion();
    expect(screen.getByText('CORTE-2026-02-09-H-001')).toBeInTheDocument();
  });

  it('1.2 - Muestra cajero y testigo', () => {
    renderCorteReanudacion();
    expect(screen.getByText(/Tito Gomez/)).toBeInTheDocument();
    expect(screen.getByText(/Adonay Torres/)).toBeInTheDocument();
  });

  it('1.3 - Muestra la fase correcta segun fase_actual', () => {
    // fase_actual=2 por defecto
    const { unmount } = renderCorteReanudacion();
    expect(screen.getByText('Fase 2: Entrega a Gerencia')).toBeInTheDocument();
    unmount();

    // fase_actual=1
    renderCorteReanudacion({
      corte: { ...CORTE_FIXTURE, fase_actual: 1 },
    });
    expect(screen.getByText('Fase 1: Conteo de Efectivo')).toBeInTheDocument();
  });

  it('1.4 - Muestra el numero de intento', () => {
    renderCorteReanudacion();
    expect(screen.getByText(/Intento #1/)).toBeInTheDocument();
  });

  it('1.5 - Muestra badge de estado correcto', () => {
    // estado='EN_PROGRESO' por defecto
    const { unmount } = renderCorteReanudacion();
    expect(screen.getByText('En Progreso')).toBeInTheDocument();
    unmount();

    // estado='INICIADO'
    renderCorteReanudacion({
      corte: { ...CORTE_FIXTURE, estado: 'INICIADO' },
    });
    expect(screen.getByText('Iniciado')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// SUITE 2: Accion Reanudar
// ---------------------------------------------------------------------------

describe('Suite 2: Accion Reanudar', () => {
  it('2.1 - Click en "Reanudar Corte" llama onReanudar', async () => {
    const user = userEvent.setup();
    const { props } = renderCorteReanudacion();

    const botonReanudar = screen.getByRole('button', { name: /reanudar/i });
    await user.click(botonReanudar);

    expect(props.onReanudar).toHaveBeenCalledTimes(1);
  });

  it('2.2 - Boton reanudar deshabilitado durante carga', () => {
    renderCorteReanudacion({ cargando: true });

    const botonReanudar = screen.getByRole('button', { name: /reanudar/i });
    expect(botonReanudar).toBeDisabled();
  });
});

// ---------------------------------------------------------------------------
// SUITE 3: Accion Nuevo Intento
// ---------------------------------------------------------------------------

describe('Suite 3: Accion Nuevo Intento', () => {
  it('3.1 - Toggle revela textarea de motivo', async () => {
    const user = userEvent.setup();
    renderCorteReanudacion();

    // Inicialmente, textarea NO visible
    expect(screen.queryByPlaceholderText(/reinicia/i)).not.toBeInTheDocument();

    // Click toggle
    const botonNuevoIntento = screen.getByRole('button', { name: /nuevo intento/i });
    await user.click(botonNuevoIntento);

    // Textarea ahora visible
    expect(screen.getByPlaceholderText(/reinicia/i)).toBeInTheDocument();
  });

  it('3.2 - Motivo corto (<10 chars) deshabilita confirmacion', async () => {
    const user = userEvent.setup();
    renderCorteReanudacion();

    // Expandir seccion
    await user.click(screen.getByRole('button', { name: /nuevo intento/i }));

    // Escribir motivo corto
    const textarea = screen.getByPlaceholderText(/reinicia/i);
    await user.type(textarea, 'corto');

    // Boton confirmar deshabilitado
    const botonConfirmar = screen.getByRole('button', { name: /confirmar nuevo intento/i });
    expect(botonConfirmar).toBeDisabled();
  });

  it('3.3 - Motivo valido (>=10 chars) habilita confirmacion', async () => {
    const user = userEvent.setup();
    renderCorteReanudacion();

    // Expandir seccion
    await user.click(screen.getByRole('button', { name: /nuevo intento/i }));

    // Escribir motivo valido
    const textarea = screen.getByPlaceholderText(/reinicia/i);
    await user.type(textarea, 'Error en conteo de monedas');

    // Boton confirmar habilitado
    const botonConfirmar = screen.getByRole('button', { name: /confirmar nuevo intento/i });
    expect(botonConfirmar).not.toBeDisabled();
  });

  it('3.4 - Confirmar llama onNuevoIntento con motivo trimmed', async () => {
    const user = userEvent.setup();
    const { props } = renderCorteReanudacion();

    // Expandir seccion
    await user.click(screen.getByRole('button', { name: /nuevo intento/i }));

    // Escribir motivo con espacios
    const textarea = screen.getByPlaceholderText(/reinicia/i);
    await user.type(textarea, '  Error en conteo de monedas  ');

    // Click confirmar
    const botonConfirmar = screen.getByRole('button', { name: /confirmar nuevo intento/i });
    await user.click(botonConfirmar);

    expect(props.onNuevoIntento).toHaveBeenCalledTimes(1);
    expect(props.onNuevoIntento).toHaveBeenCalledWith('Error en conteo de monedas');
  });
});

// ---------------------------------------------------------------------------
// SUITE 4: Accion Abortar Corte
// ---------------------------------------------------------------------------

describe('Suite 4: Accion Abortar Corte', () => {
  it('4.1 - Toggle revela textarea y advertencia', async () => {
    const user = userEvent.setup();
    renderCorteReanudacion();

    // Inicialmente, textarea NO visible
    expect(screen.queryByPlaceholderText(/aborta/i)).not.toBeInTheDocument();

    // Click toggle
    const botonAbortar = screen.getByRole('button', { name: /abortar corte/i });
    await user.click(botonAbortar);

    // Textarea ahora visible
    expect(screen.getByPlaceholderText(/aborta/i)).toBeInTheDocument();

    // Advertencia visible
    expect(screen.getByText(/irreversible/i)).toBeInTheDocument();
  });

  it('4.2 - Motivo corto deshabilita confirmacion', async () => {
    const user = userEvent.setup();
    renderCorteReanudacion();

    // Expandir seccion
    await user.click(screen.getByRole('button', { name: /abortar corte/i }));

    // Escribir motivo corto
    const textarea = screen.getByPlaceholderText(/aborta/i);
    await user.type(textarea, 'corto');

    // Boton confirmar aborto deshabilitado
    const botonConfirmar = screen.getByRole('button', { name: /confirmar aborto/i });
    expect(botonConfirmar).toBeDisabled();
  });

  it('4.3 - Motivo valido habilita confirmacion', async () => {
    const user = userEvent.setup();
    renderCorteReanudacion();

    // Expandir seccion
    await user.click(screen.getByRole('button', { name: /abortar corte/i }));

    // Escribir motivo valido
    const textarea = screen.getByPlaceholderText(/aborta/i);
    await user.type(textarea, 'Corte equivocado de fecha');

    // Boton confirmar aborto habilitado
    const botonConfirmar = screen.getByRole('button', { name: /confirmar aborto/i });
    expect(botonConfirmar).not.toBeDisabled();
  });

  it('4.4 - Confirmar llama onAbortarCorte con motivo trimmed', async () => {
    const user = userEvent.setup();
    const { props } = renderCorteReanudacion();

    // Expandir seccion
    await user.click(screen.getByRole('button', { name: /abortar corte/i }));

    // Escribir motivo con espacios
    const textarea = screen.getByPlaceholderText(/aborta/i);
    await user.type(textarea, '  Corte equivocado de fecha  ');

    // Click confirmar
    const botonConfirmar = screen.getByRole('button', { name: /confirmar aborto/i });
    await user.click(botonConfirmar);

    expect(props.onAbortarCorte).toHaveBeenCalledTimes(1);
    expect(props.onAbortarCorte).toHaveBeenCalledWith('Corte equivocado de fecha');
  });
});

// ---------------------------------------------------------------------------
// SUITE 5: Estado de carga
// ---------------------------------------------------------------------------

describe('Suite 5: Estado de carga', () => {
  it('5.1 - Todos los botones deshabilitados cuando cargando=true', () => {
    renderCorteReanudacion({ cargando: true });

    const botones = screen.getAllByRole('button');
    botones.forEach((boton) => {
      expect(boton).toBeDisabled();
    });
  });

  it('5.2 - Muestra indicador de carga', () => {
    renderCorteReanudacion({ cargando: true });

    expect(screen.getByText(/procesando/i)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// SUITE 6: Mutual exclusion y comportamiento adicional
// ---------------------------------------------------------------------------

describe('Suite 6: Mutual exclusion y comportamiento adicional', () => {
  it('6.1 - Expandir Nuevo Intento colapsa Abortar', async () => {
    const user = userEvent.setup();
    renderCorteReanudacion();

    // Expandir Abortar primero
    await user.click(screen.getByRole('button', { name: /abortar corte/i }));
    expect(screen.getByPlaceholderText(/aborta/i)).toBeInTheDocument();

    // Expandir Nuevo Intento — debe colapsar Abortar
    await user.click(screen.getByRole('button', { name: /nuevo intento/i }));
    expect(screen.getByPlaceholderText(/reinicia/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/aborta/i)).not.toBeInTheDocument();
  });

  it('6.2 - Expandir Abortar colapsa Nuevo Intento', async () => {
    const user = userEvent.setup();
    renderCorteReanudacion();

    // Expandir Nuevo Intento primero
    await user.click(screen.getByRole('button', { name: /nuevo intento/i }));
    expect(screen.getByPlaceholderText(/reinicia/i)).toBeInTheDocument();

    // Expandir Abortar — debe colapsar Nuevo Intento
    await user.click(screen.getByRole('button', { name: /abortar corte/i }));
    expect(screen.getByPlaceholderText(/aborta/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/reinicia/i)).not.toBeInTheDocument();
  });

  it('6.3 - Muestra fase 0 como "Sin iniciar"', () => {
    renderCorteReanudacion({
      corte: { ...CORTE_FIXTURE, fase_actual: 0 },
    });
    expect(screen.getByText('Sin iniciar')).toBeInTheDocument();
  });

  it('6.4 - Muestra fase 3 como "Fase 3: Reporte Final"', () => {
    renderCorteReanudacion({
      corte: { ...CORTE_FIXTURE, fase_actual: 3 },
    });
    expect(screen.getByText('Fase 3: Reporte Final')).toBeInTheDocument();
  });

  it('6.5 - Usa intento_actual del corte cuando intento es null', () => {
    renderCorteReanudacion({
      corte: { ...CORTE_FIXTURE, intento_actual: 3 },
      intento: null,
    });
    expect(screen.getByText(/#3/)).toBeInTheDocument();
  });
});
