// 🤖 [IA] - v1.3.1: Configuración centralizada de toast notifications
// Resuelve Bug #13: Toast Notifications sin Control de Duración

/**
 * Duraciones estándar para toast notifications
 * Basado en mejores prácticas UX y accesibilidad
 */
export const TOAST_DURATIONS = {
  /** 2 segundos - Para mensajes de éxito simples */
  SHORT: 2000,
  
  /** 4 segundos - Para mensajes informativos (default) */
  NORMAL: 4000,
  
  /** 6 segundos - Para mensajes importantes o con detalles */
  LONG: 6000,
  
  /** 8 segundos - Para errores o advertencias que requieren atención */
  EXTENDED: 8000,
} as const;

/**
 * Mensajes predefinidos para consistencia en toda la app
 */
export const TOAST_MESSAGES = {
  // Éxitos generales
  SUCCESS_PHASE1: "✅ Fase 1 completada correctamente",
  SUCCESS_PHASE2: "✅ Fase 2 completada correctamente",
  SUCCESS_COPIED: "💾 Copiado al portapapeles",
  SUCCESS_REPORT_GENERATED: "📄 Reporte generado",
  SUCCESS_PREVIOUS_FIELD: "⬅️ Campo anterior activado - Los valores se mantuvieron",
  
  // Informativos
  INFO_SKIP_PHASE2: "💡 Total ≤ $50. Saltando a reporte final.",
  INFO_PROCEED_PHASE2: "💰 Procediendo a división del efectivo (Fase 2)",
  INFO_PROCEED_PHASE3: "📊 Procediendo a generar reporte final (Fase 3)",
  INFO_FIRST_FIELD: "ℹ️ Ya está en el primer campo",
  
  // Errores
  ERROR_COMPLETE_FIELDS: "Complete todos los campos para continuar",
  ERROR_REVIEW_RULES: "Debe revisar todas las reglas del protocolo",
  ERROR_COMPLETE_CURRENT: "Debe completar el campo actual antes de continuar",
  ERROR_LOCKED_TOTALS: "🔒 Conteo finalizado - No se puede retroceder en la fase de totales",
  ERROR_CANNOT_GO_BACK: "⚠️ No se pudo retroceder",
  ERROR_MISSING_DATA: "Faltan datos necesarios para generar el reporte",
  ERROR_COPY_FAILED: "No se pudo copiar al portapapeles. Intente de nuevo.",
  ERROR_GENERATE_REPORT: "Error al generar el reporte",
} as const;

/**
 * Configuración de toast por tipo
 */
export const TOAST_CONFIG = {
  success: {
    duration: TOAST_DURATIONS.SHORT,
  },
  error: {
    duration: TOAST_DURATIONS.EXTENDED,
  },
  info: {
    duration: TOAST_DURATIONS.NORMAL,
  },
  warning: {
    duration: TOAST_DURATIONS.LONG,
  },
} as const;
