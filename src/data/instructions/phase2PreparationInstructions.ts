// 🤖 [IA] - v1.2.41AD: Phase2 Preparation Instructions - Doctrina D.5 Compliance
// Configuración de datos para modal de instrucciones de Phase2Manager
// Arquitectura Guiada Basada en Datos - separación UI/Lógica/Datos completa
import type { Instruction } from '@/hooks/instructions/useInstructionFlow';

export const phase2PreparationInstructions: Instruction[] = [
  {
    id: 'bolsa',
    icon: 'Package',
    title: 'Bolsa Lista Para Entrega',
    description: 'Preparar bolsa plástica o de tela',
    minReviewTimeMs: 0 // Checklist sin timing obligatorio (instant check)
  },
  {
    id: 'tirro',
    icon: 'Pencil',
    title: 'Cinta y Rotulador Listo',
    description: 'Tener cinta adhesiva y marcador',
    minReviewTimeMs: 0
  },
  {
    id: 'espacio',
    icon: 'Banknote',
    title: 'Tomar Cantidad Para Bolsa',
    description: 'Contar y separar dinero calculado',
    minReviewTimeMs: 0
  },
  {
    id: 'entendido',
    icon: 'CheckCircle2',
    title: 'Estamos listos para continuar',
    description: 'Verificar que todo esté preparado',
    minReviewTimeMs: 0
  }
];
