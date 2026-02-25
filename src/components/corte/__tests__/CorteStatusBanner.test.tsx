// 🤖 [IA] - v1.0.0: Tests CorteStatusBanner — Orden #006
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CorteStatusBanner } from '../CorteStatusBanner';
import type { CorteStatusBannerProps } from '../CorteStatusBanner';

// ---------------------------------------------------------------------------
// Helper de renderizado
// ---------------------------------------------------------------------------

function renderCorteStatusBanner(overrides?: Partial<CorteStatusBannerProps>) {
  const defaultProps: CorteStatusBannerProps = {
    estadoConexion: 'online',
    estadoSync: 'sincronizado',
    ultimaSync: '2026-02-12T10:00:00.000Z',
    pendientes: 0,
    onReintentarSync: undefined,
    mensajeError: null,
    ...overrides,
  };
  return { ...render(<CorteStatusBanner {...defaultProps} />), props: defaultProps };
}

// ---------------------------------------------------------------------------
// SUITE 1: Renderizado por estado de conexion
// ---------------------------------------------------------------------------

describe('Suite 1: Renderizado por estado de conexion', () => {
  it('1.1 - Online + sincronizado muestra banner verde con "Conectado"', () => {
    renderCorteStatusBanner({
      estadoConexion: 'online',
      estadoSync: 'sincronizado',
    });

    expect(screen.getByText('Conectado — Datos sincronizados')).toBeInTheDocument();
  });

  it('1.2 - Offline muestra banner rojo con "Sin conexión"', () => {
    renderCorteStatusBanner({
      estadoConexion: 'offline',
      estadoSync: 'pendiente',
    });

    expect(screen.getByText(/Sin conexión/)).toBeInTheDocument();
    expect(screen.getByText(/Los datos se guardarán localmente/)).toBeInTheDocument();
  });

  it('1.3 - Reconectando muestra banner ámbar con "Reconectando"', () => {
    renderCorteStatusBanner({
      estadoConexion: 'reconectando',
      estadoSync: 'pendiente',
    });

    expect(screen.getByText('Reconectando...')).toBeInTheDocument();
  });

  it('1.4 - Offline sin ultimaSync muestra "Nunca sincronizado"', () => {
    renderCorteStatusBanner({
      estadoConexion: 'offline',
      estadoSync: 'pendiente',
      ultimaSync: null,
    });

    expect(screen.getByText('Nunca sincronizado')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// SUITE 2: Renderizado por estado de sync
// ---------------------------------------------------------------------------

describe('Suite 2: Renderizado por estado de sync', () => {
  it('2.1 - Sincronizando muestra Loader2 y texto con pendientes', () => {
    renderCorteStatusBanner({
      estadoConexion: 'online',
      estadoSync: 'sincronizando',
      pendientes: 3,
    });

    expect(screen.getByText('Sincronizando... (3 pendientes)')).toBeInTheDocument();
  });

  it('2.2 - Pendiente muestra cantidad de operaciones', () => {
    renderCorteStatusBanner({
      estadoConexion: 'online',
      estadoSync: 'pendiente',
      pendientes: 5,
    });

    expect(screen.getByText('5 operaciones pendientes de sincronizar')).toBeInTheDocument();
  });

  it('2.3 - Pendiente con 0 pendientes muestra texto genérico', () => {
    renderCorteStatusBanner({
      estadoConexion: 'online',
      estadoSync: 'pendiente',
      pendientes: 0,
    });

    expect(screen.getByText('Sincronización pendiente')).toBeInTheDocument();
  });

  it('2.4 - Error muestra banner rojo con AlertTriangle', () => {
    renderCorteStatusBanner({
      estadoConexion: 'online',
      estadoSync: 'error',
    });

    expect(screen.getByText('Error de sincronización')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// SUITE 3: Boton Reintentar
// ---------------------------------------------------------------------------

describe('Suite 3: Boton Reintentar', () => {
  it('3.1 - Error con onReintentarSync muestra boton "Reintentar"', () => {
    renderCorteStatusBanner({
      estadoSync: 'error',
      onReintentarSync: vi.fn(),
    });

    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
  });

  it('3.2 - Click en Reintentar llama onReintentarSync', async () => {
    const user = userEvent.setup();
    const onReintentarSync = vi.fn();

    renderCorteStatusBanner({
      estadoSync: 'error',
      onReintentarSync,
    });

    const boton = screen.getByRole('button', { name: /reintentar/i });
    await user.click(boton);

    expect(onReintentarSync).toHaveBeenCalledTimes(1);
  });

  it('3.3 - Error sin onReintentarSync no muestra boton', () => {
    renderCorteStatusBanner({
      estadoSync: 'error',
      onReintentarSync: undefined,
    });

    expect(screen.queryByRole('button', { name: /reintentar/i })).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// SUITE 4: Formato de timestamp
// ---------------------------------------------------------------------------

describe('Suite 4: Formato de timestamp', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Fijar el reloj a 2026-02-12T12:00:00.000Z
    vi.setSystemTime(new Date('2026-02-12T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('4.1 - Timestamp < 1 minuto muestra "Hace un momento"', () => {
    renderCorteStatusBanner({
      estadoConexion: 'offline',
      estadoSync: 'pendiente',
      ultimaSync: '2026-02-12T11:59:30.000Z', // 30 seconds ago
    });

    expect(screen.getByText(/Hace un momento/)).toBeInTheDocument();
  });

  it('4.2 - Timestamp 30 minutos muestra "Hace 30 minutos"', () => {
    renderCorteStatusBanner({
      estadoConexion: 'offline',
      estadoSync: 'pendiente',
      ultimaSync: '2026-02-12T11:30:00.000Z', // 30 min ago
    });

    expect(screen.getByText(/Hace 30 minutos/)).toBeInTheDocument();
  });

  it('4.3 - Timestamp 5 horas muestra "Hace 5 horas"', () => {
    renderCorteStatusBanner({
      estadoConexion: 'offline',
      estadoSync: 'pendiente',
      ultimaSync: '2026-02-12T07:00:00.000Z', // 5 hours ago
    });

    expect(screen.getByText(/Hace 5 horas/)).toBeInTheDocument();
  });

  it('4.4 - Timestamp 2 días muestra "Hace 2 días"', () => {
    renderCorteStatusBanner({
      estadoConexion: 'offline',
      estadoSync: 'pendiente',
      ultimaSync: '2026-02-10T12:00:00.000Z', // 2 days ago
    });

    expect(screen.getByText(/Hace 2 días/)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// SUITE 5: Mensaje de error y linea secundaria
// ---------------------------------------------------------------------------

describe('Suite 5: Mensaje de error y linea secundaria', () => {
  it('5.1 - mensajeError se muestra como texto secundario', () => {
    renderCorteStatusBanner({
      estadoSync: 'error',
      mensajeError: 'Timeout al conectar con servidor',
    });

    expect(screen.getByText('Timeout al conectar con servidor')).toBeInTheDocument();
  });

  it('5.2 - mensajeError null no renderiza linea secundaria de error', () => {
    renderCorteStatusBanner({
      estadoSync: 'error',
      mensajeError: null,
    });

    expect(screen.getByText('Error de sincronización')).toBeInTheDocument();
    // No secondary line
    const container = screen.getByText('Error de sincronización').closest('div')?.parentElement;
    const secondaryLines = container?.querySelectorAll('.text-xs.opacity-80');
    expect(secondaryLines?.length ?? 0).toBe(0);
  });

  it('5.3 - Offline con ultimaSync muestra "Última sync: Hace N minutos"', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-12T12:00:00.000Z'));

    renderCorteStatusBanner({
      estadoConexion: 'offline',
      estadoSync: 'pendiente',
      ultimaSync: '2026-02-12T11:45:00.000Z', // 15 min ago
    });

    expect(screen.getByText(/Última sync: Hace 15 minutos/)).toBeInTheDocument();

    vi.useRealTimers();
  });
});

// ---------------------------------------------------------------------------
// SUITE 6: Casos de plural y singular
// ---------------------------------------------------------------------------

describe('Suite 6: Casos de plural y singular', () => {
  it('6.1 - 1 pendiente usa forma singular', () => {
    renderCorteStatusBanner({
      estadoConexion: 'online',
      estadoSync: 'pendiente',
      pendientes: 1,
    });

    expect(screen.getByText('1 operación pendiente de sincronizar')).toBeInTheDocument();
  });

  it('6.2 - Sincronizando con 1 pendiente usa forma singular', () => {
    renderCorteStatusBanner({
      estadoConexion: 'online',
      estadoSync: 'sincronizando',
      pendientes: 1,
    });

    expect(screen.getByText('Sincronizando... (1 pendiente)')).toBeInTheDocument();
  });

  it('6.3 - Sincronizando con 0 pendientes omite conteo', () => {
    renderCorteStatusBanner({
      estadoConexion: 'online',
      estadoSync: 'sincronizando',
      pendientes: 0,
    });

    expect(screen.getByText('Sincronizando...')).toBeInTheDocument();
  });

  it('6.4 - Timestamp 1 hora usa singular', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-12T12:00:00.000Z'));

    renderCorteStatusBanner({
      estadoConexion: 'offline',
      estadoSync: 'pendiente',
      ultimaSync: '2026-02-12T11:00:00.000Z', // 1 hour ago
    });

    expect(screen.getByText(/Hace 1 hora$/)).toBeInTheDocument();

    vi.useRealTimers();
  });
});

// ---------------------------------------------------------------------------
// SUITE 7: Semántica accesible (ARIA live status)
// ---------------------------------------------------------------------------

describe('Suite 7: Semántica accesible', () => {
  it('7.1 - Banner usa role=status y aria-live=polite en estados normales', () => {
    renderCorteStatusBanner({
      estadoConexion: 'online',
      estadoSync: 'sincronizado',
    });

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('aria-atomic', 'true');
  });

  it('7.2 - Banner usa aria-live=assertive cuando hay error', () => {
    renderCorteStatusBanner({
      estadoConexion: 'online',
      estadoSync: 'error',
      mensajeError: 'No se pudo sincronizar',
    });

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'assertive');
    expect(status).toHaveTextContent('Error de sincronización');
  });
});
