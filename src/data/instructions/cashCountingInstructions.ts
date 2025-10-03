// 🤖 [IA] - v1.2.41X: Subtítulos 2da línea + iconos semánticos coherentes
import type { Instruction } from '@/hooks/instructions/useInstructionFlow';

export const cashCountingInstructions: Instruction[] = [
  {
    id: 'confirmation',
    icon: 'Receipt',  // 🧾 v1.2.41X: Cierres = recibos/documentos (no ShieldCheck)
    title: 'Saca Los Cierres De Los POS',
    description: 'Obtener recibos de transacciones del día',
    minReviewTimeMs: 3000
  },
  {
    id: 'counting',
    icon: 'Camera',  // 📷 v1.2.41X: Cámara visible (no Calculator)
    title: 'No Tapes La Cámara',
    description: 'Mantener visibilidad completa durante el conteo',
    minReviewTimeMs: 5000
  },
  {
    id: 'ordering',
    icon: 'ArrowDownUp',  // ↕️ v1.2.41X: Ordenamiento/clasificación (no Box)
    title: 'Ordena Por Depósito',
    description: 'Clasificar billetes y monedas por denominación',
    minReviewTimeMs: 4000
  },
  {
    id: 'packaging',
    icon: 'PackagePlus',  // ✅ Mantener - semánticamente correcto
    title: 'Monedas En Paquetes de 10',
    description: 'Agrupar monedas en paquetes de 10 unidades',
    minReviewTimeMs: 4000
  },
];
