// 🤖 [IA] - v2.6.1: Orden lógico de trabajo real - Bolsa → Documentos → Efectivo (seguridad: dinero de último)
// Previous: v2.4.1 - Optimización (4→3): fusión bolsa+rotulador, nuevo punto documentos, eliminada redundancia
// Previous: v1.2.41AD - Phase2 Preparation Instructions - Doctrina D.5 Compliance
// Configuración de datos para modal de instrucciones de Phase2Manager
// Arquitectura Guiada Basada en Datos - separación UI/Lógica/Datos completa
import type { Instruction } from '@/hooks/instructions/useInstructionFlow';

export const phase2PreparationInstructions: Instruction[] = [
  {
    id: 'bolsaPreparada',
    icon: 'Package',
    title: 'Prepara y Rotula la Bolsa',
    description: 'Tomar bolsa y rotular con fecha y sucursal',
    minReviewTimeMs: 0 // Checklist sin timing obligatorio (instant check)
  },
  {
    id: 'documentos',
    icon: 'FileText',
    title: 'Envía Todos los Documentos',
    description: 'Facturas, gastos, cierres POS y notificaciones',
    minReviewTimeMs: 0
  },
  {
    id: 'efectivo',
    icon: 'Banknote',
    title: 'Separa el Efectivo Calculado',
    description: 'Contar y apartar dinero para entrega',
    minReviewTimeMs: 0
  }
];
