// 🤖 [IA] - Orden #4 DACC Dashboard Supervisor — SupervisorDashboard
// Shell de autenticación y layout del módulo supervisor.
// PIN auth vía PinModal + sessionStorage TTL 4h + lockout tras 5 intentos fallidos.

import { useState, useCallback } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { PinModal } from '@/components/ui/pin-modal';

// ---------------------------------------------------------------------------
// 1. Constantes
// ---------------------------------------------------------------------------

/** Clave de sessionStorage para la sesión supervisor autenticada. */
const SESSION_KEY = 'supervisor_session';

/** Tiempo de vida de la sesión supervisor (4 horas en ms). */
const SESSION_TTL_MS = 4 * 60 * 60 * 1000;

/** Clave de sessionStorage para el bloqueo por intentos fallidos. */
const LOCKOUT_KEY = 'supervisor_lockout';

/** Duración del bloqueo por intentos fallidos (10 minutos en ms). */
const LOCKOUT_DURATION_MS = 10 * 60 * 1000;

/** Máximo de intentos de PIN antes de bloquear el acceso. */
const MAX_INTENTOS_PIN = 5;

/** Tabs de navegación del dashboard. */
const TABS: ReadonlyArray<{ label: string; href: string }> = [
  { label: 'Hoy', href: '/supervisor/cortes' },
  { label: 'Historial', href: '/supervisor/historial' },
];

// ---------------------------------------------------------------------------
// 2. Helpers de sessionStorage (lectura/escritura defensiva)
// ---------------------------------------------------------------------------

/** Retorna true si existe una sesión supervisor válida (no expirada). */
function esAutenticado(): boolean {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const expiry = typeof parsed.expiry === 'number' ? parsed.expiry : 0;
    return Date.now() < expiry;
  } catch {
    return false;
  }
}

/** Persiste una sesión supervisor con TTL de 4 horas. */
function guardarSesion(): void {
  const expiry = Date.now() + SESSION_TTL_MS;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ expiry }));
}

/** Elimina la sesión supervisor (cierre de sesión explícito). */
function eliminarSesion(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

/** Retorna true si el bloqueo por intentos fallidos está activo (y no expiró). */
function estaBloquedado(): boolean {
  try {
    const raw = sessionStorage.getItem(LOCKOUT_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const hasta = typeof parsed.hasta === 'number' ? parsed.hasta : 0;
    if (Date.now() > hasta) {
      sessionStorage.removeItem(LOCKOUT_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/** Activa el bloqueo por intentos fallidos durante 10 minutos. */
function activarLockout(): void {
  const hasta = Date.now() + LOCKOUT_DURATION_MS;
  sessionStorage.setItem(LOCKOUT_KEY, JSON.stringify({ hasta }));
}

// ---------------------------------------------------------------------------
// 3. Componente
// ---------------------------------------------------------------------------

/**
 * Shell principal del módulo supervisor.
 *
 * Gestiona el flujo de autenticación (PinModal) y el layout
 * con header + tabs de navegación + Outlet para rutas hijas.
 *
 * Rutas hijas:
 * - /supervisor/cortes      → Vista A: CortesDelDia
 * - /supervisor/corte/:id   → Vista B: CorteDetalle (ORDEN #5)
 * - /supervisor/historial   → Vista C: CorteHistorial (ORDEN #5)
 */
export default function SupervisorDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [autenticado, setAutenticado] = useState<boolean>(() => esAutenticado());
  const [intentosPIN, setIntentosPIN] = useState<number>(0);
  const [bloqueado, setBloqueado] = useState<boolean>(() => estaBloquedado());

  // ── Handlers PIN ──────────────────────────────────────────────────────────

  const handlePINExitoso = useCallback(() => {
    guardarSesion();
    setAutenticado(true);
  }, []);

  const handlePINError = useCallback(() => {
    setIntentosPIN((prev) => {
      const nuevosIntentos = prev + 1;
      if (nuevosIntentos >= MAX_INTENTOS_PIN) {
        activarLockout();
        setBloqueado(true);
      }
      return nuevosIntentos;
    });
  }, []);

  const handleCancelar = useCallback(() => navigate('/'), [navigate]);

  const handleCerrarSesion = useCallback(() => {
    eliminarSesion();
    setAutenticado(false);
    setIntentosPIN(0);
    setBloqueado(false);
  }, []);

  // ── PIN gate ──────────────────────────────────────────────────────────────

  if (!autenticado) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <PinModal
          isOpen={true}
          onSuccess={handlePINExitoso}
          onError={handlePINError}
          onCancel={handleCancelar}
          isLocked={bloqueado}
          attempts={intentosPIN}
          maxAttempts={MAX_INTENTOS_PIN}
        />
      </div>
    );
  }

  // ── Layout autenticado ────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* ── Header ── */}
      <header
        className="sticky top-0 z-10 border-b border-white/10"
        style={{ background: 'rgba(10, 10, 10, 0.92)', backdropFilter: 'blur(12px)' }}
      >
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center justify-between">
          {/* Título + botón volver */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCancelar}
              className="text-white/40 hover:text-white/70 transition-colors text-base leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded"
              aria-label="Volver a operaciones"
            >
              ←
            </button>
            <h1 className="text-sm font-semibold text-white/90">Dashboard Supervisor</h1>
          </div>

          {/* Cerrar sesión */}
          <button
            type="button"
            onClick={handleCerrarSesion}
            className="text-xs text-white/40 hover:text-white/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded px-2 py-1"
          >
            Cerrar sesión
          </button>
        </div>

        {/* ── Tabs de navegación ── */}
        <nav
          className="mx-auto max-w-2xl px-4"
          aria-label="Navegación del dashboard supervisor"
        >
          <div className="flex gap-1">
            {TABS.map((tab) => {
              const activo = location.pathname.startsWith(tab.href);
              return (
                <button
                  key={tab.href}
                  type="button"
                  onClick={() => navigate(tab.href)}
                  className={[
                    'px-4 py-2 text-sm font-medium border-b-2 transition-colors focus-visible:outline-none',
                    activo
                      ? 'border-white/70 text-white/90'
                      : 'border-transparent text-white/40 hover:text-white/60',
                  ].join(' ')}
                  aria-current={activo ? 'page' : undefined}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      {/* ── Contenido de la ruta hija activa ── */}
      <main className="mx-auto max-w-2xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
