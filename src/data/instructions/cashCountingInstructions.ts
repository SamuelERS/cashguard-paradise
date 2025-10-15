// 🤖 [IA] - v1.2.41X: Subtítulos 2da línea + iconos semánticos coherentes
// 🤖 [IA] - v2.4.1: Optimización de instrucciones (4→2): fusión organización + actualización POS
import type { Instruction } from '@/hooks/instructions/useInstructionFlow';

export const cashCountingInstructions: Instruction[] = [
  {
    id: 'posReports',
    icon: 'Receipt',  // 🧾 Reportes y cierres de transacciones
    title: 'Saquen Reportes y Cierres de POS',
    description: 'Imprimir cierres de transacciones del día',
    minReviewTimeMs: 3000
  },
  {
    id: 'cashOrganization',
    icon: 'PackagePlus',  // 📦 v2.4.1: Fusión organización + empaquetado
    title: 'Organiza Efectivo y Paquetes de 10 U.',
    description: 'Billetes por denominación, monedas en grupos de 10',
    minReviewTimeMs: 4000
  },
];
