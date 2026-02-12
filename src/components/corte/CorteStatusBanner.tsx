// 🤖 [IA] - v1.0.0: Componente de estado de conexion y sincronizacion — Orden #006
import {
  Wifi,
  WifiOff,
  CheckCircle,
  Clock,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { NeutralActionButton } from '../ui/neutral-action-button';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

type EstadoConexion = 'online' | 'offline' | 'reconectando';

type EstadoSync = 'sincronizado' | 'pendiente' | 'sincronizando' | 'error';

interface CorteStatusBannerProps {
  estadoConexion: EstadoConexion;
  estadoSync: EstadoSync;
  ultimaSync: string | null;
  pendientes: number;
  onReintentarSync?: () => void;
  mensajeError?: string | null;
}

// ---------------------------------------------------------------------------
// Helper: formato relativo de timestamp
// ---------------------------------------------------------------------------

function formatearUltimaSync(isoString: string): string {
  try {
    const then = new Date(isoString).getTime();
    const now = Date.now();
    const diffMs = now - then;

    if (diffMs < 0) return 'Hace un momento';

    const minutes = Math.floor(diffMs / 60_000);
    if (minutes < 1) return 'Hace un momento';
    if (minutes < 60) return `Hace ${minutes} minuto${minutes === 1 ? '' : 's'}`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours} hora${hours === 1 ? '' : 's'}`;

    const days = Math.floor(hours / 24);
    return `Hace ${days} día${days === 1 ? '' : 's'}`;
  } catch {
    return isoString;
  }
}

// ---------------------------------------------------------------------------
// Helper: resolver configuracion visual segun estado
// ---------------------------------------------------------------------------

interface BannerConfig {
  containerClasses: string;
  icon: React.ReactNode;
  textoPrincipal: string;
  textoSecundario: string | null;
  mostrarReintentar: boolean;
}

function resolverConfig(props: CorteStatusBannerProps): BannerConfig {
  const { estadoConexion, estadoSync, ultimaSync, pendientes, mensajeError } = props;

  // CASO 6: Error de sincronizacion (prioridad maxima)
  if (estadoSync === 'error') {
    const secondary = mensajeError ?? null;
    return {
      containerClasses: 'bg-red-900/60 border-red-700 text-red-300',
      icon: <AlertTriangle className="w-4 h-4 shrink-0" />,
      textoPrincipal: 'Error de sincronización',
      textoSecundario: secondary,
      mostrarReintentar: true,
    };
  }

  // CASO 4: Sin conexion
  if (estadoConexion === 'offline') {
    const syncLine = ultimaSync
      ? `Última sync: ${formatearUltimaSync(ultimaSync)}`
      : 'Nunca sincronizado';
    return {
      containerClasses: 'bg-red-900/60 border-red-700 text-red-300',
      icon: <WifiOff className="w-4 h-4 shrink-0" />,
      textoPrincipal: 'Sin conexión — Los datos se guardarán localmente',
      textoSecundario: syncLine,
      mostrarReintentar: false,
    };
  }

  // CASO 5: Reconectando
  if (estadoConexion === 'reconectando') {
    return {
      containerClasses: 'bg-amber-900/60 border-amber-700 text-amber-300',
      icon: <Loader2 className="w-4 h-4 shrink-0 animate-spin" />,
      textoPrincipal: 'Reconectando...',
      textoSecundario: null,
      mostrarReintentar: false,
    };
  }

  // CASO 2: Sincronizando
  if (estadoSync === 'sincronizando') {
    const texto = pendientes > 0
      ? `Sincronizando... (${pendientes} pendiente${pendientes === 1 ? '' : 's'})`
      : 'Sincronizando...';
    return {
      containerClasses: 'bg-blue-900/60 border-blue-700 text-blue-300',
      icon: <Loader2 className="w-4 h-4 shrink-0 animate-spin" />,
      textoPrincipal: texto,
      textoSecundario: null,
      mostrarReintentar: false,
    };
  }

  // CASO 3: Pendientes
  if (estadoSync === 'pendiente') {
    const texto = pendientes > 0
      ? `${pendientes} operacion${pendientes === 1 ? '' : 'es'} pendiente${pendientes === 1 ? '' : 's'} de sincronizar`
      : 'Sincronización pendiente';
    return {
      containerClasses: 'bg-amber-900/60 border-amber-700 text-amber-300',
      icon: <Clock className="w-4 h-4 shrink-0" />,
      textoPrincipal: texto,
      textoSecundario: null,
      mostrarReintentar: false,
    };
  }

  // CASO 1: Todo bien (online + sincronizado)
  return {
    containerClasses: 'bg-green-900/60 border-green-700 text-green-300',
    icon: <CheckCircle className="w-4 h-4 shrink-0" />,
    textoPrincipal: 'Conectado — Datos sincronizados',
    textoSecundario: null,
    mostrarReintentar: false,
  };
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

function CorteStatusBanner(props: CorteStatusBannerProps) {
  const config = resolverConfig(props);

  return (
    <div
      className={`rounded-lg border px-4 py-2 transition-colors duration-300 ${config.containerClasses}`}
    >
      <div className="flex items-center gap-2">
        {config.icon}
        <span className="text-sm font-medium">{config.textoPrincipal}</span>
        {config.mostrarReintentar && props.onReintentarSync && (
          <NeutralActionButton
            onClick={props.onReintentarSync}
            className="ml-auto h-7 min-h-0 px-3 py-1 text-xs"
          >
            Reintentar
          </NeutralActionButton>
        )}
      </div>
      {config.textoSecundario && (
        <p className="text-xs opacity-80 mt-1 ml-6">{config.textoSecundario}</p>
      )}
    </div>
  );
}

export { CorteStatusBanner };
export type { CorteStatusBannerProps, EstadoConexion, EstadoSync };
