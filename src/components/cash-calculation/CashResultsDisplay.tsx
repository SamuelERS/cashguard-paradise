// 🤖 [IA] - Extraído de CashCalculation.tsx para cumplir Mandamiento #1 (<500 líneas/archivo)
// JSX de resultados del corte de caja (información sucursal, totales, cambio, deliveries)

import { AlertTriangle } from 'lucide-react';
import { formatCurrency, calculateChange50 } from '@/utils/calculations';
import type { CashCount, ElectronicPayments } from '@/types/cash';
import type { PhaseState, DeliveryCalculation } from '@/types/phases';
import type { CalculationData } from '@/utils/generate-evening-report';
import { DenominationsList } from '@/components/cash-calculation/DenominationsList';
import { DeliveryManager } from '@/components/deliveries/DeliveryManager';

interface CashResultsDisplayProps {
  calculationData: CalculationData;
  cashCount: CashCount;
  electronicPayments: ElectronicPayments;
  expectedSales: number;
  deliveryCalculation?: DeliveryCalculation;
  phaseState?: PhaseState;
  storeName?: string;
  cashierName?: string;
  witnessName?: string;
}

// --- Helper: Display remaining denominations when Phase 2 was skipped ---
function RemainingDenominationsDisplay({ denominations }: { denominations: CashCount }) {
  return <DenominationsList denominations={denominations} />;
}

// --- Helper: Display remaining denominations from Phase 2 ---
function RemainingFromPhase2({
  deliveryCalculation,
  cashCount,
}: { deliveryCalculation?: DeliveryCalculation; cashCount: CashCount }) {
  if (deliveryCalculation?.denominationsToKeep) {
    return <DenominationsList denominations={deliveryCalculation.denominationsToKeep} />;
  }
  // Fallback: calculate $50 change
  const changeResult = calculateChange50(cashCount);
  if (changeResult.possible && changeResult.change) {
    return <DenominationsList denominations={changeResult.change as CashCount} />;
  }
  return (
    <div className="text-center text-warning">
      <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
      <p className="text-xs">No hay suficiente efectivo para cambio de $50.00</p>
    </div>
  );
}

