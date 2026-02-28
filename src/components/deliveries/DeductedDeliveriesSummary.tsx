/**
 * 🤖 [IA] - v3.5.2: Resumen read-only de deliveries deducidos del corte
 *
 * Reemplaza <DeliveryManager /> (CRUD) en la pantalla de resultados del corte.
 * Solo muestra deliveries que ya fueron deducidos (tienen deductedAt).
 * Sin botones de crear, editar o eliminar.
 */
import type { DeliveryEntry } from '@/types/deliveries';
import { formatCurrency } from '@/utils/calculations';

interface DeductedDeliveriesSummaryProps {
  deliveries: DeliveryEntry[];
}

export function DeductedDeliveriesSummary({ deliveries }: DeductedDeliveriesSummaryProps) {
  const deducted = deliveries.filter((d) => d.deductedAt);

  if (deducted.length === 0) {
    return (
      <p className="text-[clamp(0.75rem,3vw,0.875rem)] text-center py-4" style={{ color: '#8899a6' }}>
        No hay deliveries deducidos en este corte.
      </p>
    );
  }

  const total = deducted.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="space-y-3">
      {deducted.map((d) => (
        <div
          key={d.id}
          className="flex justify-between items-center p-[clamp(0.5rem,2vw,0.75rem)] rounded-[clamp(0.375rem,1.5vw,0.5rem)]"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        >
          <div>
            <p className="text-[clamp(0.875rem,3.5vw,1rem)] font-medium" style={{ color: '#e1e8ed' }}>
              {d.customerName}
            </p>
            <p className="text-[clamp(0.7rem,2.8vw,0.8rem)]" style={{ color: '#8899a6' }}>
              {d.courier}
            </p>
          </div>
          <span className="text-[clamp(0.875rem,3.5vw,1rem)] font-bold" style={{ color: '#ff9f0a' }}>
            {formatCurrency(d.amount)}
          </span>
        </div>
      ))}

      <div
        className="flex justify-between items-center pt-3 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
      >
        <span className="text-[clamp(0.875rem,3.5vw,1rem)] font-medium" style={{ color: '#8899a6' }}>
          Total deducido:
        </span>
        <span className="text-[clamp(1rem,4vw,1.125rem)] font-bold" style={{ color: '#ff9f0a' }}>
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  );
}
