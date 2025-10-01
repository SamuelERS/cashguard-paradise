/**
 * 🤖 [IA] - DenominationsList Component - v1.0.0
 * Extraído de CashCalculation.tsx para eliminar código duplicado
 * 
 * @description
 * Componente reutilizable para mostrar lista de denominaciones (monedas y billetes)
 * con cantidades, subtotales y total. Usado en reportes de corte de caja.
 */
import { CashCount } from "@/types/cash";
import { calculateCashTotal, formatCurrency } from "@/utils/calculations";

interface DenominationsListProps {
  denominations: CashCount;
  showTotal?: boolean;
  totalLabel?: string;
  variant?: 'success' | 'info' | 'warning';
}

/**
 * Definición de todas las denominaciones disponibles
 */
const DENOMINATIONS_CONFIG = [
  { key: 'penny' as keyof CashCount, label: '1¢ centavo', value: 0.01 },
  { key: 'nickel' as keyof CashCount, label: '5¢ centavos', value: 0.05 },
  { key: 'dime' as keyof CashCount, label: '10¢ centavos', value: 0.10 },
  { key: 'quarter' as keyof CashCount, label: '25¢ centavos', value: 0.25 },
  { key: 'dollarCoin' as keyof CashCount, label: '$1 moneda', value: 1.00 },
  { key: 'bill1' as keyof CashCount, label: '$1', value: 1.00 },
  { key: 'bill5' as keyof CashCount, label: '$5', value: 5.00 },
  { key: 'bill10' as keyof CashCount, label: '$10', value: 10.00 },
  { key: 'bill20' as keyof CashCount, label: '$20', value: 20.00 },
  { key: 'bill50' as keyof CashCount, label: '$50', value: 50.00 },
  { key: 'bill100' as keyof CashCount, label: '$100', value: 100.00 },
];

/**
 * Componente que renderiza una lista de denominaciones con cantidades y totales
 */
export function DenominationsList({
  denominations,
  showTotal = true,
  totalLabel = 'Total en caja:',
  variant = 'success',
}: DenominationsListProps) {
  
  // Filtrar solo denominaciones con cantidad > 0
  const items = DENOMINATIONS_CONFIG
    .filter(d => denominations[d.key] > 0)
    .map(d => {
      const quantity = denominations[d.key] || 0;
      const subtotal = quantity * d.value;
      
      return (
        <div 
          key={d.key} 
          className={`flex justify-between text-sm bg-${variant}/5 rounded px-3 py-1.5`}
        >
          <span className="font-medium">{d.label}</span>
          <span className="font-semibold">
            × {quantity} = {formatCurrency(subtotal)}
          </span>
        </div>
      );
    });

  // Calcular total
  const total = calculateCashTotal(denominations);

  // Si no hay items, no renderizar nada
  if (items.length === 0) {
    return null;
  }

  return (
    <>
      {items}
      {showTotal && (
        <>
          <div className={`border-t border-${variant}/30 my-2`}></div>
          <div className={`flex justify-between text-sm font-bold text-${variant} px-3`}>
            <span>{totalLabel}</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </>
      )}
    </>
  );
}