export function CashResultsDisplay({
  calculationData,
  cashCount,
  deliveryCalculation,
  phaseState,
  expectedSales,
  storeName,
  cashierName,
  witnessName,
}: CashResultsDisplayProps) {
  return (
    <>
      {/* Alert for significant shortage */}
      {calculationData.hasAlert && (
        <div className="p-[clamp(0.75rem,3vw,1rem)] rounded-[clamp(0.5rem,2vw,0.75rem)] flex items-start gap-3" style={{
          background: 'rgba(244, 33, 46, 0.1)',
          border: '1px solid rgba(244, 33, 46, 0.3)',
        }}>
          <AlertTriangle className="w-[clamp(1rem,4vw,1.25rem)] h-[clamp(1rem,4vw,1.25rem)] mt-0.5" style={{ color: '#f4212e' }} />
          <div>
            <p className="font-medium text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#f4212e' }}>
              🚨 ALERTA: Faltante significativo detectado (${Math.abs(calculationData.difference).toFixed(2)})
            </p>
            <p className="text-[clamp(0.75rem,3vw,0.875rem)] mt-1" style={{ color: '#8899a6' }}>
              Se enviará notificación automática al administrador.
            </p>
          </div>
        </div>
      )}

      {/* Store and Personnel Info + Calculation Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[clamp(1rem,4vw,1.5rem)]">
        {/* Información de la sucursal y personal */}
        <div className="glass-morphism-panel">
          <h3 className="text-[clamp(1rem,4.5vw,1.25rem)] font-bold mb-[clamp(0.75rem,3vw,1rem)]" style={{ color: '#e1e8ed' }}>
            Información del Corte
          </h3>
          <div className="space-y-[clamp(0.75rem,3vw,1rem)]">
            <div>
              <p className="text-[clamp(0.75rem,3vw,0.875rem)]" style={{ color: '#8899a6' }}>Sucursal</p>
              <p className="text-[clamp(1rem,4vw,1.125rem)] font-semibold" style={{ color: '#e1e8ed' }}>{storeName}</p>
            </div>
            <div className="p-[clamp(0.5rem,2.5vw,0.75rem)] rounded-[clamp(0.375rem,1.5vw,0.5rem)]" style={{
              background: 'rgba(10, 132, 255, 0.1)',
              border: '1px solid rgba(10, 132, 255, 0.3)',
            }}>
              <p className="text-[clamp(0.75rem,3vw,0.875rem)] font-medium mb-1" style={{ color: '#0a84ff' }}>Cajero (Contador)</p>
              <p className="text-[clamp(1rem,4vw,1.125rem)] font-semibold" style={{ color: '#e1e8ed' }}>{cashierName}</p>
            </div>
            <div className="p-[clamp(0.5rem,2.5vw,0.75rem)] rounded-[clamp(0.375rem,1.5vw,0.5rem)]" style={{
              background: 'rgba(94, 92, 230, 0.1)',
              border: '1px solid rgba(94, 92, 230, 0.3)',
            }}>
              <p className="text-[clamp(0.75rem,3vw,0.875rem)] font-medium mb-1" style={{ color: '#5e5ce6' }}>Testigo (Verificador)</p>
              <p className="text-[clamp(1rem,4vw,1.125rem)] font-semibold" style={{ color: '#e1e8ed' }}>{witnessName}</p>
            </div>
          </div>
        </div>

        {/* Totales Calculados */}
        <div className="glass-morphism-panel">
          <h3 className="text-[clamp(1rem,4.5vw,1.25rem)] font-bold mb-[clamp(0.75rem,3vw,1rem)]" style={{ color: '#e1e8ed' }}>
            Totales Calculados
          </h3>
          <div className="space-y-[clamp(0.75rem,3vw,1rem)]">
            <div className="flex justify-between">
              <span className="text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#8899a6' }}>Efectivo Contado:</span>
              <span className="font-bold text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#e1e8ed' }}>
                {formatCurrency(calculationData.totalCash)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[clamp(0.75rem,3vw,0.875rem)]" style={{ color: '#8899a6' }}>  (Incluye fondo $50)</span>
              <span className="text-[clamp(0.75rem,3vw,0.875rem)]" style={{ color: '#8899a6' }}>-$50.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#8899a6' }}>Efectivo Ventas:</span>
              <span className="font-bold text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#e1e8ed' }}>
                {formatCurrency(calculationData.salesCash)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#8899a6' }}>Electrónico:</span>
              <span className="font-bold text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#e1e8ed' }}>
                {formatCurrency(calculationData.totalElectronic)}
              </span>
            </div>
            <div className="border-t border-gray-700 pt-3">
              <div className="flex justify-between text-[clamp(1rem,4vw,1.125rem)] font-bold">
                <span style={{ color: '#8899a6' }}>Total Ventas:</span>
                <span style={{ color: '#0a84ff' }}>{formatCurrency(calculationData.totalGeneral)}</span>
              </div>
            </div>
            {(calculationData.totalExpenses || 0) > 0 && (
              <div className="flex justify-between">
                <span className="text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#8899a6' }}>Gastos:</span>
                <span className="font-bold text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#ff9f0a' }}>
                  +{formatCurrency(calculationData.totalExpenses)}
                </span>
              </div>
            )}
            {(calculationData.totalExpenses || 0) > 0 && (
              <div className="flex justify-between">
                <span className="text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#8899a6' }}>Ventas + Gastos:</span>
                <span className="font-bold text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#e1e8ed' }}>
                  {formatCurrency(calculationData.totalWithExpenses)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#8899a6' }}>SICAR Entradas:</span>
              <span className="text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#8899a6' }}>
                {formatCurrency(expectedSales)}
              </span>
            </div>
            <div className="flex justify-between text-[clamp(1rem,4vw,1.125rem)] font-bold">
              <span style={{ color: '#8899a6' }}>
                {(calculationData.difference || 0) >= 0 ? 'Sobrante:' : 'Faltante:'}
              </span>
              <span style={{ color: (calculationData.difference || 0) >= 0 ? '#00ba7c' : '#f4212e' }}>
                {formatCurrency(Math.abs(calculationData.difference))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Deliveries COD Section */}
      <div className="glass-morphism-panel">
        <h3 className="text-[clamp(1rem,4.5vw,1.25rem)] font-bold mb-[clamp(0.75rem,3vw,1rem)]" style={{ color: '#e1e8ed' }}>
          📦 Deliveries Pendientes (COD)
        </h3>
        <p className="text-[clamp(0.75rem,3vw,0.875rem)] mb-2" style={{ color: '#8899a6' }}>
          Gestiona entregas pendientes que deben restarse del efectivo esperado
        </p>
        {/* 🤖 [IA] - D-01 GREEN: Nota explícita ajuste SICAR automático por deliveries COD */}
        <p
          data-testid="delivery-sicar-note"
          className="text-[clamp(0.7rem,2.8vw,0.8rem)] mb-[clamp(1rem,4vw,1.5rem)] px-2 py-1 rounded"
          style={{ color: '#00ba7c', background: 'rgba(0,186,124,0.08)' }}
        >
          Los deliveries COD registrados aquí ajustan el SICAR automáticamente al calcular la diferencia del corte.
        </p>
        <DeliveryManager />
      </div>

      {/* Cambio para Mañana */}
      <div className="glass-morphism-panel">
        <h3 className="text-[clamp(1rem,4.5vw,1.25rem)] font-bold mb-[clamp(0.75rem,3vw,1rem)]" style={{ color: '#e1e8ed' }}>
          Cambio para Mañana
        </h3>
        <div className="space-y-[clamp(0.75rem,3vw,1rem)]">
          <div className="text-center">
            <div className="text-[clamp(1.5rem,7vw,2rem)] font-bold mb-2" style={{ color: '#00ba7c' }}>$50.00</div>
            <p className="text-[clamp(0.75rem,3vw,0.875rem)]" style={{ color: '#8899a6' }}>Cambio calculado</p>
          </div>
          <div className="p-[clamp(0.75rem,3vw,1rem)] rounded-[clamp(0.5rem,2vw,0.75rem)]" style={{
            background: 'rgba(0, 186, 124, 0.1)',
            border: '1px solid rgba(0, 186, 124, 0.3)',
          }}>
            <p className="text-[clamp(0.75rem,3vw,0.875rem)] font-medium mb-3" style={{ color: '#00ba7c' }}>
              Detalle del cambio:
            </p>
            <div className="space-y-2">
              {phaseState?.shouldSkipPhase2 ? (
                <div className="space-y-1">
                  <RemainingDenominationsDisplay denominations={cashCount} />
                </div>
              ) : (
                <div className="space-y-1">
                  <RemainingFromPhase2 deliveryCalculation={deliveryCalculation} cashCount={cashCount} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
