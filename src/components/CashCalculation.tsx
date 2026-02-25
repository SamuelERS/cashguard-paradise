// 🤖 [IA] - v3.0: VERSION 3.0 DELIVERY CONTROL - FASE 3 Integración DeliveryManager
// Desmonolitado: generate-evening-report.ts (reporte) + CashResultsDisplay.tsx (JSX resultados)
// Previous: v1.3.7 - ANTI-FRAUDE - Confirmación explícita envío WhatsApp ANTES de revelar resultados
import { useState, useEffect, useCallback } from "react";
// 🤖 [IA] - v1.3.6Z: Framer Motion removido (GPU compositing bug iOS Safari causa pantalla congelada Phase 3)
import { Calculator, AlertTriangle, CheckCircle, Share, Lock } from "lucide-react";
// 🤖 [IA] - FAE-02: PURGA QUIRÚRGICA COMPLETADA - CSS imports eliminados
// Los 1 archivos CSS están ahora importados globalmente vía index.css:
// - report-action-button.css
import { Badge } from "@/components/ui/badge";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";
// 🤖 [IA] - Reactivar NeutralActionButton + Copy icon si se necesita botón manual de copia
import { ConstructiveActionButton } from '@/components/shared/ConstructiveActionButton';
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { WhatsAppInstructionsModal } from '@/components/shared/WhatsAppInstructionsModal';
import { calculateCashTotal, calculateChange50 } from "@/utils/calculations";
import { calculateSicarAdjusted } from "@/utils/sicarAdjustment";
import { copyToClipboard } from "@/utils/clipboard";
import { toast } from "sonner";
import { generarReporteHash } from '@/lib/corte-report-hash';
import type { CashCount, ElectronicPayments } from "@/types/cash";
import type { PhaseState, DeliveryCalculation } from "@/types/phases";
import type { DailyExpense } from '@/types/expenses';
import { useDeliveries } from "@/hooks/useDeliveries";
// 🤖 [IA] - Desmonolitado: Tipos e interfaces movidos a generate-evening-report.ts
import type { CalculationData } from '@/utils/generate-evening-report';
import { generateCompleteReport as generateCompleteReportFn, generatePrintableHTML } from '@/utils/generate-evening-report';
// 🤖 [IA] - Desmonolitado: JSX de resultados extraído a CashResultsDisplay.tsx
import { CashResultsDisplay } from '@/components/cash-calculation/CashResultsDisplay';

interface CashCalculationProps {
  storeId: string;
  cashierId: string;
  witnessId: string;
  expectedSales: number;
  cashCount: CashCount;
  electronicPayments: ElectronicPayments;
  storeName?: string;
  cashierName?: string;
  witnessName?: string;
  expenses?: DailyExpense[];
  deliveryCalculation?: DeliveryCalculation;
  phaseState?: PhaseState;
  onFinalizeReport?: (
    reporteHash: string,
    datosReporte?: Record<string, unknown>,
  ) => Promise<void>;
  onBack: () => void;
  onComplete: () => void;
}

