import type { SupervisorRealtimeStatus } from '@/hooks/useSupervisorRealtime';

interface SupervisorLiveBadgeProps {
  status: SupervisorRealtimeStatus;
  actualizando?: boolean;
  spinnerAriaLabel?: string;
}

export function SupervisorLiveBadge({
  status,
  actualizando = false,
  spinnerAriaLabel = 'Actualizando',
}: SupervisorLiveBadgeProps) {
  const label = status === 'subscribed'
    ? 'En vivo'
    : status === 'error'
      ? 'Reconectando'
      : status === 'connecting'
        ? 'Conectando'
        : status === 'idle'
          ? 'En espera'
          : 'Sin realtime';

  const colorClass = status === 'subscribed'
    ? 'text-emerald-300/90'
    : status === 'error'
      ? 'text-amber-300/90'
      : 'text-white/45';

  return (
    <div className="flex items-center gap-2">
      <span className={['text-xs font-medium', colorClass].join(' ')}>{label}</span>
      {actualizando && (
        <div
          className="h-3 w-3 rounded-full border border-white/20 border-t-white/60 animate-spin"
          role="status"
          aria-label={spinnerAriaLabel}
        />
      )}
    </div>
  );
}
