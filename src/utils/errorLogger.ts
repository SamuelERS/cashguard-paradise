/**
 * 🤖 [IA] - Error Logger Service - v1.0.0
 * 
 * @description
 * Servicio centralizado para logging y tracking de errores.
 * Proporciona funciones para registrar errores, warnings y eventos importantes.
 * En producción, estos logs pueden ser enviados a servicios externos como Sentry, LogRocket, etc.
 */

/**
 * Tipos de severidad para los logs
 */
export enum ErrorSeverity {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * Interface para estructura de error log
 */
export interface ErrorLog {
  timestamp: string;
  severity: ErrorSeverity;
  message: string;
  error?: Error;
  stack?: string;
  componentStack?: string;
  userAgent: string;
  url: string;
  context?: Record<string, unknown>;
}

/**
 * Clase singleton para gestión de logs
 */
class ErrorLoggerService {
  private logs: ErrorLog[] = [];
  private maxLogs = 100; // Mantener máximo 100 logs en memoria

  /**
   * Registra un error con toda la información contextual
   */
  logError(
    message: string,
    error?: Error,
    context?: Record<string, unknown>,
    componentStack?: string
  ): void {
    const errorLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      severity: ErrorSeverity.ERROR,
      message,
      error,
      stack: error?.stack,
      componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      context,
    };

    this.addLog(errorLog);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Error Logger:', message, {
        error,
        stack: error?.stack,
        componentStack,
        context,
      });
    }

    // En producción, enviar a servicio externo
    this.sendToExternalService(errorLog);
  }

  /**
   * Registra un warning
   */
  logWarning(message: string, context?: Record<string, unknown>): void {
    const warningLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      severity: ErrorSeverity.WARNING,
      message,
      userAgent: navigator.userAgent,
      url: window.location.href,
      context,
    };

    this.addLog(warningLog);

    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Warning Logger:', message, context);
    }

    this.sendToExternalService(warningLog);
  }

  /**
   * Registra información general
   */
  logInfo(message: string, context?: Record<string, unknown>): void {
    const infoLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      severity: ErrorSeverity.INFO,
      message,
      userAgent: navigator.userAgent,
      url: window.location.href,
      context,
    };

    this.addLog(infoLog);

    if (process.env.NODE_ENV === 'development') {
      console.info('ℹ️ Info Logger:', message, context);
    }
  }

  /**
   * Registra error crítico que requiere atención inmediata
   */
  logCritical(
    message: string,
    error?: Error,
    context?: Record<string, unknown>
  ): void {
    const criticalLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      severity: ErrorSeverity.CRITICAL,
      message,
      error,
      stack: error?.stack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      context,
    };

    this.addLog(criticalLog);

    if (process.env.NODE_ENV === 'development') {
      console.error('🔥 CRITICAL Error:', message, {
        error,
        stack: error?.stack,
        context,
      });
    }

    this.sendToExternalService(criticalLog);
  }

  /**
   * Agrega log al array interno (mantiene máximo N logs)
   */
  private addLog(log: ErrorLog): void {
    this.logs.push(log);

    // Mantener solo los últimos maxLogs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  /**
   * Envía log a servicio externo (placeholder para integración futura)
   */
  private sendToExternalService(log: ErrorLog): void {
    // Solo en producción
    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    // PLACEHOLDER: Aquí integrar con servicio real
    // Ejemplos de servicios populares:
    
    // Sentry:
    // Sentry.captureException(log.error, {
    //   level: log.severity,
    //   extra: log.context,
    // });

    // LogRocket:
    // LogRocket.captureException(log.error, {
    //   tags: {
    //     severity: log.severity,
    //   },
    //   extra: log.context,
    // });

    // Custom API endpoint:
    // fetch('/api/logs', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(log),
    // }).catch(console.error);

    // Por ahora, solo lo guardamos en localStorage como backup
    try {
      const storedLogs = JSON.parse(localStorage.getItem('error_logs') || '[]');
      storedLogs.push({
        timestamp: log.timestamp,
        severity: log.severity,
        message: log.message,
        url: log.url,
      });
      
      // Mantener solo los últimos 50 en localStorage
      if (storedLogs.length > 50) {
        storedLogs.splice(0, storedLogs.length - 50);
      }
      
      localStorage.setItem('error_logs', JSON.stringify(storedLogs));
    } catch (error) {
      // Si localStorage falla, no hacer nada
      console.error('Failed to store error log:', error);
    }
  }

  /**
   * Obtiene todos los logs almacenados (útil para debugging)
   */
  getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  /**
   * Limpia todos los logs
   */
  clearLogs(): void {
    this.logs = [];
    
    try {
      localStorage.removeItem('error_logs');
    } catch (error) {
      console.error('Failed to clear error logs:', error);
    }
  }

  /**
   * Obtiene logs filtrados por severidad
   */
  getLogsBySeverity(severity: ErrorSeverity): ErrorLog[] {
    return this.logs.filter(log => log.severity === severity);
  }
}

// Exportar instancia singleton
export const errorLogger = new ErrorLoggerService();

/**
 * Helper function para uso rápido
 */
export function logError(
  message: string,
  error?: Error,
  context?: Record<string, unknown>
): void {
  errorLogger.logError(message, error, context);
}

export function logWarning(
  message: string,
  context?: Record<string, unknown>
): void {
  errorLogger.logWarning(message, context);
}

export function logInfo(
  message: string,
  context?: Record<string, unknown>
): void {
  errorLogger.logInfo(message, context);
}

export function logCritical(
  message: string,
  error?: Error,
  context?: Record<string, unknown>
): void {
  errorLogger.logCritical(message, error, context);
}
