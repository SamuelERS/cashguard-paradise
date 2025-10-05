/**
 * Audit Logger - Centralized Testing Audit Trail
 *
 * 🎯 **PROPÓSITO**: Trazabilidad completa de validaciones matemáticas para
 * garantizar transparencia total en caso de discrepancias financieras.
 *
 * Cumplimiento:
 * - NIST SP 800-115: Section 7.4 "Test Result Analysis and Reporting"
 * - PCI DSS 12.10.1: Audit trail retention (minimum 1 year)
 *
 * @version 1.0.0
 */

import { TripleValidationResult } from './cross-validation';

/**
 * Niveles de severidad para el audit trail
 */
export enum AuditSeverity {
  /** Operación exitosa, validación pasó */
  SUCCESS = 'SUCCESS',
  /** Advertencia, discrepancia dentro de tolerancia */
  WARNING = 'WARNING',
  /** Error crítico, discrepancia fuera de tolerancia */
  CRITICAL = 'CRITICAL'
}

/**
 * Entrada individual del audit trail
 */
export interface AuditEntry {
  /** Timestamp ISO 8601 */
  timestamp: string;
  /** Operación validada (ej: 'calculateCashTotal') */
  operation: string;
  /** Nivel de severidad */
  severity: AuditSeverity;
  /** Resultado de validación completo */
  validation: TripleValidationResult;
  /** Información adicional de contexto */
  context?: Record<string, unknown>;
  /** Test que generó esta entrada */
  testName?: string;
}

/**
 * Clase singleton para gestión centralizada del audit trail
 */
class AuditLogger {
  private entries: AuditEntry[] = [];
  private enabled: boolean = true;

  /**
   * Registra una validación en el audit trail
   */
  log(
    validation: TripleValidationResult,
    context?: Record<string, unknown>,
    testName?: string
  ): void {
    if (!this.enabled) return;

    const severity = validation.valid
      ? AuditSeverity.SUCCESS
      : AuditSeverity.CRITICAL;

    const entry: AuditEntry = {
      timestamp: validation.timestamp,
      operation: validation.operation,
      severity,
      validation,
      context,
      testName
    };

    this.entries.push(entry);

    // Log inmediato en consola si es crítico
    if (severity === AuditSeverity.CRITICAL) {
      console.error('🚨 AUDIT TRAIL - CRITICAL DISCREPANCY:', {
        operation: validation.operation,
        discrepancies: validation.discrepancies,
        testName,
        context
      });
    }
  }

  /**
   * Obtiene todas las entradas del audit trail
   */
  getAll(): AuditEntry[] {
    return [...this.entries];
  }

  /**
   * Obtiene entradas filtradas por severidad
   */
  getBySeverity(severity: AuditSeverity): AuditEntry[] {
    return this.entries.filter(e => e.severity === severity);
  }

  /**
   * Obtiene entradas filtradas por operación
   */
  getByOperation(operation: string): AuditEntry[] {
    return this.entries.filter(e => e.operation === operation);
  }

  /**
   * Genera reporte resumido del audit trail
   */
  generateReport(): AuditReport {
    const total = this.entries.length;
    const success = this.entries.filter(e => e.severity === AuditSeverity.SUCCESS).length;
    const warnings = this.entries.filter(e => e.severity === AuditSeverity.WARNING).length;
    const critical = this.entries.filter(e => e.severity === AuditSeverity.CRITICAL).length;

    const operationStats = this.entries.reduce((acc, entry) => {
      if (!acc[entry.operation]) {
        acc[entry.operation] = { total: 0, success: 0, critical: 0 };
      }
      acc[entry.operation].total++;
      if (entry.severity === AuditSeverity.SUCCESS) {
        acc[entry.operation].success++;
      } else if (entry.severity === AuditSeverity.CRITICAL) {
        acc[entry.operation].critical++;
      }
      return acc;
    }, {} as Record<string, { total: number; success: number; critical: number }>);

    return {
      total,
      success,
      warnings,
      critical,
      successRate: total > 0 ? (success / total) * 100 : 0,
      criticalRate: total > 0 ? (critical / total) * 100 : 0,
      operationStats,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Limpia el audit trail (útil entre test suites)
   */
  clear(): void {
    this.entries = [];
  }

  /**
   * Habilita/deshabilita logging (útil para tests de performance)
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Exporta audit trail completo a formato JSON
   */
  exportToJSON(): string {
    return JSON.stringify({
      report: this.generateReport(),
      entries: this.entries
    }, null, 2);
  }

  /**
   * Exporta solo discrepancias críticas (para análisis rápido)
   */
  exportCriticalDiscrepancies(): string {
    const critical = this.getBySeverity(AuditSeverity.CRITICAL);
    return JSON.stringify(critical.map(entry => ({
      timestamp: entry.timestamp,
      operation: entry.operation,
      testName: entry.testName,
      discrepancies: entry.validation.discrepancies,
      values: {
        primary: entry.validation.primary,
        manual: entry.validation.manual,
        propertyBased: entry.validation.propertyBased
      },
      context: entry.context
    })), null, 2);
  }
}

/**
 * Reporte resumido del audit trail
 */
export interface AuditReport {
  /** Total de validaciones registradas */
  total: number;
  /** Validaciones exitosas */
  success: number;
  /** Validaciones con advertencias */
  warnings: number;
  /** Validaciones críticas (fallidas) */
  critical: number;
  /** Tasa de éxito (%) */
  successRate: number;
  /** Tasa de errores críticos (%) */
  criticalRate: number;
  /** Estadísticas por operación */
  operationStats: Record<string, { total: number; success: number; critical: number }>;
  /** Timestamp del reporte */
  timestamp: string;
}

/**
 * Instancia singleton del audit logger
 */
export const auditLogger = new AuditLogger();

/**
 * Hook de utilidad para usar en tests con auto-cleanup
 */
export function useAuditLogger(testName: string) {
  return {
    log: (
      validation: TripleValidationResult,
      context?: Record<string, unknown>
    ) => auditLogger.log(validation, context, testName),

    getReport: () => auditLogger.generateReport(),

    clear: () => auditLogger.clear()
  };
}
