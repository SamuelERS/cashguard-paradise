import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const routerMock = vi.hoisted(() => ({
  pathname: '/supervisor/historial',
  navigate: vi.fn(),
}));

const pinModalMock = vi.hoisted(() => ({
  lastProps: null as Record<string, unknown> | null,
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => routerMock.navigate,
  useLocation: () => ({ pathname: routerMock.pathname }),
  Outlet: () => <div data-testid="supervisor-outlet">Supervisor outlet</div>,
}));

vi.mock('@/components/ui/pin-modal', () => ({
  PinModal: (props: { onSuccess?: () => void }) => {
    pinModalMock.lastProps = props;
    return (
      <div data-testid="pin-modal-mock">
        Pin modal
        <button type="button" onClick={() => props.onSuccess?.()}>
          Desbloquear
        </button>
      </div>
    );
  },
}));

import SupervisorDashboard from '@/pages/SupervisorDashboard';

async function renderAutenticado() {
  const user = userEvent.setup();
  const view = render(<SupervisorDashboard />);
  await user.click(screen.getByRole('button', { name: /desbloquear/i }));
  return { user, ...view };
}

describe('SupervisorDashboard - botones de navegación', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    routerMock.pathname = '/supervisor/historial';
  });

  it('navega con tabs Hoy/Historial', async () => {
    const { user } = await renderAutenticado();

    await user.click(screen.getByRole('button', { name: 'Hoy' }));
    await user.click(screen.getByRole('button', { name: 'Historial' }));

    expect(routerMock.navigate).toHaveBeenNthCalledWith(1, '/supervisor/cortes');
    expect(routerMock.navigate).toHaveBeenNthCalledWith(2, '/supervisor/historial');
  });

  it('marca tab activo según ruta actual', async () => {
    routerMock.pathname = '/supervisor/historial';

    const { rerender } = await renderAutenticado();

    expect(screen.getByRole('button', { name: 'Historial' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Hoy' })).not.toHaveAttribute('aria-current');

    routerMock.pathname = '/supervisor/cortes';
    rerender(<SupervisorDashboard />);

    expect(screen.getByRole('button', { name: 'Hoy' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Historial' })).not.toHaveAttribute('aria-current');
  });

  it('botón Volver a operaciones navega al home', async () => {
    const { user } = await renderAutenticado();
    await user.click(screen.getByRole('button', { name: /volver a operaciones/i }));

    expect(routerMock.navigate).toHaveBeenCalledWith('/');
  });

  it('Cerrar sesión elimina sesión activa y muestra PinModal', async () => {
    const { user } = await renderAutenticado();
    await user.click(screen.getByRole('button', { name: /cerrar sesión/i }));

    expect(sessionStorage.getItem('supervisor_session')).toBeNull();
    expect(screen.getByTestId('pin-modal-mock')).toBeInTheDocument();
  });
});