const CashCalculation = ({
  storeId,
  cashierId,
  witnessId,
  expectedSales,
  cashCount,
  electronicPayments,
  storeName,
  cashierName,
  witnessName,
  expenses = [],
  deliveryCalculation,
  phaseState,
  onFinalizeReport,
  onBack,
  onComplete
}: CashCalculationProps) => {
  const [isCalculated, setIsCalculated] = useState(false);
  const [calculationData, setCalculationData] = useState<CalculationData | null>(null);
  const [showFinishConfirmation, setShowFinishConfirmation] = useState(false);

  // 🤖 [IA] - v1.3.7: Estados confirmación explícita WhatsApp (Propuesta C Híbrida v2.1)
  const [reportSent, setReportSent] = useState(false);
  const [whatsappOpened, setWhatsappOpened] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const [showWhatsAppInstructions, setShowWhatsAppInstructions] = useState(false);

  // 🤖 [IA] - v3.0 FASE 4: Hook para acceder a deliveries pendientes
  const { pending: pendingDeliveries } = useDeliveries();

  // 🤖 [IA] - v1.3.6Z: FIX iOS Safari - Cleanup defensivo de modal state
  useEffect(() => {
    return () => {
      setShowFinishConfirmation(false);
    };
  }, []);

  const displayStoreName = storeName?.trim() || storeId;
  const displayCashierName = cashierName?.trim() || cashierId;
  const displayWitnessName = witnessName?.trim() || witnessId;

  const performCalculation = useCallback(() => {
    const totalCash = calculateCashTotal(cashCount);
    const totalElectronic = Object.values(electronicPayments).reduce((sum, val) => sum + val, 0);

    // 🤖 [IA] - v2.4.2: FIX CRÍTICO - Restar fondo de $50 del efectivo para obtener ventas reales
    const CHANGE_FUND = 50.00;
    const salesCash = totalCash - CHANGE_FUND;
    const totalGeneral = salesCash + totalElectronic;

    // 🤖 [IA] - v1.4.0 FASE 5: Calcular total gastos
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // 🤖 [IA] - v2.4.2: Total con gastos = ventas + gastos (para comparar con SICAR Entradas)
    const totalWithExpenses = totalGeneral + totalExpenses;

    // 🤖 [IA] - v3.0 FASE 4: Ajustar SICAR restando deliveries pendientes
    const sicarAdjustment = calculateSicarAdjusted(expectedSales, pendingDeliveries);
    const difference = totalWithExpenses - sicarAdjustment.adjustedExpected;

    const changeResult = calculateChange50(cashCount);

    const data: CalculationData = {
      totalCash,
      totalElectronic,
      salesCash,
      totalGeneral,
      totalExpenses,
      totalWithExpenses,
      difference,
      changeResult,
      hasAlert: difference < -3.00,
      timestamp: new Date().toLocaleString('es-SV', {
        timeZone: 'America/El_Salvador',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };

    setCalculationData(data);
  }, [cashCount, electronicPayments, expectedSales, expenses, pendingDeliveries]);

  useEffect(() => {
    if (!isCalculated) {
      performCalculation();
    }
  }, [isCalculated, performCalculation]);

  // 🤖 [IA] - Desmonolitado: Wrapper delegando a función pura en generate-evening-report.ts
  const generateCompleteReport = useCallback(() => {
    if (!calculationData) throw new Error('calculationData not ready');
    return generateCompleteReportFn({
      calculationData,
      cashCount,
      electronicPayments,
      expectedSales,
      deliveryCalculation,
      phaseState,
      storeId,
      cashierId,
      witnessId,
      storeName: displayStoreName,
      cashierName: displayCashierName,
      witnessName: displayWitnessName,
      expenses,
      pendingDeliveries,
    });
  }, [calculationData, cashCount, electronicPayments, expectedSales, deliveryCalculation,
      phaseState, storeId, cashierId, witnessId, displayStoreName, displayCashierName, displayWitnessName, expenses, pendingDeliveries]);

  // 🤖 [IA] - v2.4.1: Handler inteligente con detección de plataforma + copia automática
  const handleWhatsAppSend = useCallback(async () => {
    try {
      if (!calculationData) {
        toast.error("❌ Error", {
          description: "Faltan datos necesarios para generar el reporte"
        });
        return;
      }

      const report = generateCompleteReport();
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      // 🎯 PASO 1: Copiar automáticamente al portapapeles
      try {
        await navigator.clipboard.writeText(report);
      } catch {
        // Fallback si clipboard API falla
        const textArea = document.createElement('textarea');
        textArea.value = report;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      // 🎯 PASO 2: Comportamiento según plataforma
      if (isMobile) {
        const encodedReport = encodeURIComponent(report);
        window.location.href = `whatsapp://send?text=${encodedReport}`;

        setWhatsappOpened(true);
        toast.success('📱 WhatsApp abierto con reporte copiado', {
          description: 'Si no se abrió, pegue el reporte manualmente',
          duration: 8000
        });
      } else {
        // DESKTOP: Abrir modal de instrucciones inmediatamente
        setWhatsappOpened(true);
        setShowWhatsAppInstructions(true);
      }

    } catch (error) {
      toast.error("❌ Error al procesar reporte", {
        description: error instanceof Error ? error.message : "Error desconocido"
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calculationData, reportSent]);

  // 🤖 [IA] - v1.3.7: Handler confirmación explícita usuario
  const handleConfirmSent = useCallback(() => {
    setReportSent(true);
    setWhatsappOpened(false);
    toast.success('✅ Reporte confirmado como enviado');
  }, []);

  // 🤖 [IA] - Desmonolitado: HTML delegado a generatePrintableHTML en generate-evening-report.ts
  const generatePrintableReport = () => {
    try {
      const report = generateCompleteReport();
      const html = generatePrintableHTML(report, displayStoreName);
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        toast.success("📄 Reporte generado", {
          description: "Imprimiendo automáticamente..."
        });
      }
    } catch (error) {
      toast.error("❌ Error al generar reporte", {
        description: error instanceof Error ? error.message : "Error desconocido"
      });
    }
  };

  // 🤖 [IA] - v1.1.09: Función mejorada con fallback robusto
  const handleCopyToClipboard = useCallback(async () => {
    try {
      const report = generateCompleteReport();
      const result = await copyToClipboard(report);

      if (result.success) {
        toast.success("💾 Copiado al portapapeles", {
          description: "El reporte ha sido copiado exitosamente"
        });
      } else {
        toast.error("❌ Error al copiar", {
          description: result.error || "No se pudo copiar al portapapeles. Intente de nuevo."
        });
      }
    } catch (error) {
      toast.error("❌ Error al generar reporte", {
        description: error instanceof Error ? error.message : "Error desconocido"
      });
    }
  }, [generateCompleteReport]);

  if (!calculationData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Calculator className="w-[clamp(2.5rem,8vw,3.5rem)] h-[clamp(2.5rem,8vw,3.5rem)] text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground text-[clamp(0.875rem,3.5vw,1rem)]">Calculando totales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cash-calculation-container min-h-screen relative overflow-y-auto" data-scrollable="true">

      <div className="relative z-10 container mx-auto px-[clamp(1rem,4vw,1.5rem)] py-[clamp(1.5rem,6vw,2rem)] max-w-4xl">
        {/* 🤖 [IA] - v1.3.6Z: FIX iOS Safari - div estático (sin motion.div) */}
        <div
          className="space-y-[clamp(1rem,4vw,1.5rem)]"
        >
          {/* 🤖 [IA] - v1.3.7: Header siempre visible */}
          <div className="text-center mb-[clamp(1.5rem,6vw,2rem)]">
            <h2 className="text-[clamp(1.25rem,5vw,1.75rem)] font-bold text-primary mb-2">Cálculo Completado</h2>
            <p className="text-muted-foreground text-[clamp(0.875rem,3.5vw,1rem)]">Resultados del corte de caja</p>
            <Badge variant="outline" className="mt-2 border-primary text-primary text-[clamp(0.75rem,3vw,0.875rem)]">
              {calculationData?.timestamp || ''}
            </Badge>
          </div>

          {/* 🤖 [IA] - v1.3.7: RENDERIZADO CONDICIONAL - Resultados bloqueados hasta confirmación */}
          {!reportSent ? (
            <div style={{
              background: 'var(--glass-bg-primary)',
              backdropFilter: `blur(clamp(12px, 4vw, 20px))`,
              WebkitBackdropFilter: `blur(clamp(12px, 4vw, 20px))`,
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: `clamp(8px, 3vw, 16px)`,
              padding: `clamp(3rem, 8vw, 4rem)`,
              textAlign: 'center'
            }}>
              <Lock className="w-[clamp(3rem,12vw,4rem)] h-[clamp(3rem,12vw,4rem)] mx-auto mb-[clamp(1rem,4vw,1.5rem)]" style={{ color: '#ff9f0a' }} />
              <h3 className="text-[clamp(1rem,4.5vw,1.25rem)] font-bold mb-2" style={{ color: '#e1e8ed' }}>
                🔒 Resultados Bloqueados
              </h3>
              <p className="text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#8899a6' }}>
                Los resultados del corte se revelarán después de enviar el reporte por WhatsApp.
                Esto garantiza la trazabilidad completa de todos los cortes realizados.
              </p>
            </div>
          ) : (
            // 🤖 [IA] - Desmonolitado: JSX resultados extraído a CashResultsDisplay.tsx (Mandamiento #1)
            <CashResultsDisplay
              calculationData={calculationData}
              cashCount={cashCount}
              electronicPayments={electronicPayments}
              expectedSales={expectedSales}
              deliveryCalculation={deliveryCalculation}
              phaseState={phaseState}
              storeName={displayStoreName}
              cashierName={displayCashierName}
              witnessName={displayWitnessName}
            />
          )}

          {/* 🤖 [IA] - v1.3.7: ANTI-FRAUDE - Bloque de acción SIEMPRE visible */}
          <div style={{
            background: 'var(--glass-bg-primary)',
            backdropFilter: `blur(clamp(12px, 4vw, 20px))`,
            WebkitBackdropFilter: `blur(clamp(12px, 4vw, 20px))`,
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: `clamp(8px, 3vw, 16px)`,
            padding: `clamp(1.5rem, 6vw, 2rem)`,
            marginBottom: `clamp(1rem, 4vw, 1.5rem)`
          }}>
            <div className="text-center">
              <CheckCircle className="w-[clamp(3rem,12vw,4rem)] h-[clamp(3rem,12vw,4rem)] mx-auto mb-[clamp(0.75rem,3vw,1rem)]" style={{ color: '#00ba7c' }} />
              <h3 className="text-[clamp(1rem,4.5vw,1.25rem)] font-bold mb-2" style={{ color: '#00ba7c' }}>
                Corte de Caja Completado
              </h3>
              <p className="mb-[clamp(1rem,4vw,1.5rem)] text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#8899a6' }}>
                Los datos han sido calculados y están listos para generar el reporte.
                {!reportSent && ' Debe enviar el reporte para continuar.'}
              </p>

              {/* 🤖 [IA] - v2.4.1: Grid adaptativo */}
              {/* Reactivar botón Copiar: importar NeutralActionButton + Copy icon, descomentar bloque */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[clamp(0.5rem,2vw,0.75rem)] lg:max-w-2xl mx-auto">
                <ConstructiveActionButton
                  onClick={handleWhatsAppSend}
                  disabled={false}
                  aria-label="Enviar reporte por WhatsApp"
                >
                  <Share />
                  {reportSent ? '✅ Reporte Enviado' : whatsappOpened ? 'Reenviar WhatsApp' : 'Enviar WhatsApp'}
                </ConstructiveActionButton>

                <PrimaryActionButton
                  onClick={() => setShowFinishConfirmation(true)}
                  disabled={!reportSent}
                  aria-label="Finalizar proceso"
                  className="h-fluid-3xl min-h-[var(--instruction-fluid-3xl)]"
                >
                  <CheckCircle />
                  Finalizar
                </PrimaryActionButton>
              </div>
            </div>
          </div>

          {/* 🤖 [IA] - v1.3.7: Banner advertencia inicial si NO enviado */}
          {!reportSent && !whatsappOpened && !popupBlocked && (
            <div className="p-[clamp(0.75rem,3vw,1rem)] rounded-[clamp(0.5rem,2vw,0.75rem)] mb-[clamp(1rem,4vw,1.5rem)] flex items-start gap-3" style={{
              background: 'rgba(255, 159, 10, 0.1)',
              border: '1px solid rgba(255, 159, 10, 0.3)'
            }}>
              <AlertTriangle className="w-[clamp(1rem,4vw,1.25rem)] h-[clamp(1rem,4vw,1.25rem)] mt-0.5" style={{ color: '#ff9f0a' }} />
              <div>
                <p className="font-medium text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#ff9f0a' }}>
                  ⚠️ DEBE ENVIAR REPORTE PARA CONTINUAR
                </p>
                <p className="text-[clamp(0.75rem,3vw,0.875rem)] mt-1" style={{ color: '#8899a6' }}>
                  Los resultados se revelarán después de enviar el reporte por WhatsApp.
                </p>
              </div>
            </div>
          )}

          {/* 🤖 [IA] - v2.4.1: Banner pop-up bloqueado */}
          {popupBlocked && !reportSent && (
            <div className="p-[clamp(0.75rem,3vw,1rem)] rounded-[clamp(0.5rem,2vw,0.75rem)] mb-[clamp(1rem,4vw,1.5rem)] flex items-start gap-3" style={{
              background: 'rgba(255, 69, 58, 0.1)',
              border: '1px solid rgba(255, 69, 58, 0.3)'
            }}>
              <AlertTriangle className="w-[clamp(1rem,4vw,1.25rem)] h-[clamp(1rem,4vw,1.25rem)] mt-0.5" style={{ color: '#ff453a' }} />
              <div>
                <p className="font-medium text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#ff453a' }}>
                  🚫 Pop-ups Bloqueados
                </p>
                <p className="text-[clamp(0.75rem,3vw,0.875rem)] mt-1" style={{ color: '#8899a6' }}>
                  Su navegador bloqueó la apertura de WhatsApp. El reporte ya está copiado - vaya a WhatsApp Web y péguelo manualmente.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 🤖 [IA] - v1.2.24: Modal de confirmación para finalizar el proceso */}
      <ConfirmationModal
        open={showFinishConfirmation}
        onOpenChange={setShowFinishConfirmation}
        title="Finalizar Proceso"
        description="Se cerrará el proceso de conteo de efectivo"
        warningText="Esta acción no se puede deshacer"
        confirmText="Sí, Finalizar"
        cancelText="Continuar"
        onConfirm={() => {
          void (async () => {
            try {
              if (onFinalizeReport) {
                const reportPayload = {
                  report: generateCompleteReport(),
                  metadata: {
                    storeId,
                    cashierId,
                    witnessId,
                    expectedSales,
                    timestamp: calculationData.timestamp,
                  },
                  totals: calculationData,
                  phase: {
                    currentPhase: phaseState?.currentPhase ?? 3,
                    shouldSkipPhase2: phaseState?.shouldSkipPhase2 ?? false,
                  },
                };
                const reportHash = await generarReporteHash(reportPayload);
                if (!reportHash.trim()) {
                  throw new Error('No se pudo generar hash de reporte');
                }
                const sicarAdjustment = calculateSicarAdjusted(expectedSales, pendingDeliveries);
                const datosReporte: Record<string, unknown> = {
                  total_cash: calculationData.totalCash,
                  total_electronic: calculationData.totalElectronic,
                  sales_cash: calculationData.salesCash,
                  total_general: calculationData.totalGeneral,
                  total_expenses: calculationData.totalExpenses,
                  total_with_expenses: calculationData.totalWithExpenses,
                  expected_sales_original: sicarAdjustment.originalExpected,
                  expected_sales_adjusted: sicarAdjustment.adjustedExpected,
                  pending_deliveries_total: sicarAdjustment.totalPendingDeliveries,
                  pending_deliveries_count: sicarAdjustment.pendingDeliveriesCount,
                  difference: calculationData.difference,
                  generated_at: new Date().toISOString(),
                };
                await onFinalizeReport(reportHash, datosReporte);
              }

              setShowFinishConfirmation(false);
              onComplete();
            } catch (error) {
              toast.error('❌ Error al finalizar corte', {
                description: error instanceof Error ? error.message : 'No se pudo cerrar el corte en Supabase',
              });
            }
          })();
        }}
        onCancel={() => setShowFinishConfirmation(false)}
      />

      {/* 🤖 [IA] - DRY: Modal compartido WhatsApp */}
      <WhatsAppInstructionsModal
        isOpen={showWhatsAppInstructions}
        onOpenChange={setShowWhatsAppInstructions}
        onConfirmSent={handleConfirmSent}
      />
    </div>
  );
};

export default CashCalculation;
