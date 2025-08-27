// 🤖 [IA] - v1.0.81 - Tipos para modos de operación del sistema
export enum OperationMode {
  CASH_COUNT = 'cash_count',  // Conteo de caja matutino (inicio de turno)
  CASH_CUT = 'cash_cut'       // Corte de caja nocturno (fin de turno)
}

export interface OperationModeInfo {
  mode: OperationMode;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  buttonText: string;
  requiresExpectedSales: boolean;
  requiresPhase2: boolean;
  targetAmount: number;
}

// Configuración de cada modo
export const OPERATION_MODES: Record<OperationMode, OperationModeInfo> = {
  [OperationMode.CASH_COUNT]: {
    mode: OperationMode.CASH_COUNT,
    title: 'Conteo de Caja',
    subtitle: 'Inicio de Turno',
    description: 'Verificación del cambio inicial para comenzar el día',
    icon: 'sunrise',
    buttonText: 'Iniciar Conteo Matutino',
    requiresExpectedSales: false,
    requiresPhase2: false,
    targetAmount: 50 // Solo verificar que hay $50 para cambio
  },
  [OperationMode.CASH_CUT]: {
    mode: OperationMode.CASH_CUT,
    title: 'Corte de Caja',
    subtitle: 'Fin de Turno',
    description: 'Cierre completo con entrega de efectivo y reporte final',
    icon: 'moon',
    buttonText: 'Comenzar Corte de Caja',
    requiresExpectedSales: true,
    requiresPhase2: true,
    targetAmount: 50 // Dejar $50 para el siguiente turno
  }
};