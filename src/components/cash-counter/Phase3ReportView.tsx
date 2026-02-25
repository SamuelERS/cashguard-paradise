/**
 * 🤖 [IA] - v1.4.1: Phase3ReportView Component
 * Extraído de CashCounter.tsx para desmonolitización
 *
 * @description
 * Vista de reporte final (Phase 3). Renderiza MorningVerification o CashCalculation
 * según el modo de operación.
 */
import CashCalculation from "@/components/CashCalculation";
import { MorningVerification } from "@/components/morning-count/MorningVerification";
import type { CashCount, ElectronicPayments } from "@/types/cash";
import type { DailyExpense } from "@/types/expenses";
import type { DeliveryCalculation, PhaseState } from "@/types/phases";

interface Phase3ReportViewProps {
  isMorningCount: boolean;
  selectedStore: string;
  selectedCashier: string;
  selectedWitness: string;
  selectedStoreName?: string;
  selectedCashierName?: string;
  selectedWitnessName?: string;
  expectedSales: string;
  cashCount: CashCount;
  electronicPayments: ElectronicPayments;
  dailyExpenses: DailyExpense[];
  deliveryCalculation: DeliveryCalculation | null;
  phaseState: PhaseState;
  onFinalizarCorte?: (
    reporteHash: string,
    datosReporte?: Record<string, unknown>,
  ) => Promise<void>;
  onComplete: () => void;
  onBack: () => void;
}

export function Phase3ReportView({
  isMorningCount,
  selectedStore,
  selectedCashier,
  selectedWitness,
  selectedStoreName,
  selectedCashierName,
  selectedWitnessName,
  expectedSales,
  cashCount,
  electronicPayments,
  dailyExpenses,
  deliveryCalculation,
  phaseState,
  onFinalizarCorte,
  onComplete,
  onBack,
}: Phase3ReportViewProps) {
  // 🤖 [IA] - v1.0.84: Use appropriate component based on operation mode
  if (isMorningCount) {
    return (
      <MorningVerification
        storeId={selectedStore}
        cashierId={selectedCashier}
        witnessId={selectedWitness}
        storeName={selectedStoreName}
        cashierName={selectedCashierName}
        witnessName={selectedWitnessName}
        cashCount={cashCount}
        onComplete={onComplete}
        onBack={onBack}
      />
    );
  }

  // 🚨 FIX: Validar deliveryCalculation antes de renderizar reporte final
  if (!deliveryCalculation) {
    return null;
  }

  return (
    <CashCalculation
      storeId={selectedStore}
      cashierId={selectedCashier}
      witnessId={selectedWitness}
      storeName={selectedStoreName}
      cashierName={selectedCashierName}
      witnessName={selectedWitnessName}
      expectedSales={parseFloat(expectedSales)}
      cashCount={cashCount}
      electronicPayments={electronicPayments}
      expenses={dailyExpenses}
      deliveryCalculation={deliveryCalculation}
      phaseState={phaseState}
      onFinalizeReport={onFinalizarCorte}
      onComplete={onComplete}
      onBack={onBack}
    />
  );
}
