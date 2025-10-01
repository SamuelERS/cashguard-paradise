/**
 * 🤖 [IA] - ErrorBoundary Component - v1.0.0
 * 
 * @description
 * Componente de clase que captura errores de JavaScript en cualquier parte del árbol de
 * componentes hijo, registra esos errores y muestra una UI de respaldo en lugar de
 * hacer que toda la aplicación se caiga.
 * 
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 * ```
 * 
 * Features:
 * - Captura errores en componentes hijos
 * - Registra errores con stack trace completo
 * - Muestra UI de fallback amigable
 * - Permite reset manual del error
 * - Logging estructurado para debugging
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary - Componente de clase para captura de errores
 * 
 * Implementa el patrón Error Boundary de React para:
 * 1. Prevenir que toda la aplicación se caiga por un error
 * 2. Mostrar UI de fallback amigable
 * 3. Registrar errores para debugging
 * 4. Permitir recovery sin recargar la página
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * Método estático llamado durante la fase de render cuando un error es lanzado
   * Actualiza el estado para mostrar la UI de fallback
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Método del ciclo de vida llamado después de que un error fue capturado
   * Usado para logging y reporting del error
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details
    this.logError(error, errorInfo);

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  /**
   * Registra el error con detalles completos
   * Solo en desarrollo para no exponer información sensible en producción
   */
  private logError(error: Error, errorInfo: ErrorInfo): void {
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught an Error');
      console.error('Error:', error);
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }

    // En producción, aquí se enviaría a un servicio de logging
    // como Sentry, LogRocket, etc.
    // Example:
    // logErrorToService({
    //   error: error.message,
    //   stack: error.stack,
    //   componentStack: errorInfo.componentStack,
    //   timestamp: new Date().toISOString(),
    //   userAgent: navigator.userAgent,
    // });
  }

  /**
   * Reset error state para intentar recovery
   */
  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  /**
   * Navegar a home como fallback
   */
  private handleGoHome = (): void => {
    window.location.href = '/';
  };

  /**
   * Renderiza la UI de fallback si hay un error, sino renderiza children normalmente
   */
  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Si se proporciona un fallback custom, usarlo
      if (fallback) {
        return fallback;
      }

      // UI de fallback por defecto
      return (
        <div className="min-h-screen flex items-center justify-center p-4"
             style={{
               background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
             }}>
          <div className="max-w-2xl w-full"
               style={{
                 backgroundColor: 'rgba(36, 36, 36, 0.8)',
                 backdropFilter: 'blur(20px)',
                 WebkitBackdropFilter: 'blur(20px)',
                 border: '1px solid rgba(255, 255, 255, 0.1)',
                 borderRadius: '16px',
                 padding: 'clamp(1.5rem, 6vw, 2.5rem)',
                 boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
               }}>
            {/* Header con icono de error */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4"
                   style={{
                     background: 'linear-gradient(135deg, #f4212e 0%, #ff4757 100%)',
                     borderRadius: '50%',
                   }}>
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-2" style={{ color: '#e1e8ed' }}>
                ¡Ups! Algo salió mal
              </h1>
              <p className="text-base" style={{ color: '#8899a6' }}>
                La aplicación encontró un error inesperado
              </p>
            </div>

            {/* Mensaje de error (solo en desarrollo) */}
            {process.env.NODE_ENV === 'development' && error && (
              <div className="mb-6 p-4 rounded-lg"
                   style={{
                     backgroundColor: 'rgba(244, 33, 46, 0.1)',
                     border: '1px solid rgba(244, 33, 46, 0.3)',
                   }}>
                <h3 className="font-semibold mb-2" style={{ color: '#f4212e' }}>
                  Error Details (Development Only):
                </h3>
                <p className="text-sm font-mono mb-2" style={{ color: '#e1e8ed' }}>
                  {error.message}
                </p>
                {errorInfo && (
                  <details className="text-xs mt-2">
                    <summary className="cursor-pointer" style={{ color: '#8899a6' }}>
                      Ver stack trace
                    </summary>
                    <pre className="mt-2 p-2 overflow-auto max-h-48 rounded"
                         style={{
                           backgroundColor: 'rgba(0, 0, 0, 0.3)',
                           color: '#8899a6',
                         }}>
                      {errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Mensaje para el usuario */}
            <div className="mb-6 p-4 rounded-lg"
                 style={{
                   backgroundColor: 'rgba(255, 255, 255, 0.05)',
                   border: '1px solid rgba(255, 255, 255, 0.1)',
                 }}>
              <p className="text-sm" style={{ color: '#e1e8ed' }}>
                No te preocupes, tus datos están seguros. Puedes intentar:
              </p>
              <ul className="mt-3 space-y-2 text-sm" style={{ color: '#8899a6' }}>
                <li>• Reintentar la operación</li>
                <li>• Volver a la página principal</li>
                <li>• Recargar la aplicación</li>
              </ul>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={this.handleReset}
                className="flex-1"
                style={{
                  background: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)',
                  color: 'white',
                  border: 'none',
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reintentar
              </Button>
              <Button
                onClick={this.handleGoHome}
                variant="secondary"
                className="flex-1"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#e1e8ed',
                }}
              >
                <Home className="w-4 h-4 mr-2" />
                Ir al Inicio
              </Button>
            </div>

            {/* Footer con timestamp */}
            <div className="mt-6 pt-4 text-center text-xs"
                 style={{
                   color: '#8899a6',
                   borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                 }}>
              Error registrado: {new Date().toLocaleString('es-SV', {
                timeZone: 'America/El_Salvador',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

/**
 * Hook version del ErrorBoundary para usar en componentes funcionales
 * Nota: Este es un wrapper, el ErrorBoundary real debe ser un componente de clase
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  return function WithErrorBoundaryWrapper(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
