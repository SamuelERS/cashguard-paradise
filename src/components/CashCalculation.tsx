// 🤖 [IA] - v2.8.3: Hook useWhatsAppIntegration extraído (Auditoría "Cimientos de Cristal" Phase 2B Part 2)
// - Estados y handlers de WhatsApp movidos a src/hooks/useWhatsAppIntegration.ts
// - Componente reducido de ~1,000 líneas a ~850 líneas (-15%)
// Previous: v2.8.2 - Funciones puras extraídas a alerts.ts y whatsapp-report.ts
import { useState, useEffect, useCallback } from "react";
// 🤖 [IA] - v1.3.6Z: Framer Motion removido (GPU compositing bug iOS Safari causa pantalla congelada Phase 3)
// 🤖 [IA] - v1.3.7: Agregado Lock icon para bloqueo de resultados
// 🤖 [IA] - v2.4.1: Agregado MessageSquare para modal de instrucciones WhatsApp
import { Calculator, AlertTriangle, CheckCircle, Share, Download, Copy, Lock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
// 🤖 [IA] - v1.1.08: Removidos Card components para coherencia con glass morphism
// 🤖 [IA] - v1.1.08: Alert components removidos para coherencia con glass morphism
// 🤖 [IA] - FAE-02: PURGA QUIRÚRGICA COMPLETADA - CSS imports eliminados
// Los 1 archivos CSS están ahora importados globalmente vía index.css:
// - report-action-button.css
import { Badge } from "@/components/ui/badge";
import { PrimaryActionButton } from "@/components/ui/primary-action-button"; // 🤖 [IA] - v2.0.0: Botón de acción primaria estándar
import { NeutralActionButton } from "@/components/ui/neutral-action-button"; // 🤖 [IA] - v2.0.0: Botón de acción neutral estándar
import { ConstructiveActionButton } from '@/components/shared/ConstructiveActionButton'; // 🤖 [IA] - v2.0.0: Botón de acción constructiva estándar
import { ConfirmationModal } from "@/components/ui/confirmation-modal"; // 🤖 [IA] - v1.2.24: Modal de confirmación para Finalizar
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"; // 🤖 [IA] - v2.4.1: Modal de instrucciones WhatsApp
import { calculateCashTotal, calculateChange50, formatCurrency, generateDenominationSummary } from "@/utils/calculations";
// 🤖 [IA] - v2.8.3: copyToClipboard ahora se usa dentro de useWhatsAppIntegration
import { toast } from "sonner"; // 🤖 [IA] - v1.1.15 - Migrated to Sonner for consistency
import { CashCount, ElectronicPayments } from "@/types/cash";
import { PhaseState, DeliveryCalculation } from "@/types/phases";
// 🤖 [IA] - v1.3.6: MÓDULO 3 - Import tipos para sección anomalías
import type { VerificationBehavior, VerificationAttempt } from "@/types/verification";
// 🤖 [IA] - v1.4.0 FASE 5: Import tipos y constantes para gastos
import { DailyExpense } from '@/types/expenses';
import { getStoreById, getEmployeeById } from "@/data/paradise";
// 🤖 [IA] - v2.8.2: Imports de módulos extraídos (Auditoría "Cimientos de Cristal")
import {
  generateCompleteReport as generateWhatsAppReport,
  generateDataHash,
  generateDenominationDetails,
  generateDeliveryChecklistSection,
  generateRemainingChecklistSection,
  generateExpensesSection,
  type WhatsAppReportData,
  type ReportCalculationData
} from '@/utils/reports/whatsapp-report';
import {
  generateCriticalAlertsBlock,
  generateWarningAlertsBlock
} from '@/utils/reports/alerts';
import { DenominationsList } from "@/components/cash-calculation/DenominationsList"; // 🤖 [IA] - v1.0.0: Componente extraído
import { useWhatsAppIntegration } from "@/hooks/useWhatsAppIntegration"; // 🤖 [IA] - v2.8.3: Hook de integración WhatsApp

// 🤖 [IA] - v2.4.2: TypeScript interface actualizada con nueva lógica de ventas
interface CalculationData {
  totalCash: number; // Efectivo total contado (incluye fondo $50)
  totalElectronic: number; // Pagos electrónicos
  salesCash: number; // 🤖 [IA] - v2.4.2: Efectivo de ventas (totalCash - $50 fondo)
  totalGeneral: number; // 🤖 [IA] - v2.4.2: Total ventas (salesCash + electronic)
  totalExpenses: number; // 🤖 [IA] - v1.4.0 FASE 5: Total gastos
  totalWithExpenses: number; // 🤖 [IA] - v2.4.2: Ventas + Gastos (para comparar con SICAR Entradas)
  totalAdjusted?: number; // 🤖 [IA] - v2.4.2: DEPRECATED - Mantener para compatibilidad
  difference: number;
  changeResult: {
    change: Partial<CashCount>;
    total: number;
    possible: boolean;
  };
  hasAlert: boolean;
  timestamp: string;
}

// 🤖 [IA] - v1.2.22: Type for delivery steps  
type DeliveryStep = {
  key: keyof CashCount;
  quantity: number;
  label: string;
  value: number;
};

interface CashCalculationProps {
  storeId: string;
  cashierId: string;
  witnessId: string;
  expectedSales: number;
  cashCount: CashCount;
  electronicPayments: ElectronicPayments;
  expenses?: DailyExpense[]; // 🤖 [IA] - v1.4.0 FASE 5: Gastos del día
  deliveryCalculation?: DeliveryCalculation;
  phaseState?: PhaseState;
  onBack: () => void;
  onComplete: () => void;
}

// 🤖 [IA] - v2.4.1b: Separador optimizado 12 caracteres (más corto para WhatsApp mobile)
const WHATSAPP_SEPARATOR = '━━━━━━━━━━━━'; // 12 caracteres (reducido desde 16)

const CashCalculation = ({
  storeId,
  cashierId,
  witnessId,
  expectedSales,
  cashCount,
  electronicPayments,
  expenses = [], // 🤖 [IA] - v1.4.0 FASE 5: Default array vacío
  deliveryCalculation,
  phaseState,
  onBack,
  onComplete
}: CashCalculationProps) => {
  const [isCalculated, setIsCalculated] = useState(false);
  const [calculationData, setCalculationData] = useState<CalculationData | null>(null); // 🤖 [IA] - v1.2.22: Fixed any type violation
  const [showFinishConfirmation, setShowFinishConfirmation] = useState(false); // 🤖 [IA] - v1.2.24: Estado para modal de confirmación

  // 🤖 [IA] - v2.8.3: Estados y handlers de WhatsApp movidos a useWhatsAppIntegration
  // Los estados reportSent, whatsappOpened, popupBlocked, showWhatsAppInstructions
  // ahora se manejan a través del hook (ver uso más abajo)

  // 🤖 [IA] - v1.3.6Z: FIX iOS Safari - Cleanup defensivo de modal state
  // Garantiza que modal state se resetea al desmontar, previene race conditions en lifecycle iOS
  useEffect(() => {
    return () => {
      setShowFinishConfirmation(false);
    };
  }, []);

  const store = getStoreById(storeId);
  const cashier = getEmployeeById(cashierId);
  const witness = getEmployeeById(witnessId);

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
    
    // 🤖 [IA] - v2.4.2: Diferencia = (Ventas + Gastos) - SICAR Entradas
    const difference = totalWithExpenses - expectedSales;
    
    const changeResult = calculateChange50(cashCount);
    
    const data = {
      totalCash,
      totalElectronic,
      salesCash, // 🤖 [IA] - v2.4.2: Efectivo de ventas (sin fondo)
      totalGeneral, // 🤖 [IA] - v2.4.2: Total ventas (sin fondo, sin gastos)
      totalExpenses, // 🤖 [IA] - v1.4.0 FASE 5
      totalWithExpenses, // 🤖 [IA] - v2.4.2: Ventas + Gastos (para comparar con SICAR)
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
    setCalculationData(data);
  }, [cashCount, electronicPayments, expectedSales, expenses]); // 🤖 [IA] - v1.4.0 FASE 5: expenses agregado

  useEffect(() => {
    if (!isCalculated) {
      performCalculation();
    }
  }, [isCalculated, performCalculation]);

  // Security validations before generating reports
  const validatePhaseCompletion = () => {
    // Phase 1: Validate all 13 fields completed
    const phase1Fields = [
      cashCount.penny, cashCount.nickel, cashCount.dime, cashCount.quarter, 
      cashCount.dollarCoin, cashCount.bill1, cashCount.bill5, cashCount.bill10, 
      cashCount.bill20, cashCount.bill50, cashCount.bill100,
      electronicPayments.credomatic, electronicPayments.promerica
    ];
    
    if (phase1Fields.some(field => field === undefined || field === null)) {
      throw new Error("❌ Conteo incompleto - Faltan campos por completar");
    }

    // Phase 2: Validate division is correct (if applicable)
    if (!phaseState?.shouldSkipPhase2 && deliveryCalculation) {
      const totalCash = calculateCashTotal(cashCount);
      const expectedInCash = 50;
      const expectedToDeliver = totalCash - expectedInCash;
      
      if (Math.abs(deliveryCalculation.amountToDeliver - expectedToDeliver) > 0.01) {
        throw new Error("❌ División incorrecta - Los montos no cuadran");
      }
    }

    return true;
  };

  // 🤖 [IA] - v2.8.2: generateDataHash y generateDenominationDetails movidos a whatsapp-report.ts

  // Generate display for remaining denominations when Phase 2 was skipped
  // 🤖 [IA] - v1.0.0: Refactorizado para usar componente reutilizable
  const generateRemainingDenominationsDisplay = (remainingCash: CashCount) => {
    return <DenominationsList denominations={remainingCash} />;
  };

  // 🤖 [IA] - v1.0.0: Refactorizado para usar componente reutilizable
  const generateRemainingDenominationsFromPhase2 = () => {
    if (deliveryCalculation?.denominationsToKeep) {
      return <DenominationsList denominations={deliveryCalculation.denominationsToKeep} />;
    }
    return generateCalculated50Display();
  };

  // 🤖 [IA] - v1.0.0: Refactorizado para usar componente reutilizable
  const generateCalculated50Display = () => {
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
  };

  // Generate remaining cash details for text report
  const generateRemainingCashDetails = () => {
    let remainingCash: CashCount;

    // Determine which denominations remain in cash
    if (!phaseState?.shouldSkipPhase2 && deliveryCalculation?.denominationsToKeep) {
      // Phase 2 was completed, use the verified denominations to keep
      remainingCash = deliveryCalculation.denominationsToKeep;
    } else if (phaseState?.shouldSkipPhase2) {
      // Phase 2 was skipped (≤$50), all cash remains
      remainingCash = cashCount;
    } else {
      // Fallback: try to calculate $50
      const changeResult = calculateChange50(cashCount);
      if (changeResult.possible && changeResult.change) {
        remainingCash = changeResult.change as CashCount;
      } else {
        // If can't make exact $50, don't show duplicate data
        // Return empty to avoid confusion
        return "No se puede hacer cambio exacto de $50.00";
      }
    }

    const denominations = [
      { key: 'penny', label: '1¢ centavo', value: 0.01 },
      { key: 'nickel', label: '5¢ centavos', value: 0.05 },
      { key: 'dime', label: '10¢ centavos', value: 0.10 },
      { key: 'quarter', label: '25¢ centavos', value: 0.25 },
      { key: 'dollarCoin', label: '$1 moneda', value: 1.00 },
      { key: 'bill1', label: '$1', value: 1.00 },
      { key: 'bill5', label: '$5', value: 5.00 },
      { key: 'bill10', label: '$10', value: 10.00 },
      { key: 'bill20', label: '$20', value: 20.00 },
      { key: 'bill50', label: '$50', value: 50.00 },
      { key: 'bill100', label: '$100', value: 100.00 }
    ];

    const details = denominations
      .filter(d => remainingCash[d.key as keyof CashCount] > 0)
      .map(d => {
        const quantity = remainingCash[d.key as keyof CashCount];
        const subtotal = quantity * d.value;
        return `${d.label} × ${quantity} = ${formatCurrency(subtotal)}`;
      });

    return details.join('\n');
  };

  // 🤖 [IA] - v2.8.2: Funciones puras extraídas a src/utils/reports/
  // - getDenominationName, formatTimestamp, generateAnomalyDetails → alerts.ts
  // - generateCriticalAlertsBlock, generateWarningAlertsBlock → alerts.ts
  // - generateDeliveryChecklistSection, generateRemainingChecklistSection → whatsapp-report.ts
  // - generateExpensesSection, generateDataHash, generateDenominationDetails → whatsapp-report.ts

  // 🤖 [IA] - v2.8.2: generateCompleteReport refactorizado como wrapper de generateWhatsAppReport
  // Reducido de 164 líneas a ~25 líneas - toda la lógica de formateo extraída a whatsapp-report.ts
  const generateCompleteReport = useCallback(() => {
    validatePhaseCompletion();

    // Construir objeto de datos para el módulo de reportes extraído
    const reportData: WhatsAppReportData = {
      store,
      cashier,
      witness,
      cashCount,
      electronicPayments,
      expenses,
      expectedSales,
      calculationData: calculationData ? {
        totalCash: calculationData.totalCash,
        totalElectronic: calculationData.totalElectronic,
        salesCash: calculationData.salesCash,
        totalGeneral: calculationData.totalGeneral,
        totalExpenses: calculationData.totalExpenses,
        totalWithExpenses: calculationData.totalWithExpenses,
        difference: calculationData.difference,
        timestamp: calculationData.timestamp
      } : {
        totalCash: 0,
        totalElectronic: 0,
        salesCash: 0,
        totalGeneral: 0,
        totalExpenses: 0,
        totalWithExpenses: 0,
        difference: 0,
        timestamp: ''
      },
      deliveryCalculation,
      phaseState,
      storeId,
      cashierId,
      witnessId
    };

    return generateWhatsAppReport(reportData);
  }, [calculationData, electronicPayments, deliveryCalculation, store, cashier, witness, phaseState, expectedSales,
      cashCount, expenses, storeId, cashierId, witnessId, validatePhaseCompletion]);

  // 🤖 [IA] - v2.8.3: Handlers handleWhatsAppSend y handleConfirmSent movidos a useWhatsAppIntegration

  const generatePrintableReport = () => {
    try {
      const report = generateCompleteReport();
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Corte de Caja - ${store?.name}</title>
              <style>
                body { font-family: 'Courier New', monospace; margin: 20px; }
                pre { white-space: pre-wrap; font-size: 12px; }
                .print-message { 
                  text-align: center; 
                  color: #555; 
                  background-color: #f8f8f8; 
                  padding: 10px; 
                  margin-bottom: 20px; 
                  border-radius: 4px; 
                  border: 1px solid #ddd; 
                }
                @media print { 
                  body { margin: 0; }
                  .no-print { display: none; }
                }
              </style>
              <script>
                window.onload = function() {
                  // Dar tiempo para que el contenido se renderice correctamente
                  setTimeout(() => window.print(), 500);
                }
              </script>
            </head>
            <body>
              <div class="print-message no-print">
                📄 Imprimiendo automáticamente...<br>
                <small>Cierre esta ventana cuando termine la impresión</small>
              </div>
              <pre>${report}</pre>
            </body>
          </html>
        `);
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

  // 🤖 [IA] - v2.8.3: handleCopyToClipboard movido a useWhatsAppIntegration

  // 🤖 [IA] - v2.8.3: Hook de integración WhatsApp
  // Encapsula: estados (reportSent, whatsappOpened, popupBlocked, showWhatsAppInstructions)
  // y handlers (handleWhatsAppSend, handleConfirmSent, handleCopyToClipboard)
  const {
    state: whatsappState,
    handleWhatsAppSend,
    handleConfirmSent,
    handleCopyToClipboard,
    closeInstructions,
    isMac
  } = useWhatsAppIntegration({
    generateReportFn: generateCompleteReport,
    onError: (error) => {
      console.error('[CashCalculation] WhatsApp integration error:', error);
    }
  });

  // Desestructurar estados para mantener compatibilidad con el código existente
  const { reportSent, whatsappOpened, popupBlocked, showWhatsAppInstructions } = whatsappState;

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
        {/* 🤖 [IA] - v1.3.6Z: FIX iOS Safari - motion.div → div estático */}
        {/* Root cause: GPU compositing freeze con transform+opacity en iOS Safari */}
        {/* Trade-off: Sin fade-in (0.3s) para garantizar funcionalidad 100% */}
        <div
          className="space-y-[clamp(1rem,4vw,1.5rem)]"
          style={{ opacity: 1 }}
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
            // BLOQUEADO: Mostrar mensaje de bloqueo
            <div style={{
              background: 'rgba(36, 36, 36, 0.4)',
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
            // DESBLOQUEADO: Mostrar todos los resultados
            <>
          {/* Alert for significant shortage - 🤖 [IA] - v1.1.08: Glass morphism */}
          {calculationData?.hasAlert && (
            <div className="p-[clamp(0.75rem,3vw,1rem)] rounded-[clamp(0.5rem,2vw,0.75rem)] flex items-start gap-3" style={{
              background: 'rgba(244, 33, 46, 0.1)',
              border: '1px solid rgba(244, 33, 46, 0.3)'
            }}>
              <AlertTriangle className="w-[clamp(1rem,4vw,1.25rem)] h-[clamp(1rem,4vw,1.25rem)] mt-0.5" style={{ color: '#f4212e' }} />
              <div>
                <p className="font-medium text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#f4212e' }}>
                  🚨 ALERTA: Faltante significativo detectado (${Math.abs(calculationData?.difference || 0).toFixed(2)})
                </p>
                <p className="text-[clamp(0.75rem,3vw,0.875rem)] mt-1" style={{ color: '#8899a6' }}>
                  Se enviará notificación automática al administrador.
                </p>
              </div>
            </div>
          )}

          {/* Store and Personnel Info - 🤖 [IA] - v1.1.08: Glass morphism coherente */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[clamp(1rem,4vw,1.5rem)]">
            {/* Información de la sucursal y personal */}
            <div style={{
              background: 'rgba(36, 36, 36, 0.4)',
              backdropFilter: `blur(clamp(12px, 4vw, 20px))`,
              WebkitBackdropFilter: `blur(clamp(12px, 4vw, 20px))`,
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: `clamp(8px, 3vw, 16px)`,
              padding: `clamp(1rem, 5vw, 1.5rem)`
            }}>
              <h3 className="text-[clamp(1rem,4.5vw,1.25rem)] font-bold mb-[clamp(0.75rem,3vw,1rem)]" style={{ color: '#e1e8ed' }}>
                Información del Corte
              </h3>
              
              <div className="space-y-[clamp(0.75rem,3vw,1rem)]">
                <div>
                  <p className="text-[clamp(0.75rem,3vw,0.875rem)]" style={{ color: '#8899a6' }}>Sucursal</p>
                  <p className="text-[clamp(1rem,4vw,1.125rem)] font-semibold" style={{ color: '#e1e8ed' }}>
                    {store?.name}
                  </p>
                </div>
                
                <div className="p-[clamp(0.5rem,2.5vw,0.75rem)] rounded-[clamp(0.375rem,1.5vw,0.5rem)]" style={{
                  background: 'rgba(10, 132, 255, 0.1)',
                  border: '1px solid rgba(10, 132, 255, 0.3)'
                }}>
                  <p className="text-[clamp(0.75rem,3vw,0.875rem)] font-medium mb-1" style={{ color: '#0a84ff' }}>
                    Cajero (Contador)
                  </p>
                  <p className="text-[clamp(1rem,4vw,1.125rem)] font-semibold" style={{ color: '#e1e8ed' }}>
                    {cashier?.name}
                  </p>
                </div>
                
                <div className="p-[clamp(0.5rem,2.5vw,0.75rem)] rounded-[clamp(0.375rem,1.5vw,0.5rem)]" style={{
                  background: 'rgba(94, 92, 230, 0.1)',
                  border: '1px solid rgba(94, 92, 230, 0.3)'
                }}>
                  <p className="text-[clamp(0.75rem,3vw,0.875rem)] font-medium mb-1" style={{ color: '#5e5ce6' }}>
                    Testigo (Verificador)
                  </p>
                  <p className="text-[clamp(1rem,4vw,1.125rem)] font-semibold" style={{ color: '#e1e8ed' }}>
                    {witness?.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Calculation Results - Totales */}
            <div style={{
              background: 'rgba(36, 36, 36, 0.4)',
              backdropFilter: `blur(clamp(12px, 4vw, 20px))`,
              WebkitBackdropFilter: `blur(clamp(12px, 4vw, 20px))`,
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: `clamp(8px, 3vw, 16px)`,
              padding: `clamp(1rem, 5vw, 1.5rem)`
            }}>
              <h3 className="text-[clamp(1rem,4.5vw,1.25rem)] font-bold mb-[clamp(0.75rem,3vw,1rem)]" style={{ color: '#e1e8ed' }}>
                Totales Calculados
              </h3>
              <div className="space-y-[clamp(0.75rem,3vw,1rem)]">
                <div className="flex justify-between">
                  <span className="text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#8899a6' }}>Efectivo Contado:</span>
                  <span className="font-bold text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#e1e8ed' }}>
                    {formatCurrency(calculationData?.totalCash || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[clamp(0.75rem,3vw,0.875rem)]" style={{ color: '#8899a6' }}>  (Incluye fondo $50)</span>
                  <span className="text-[clamp(0.75rem,3vw,0.875rem)]" style={{ color: '#8899a6' }}>
                    -$50.00
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#8899a6' }}>Efectivo Ventas:</span>
                  <span className="font-bold text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#e1e8ed' }}>
                    {formatCurrency(calculationData?.salesCash || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#8899a6' }}>Electrónico:</span>
                  <span className="font-bold text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#e1e8ed' }}>
                    {formatCurrency(calculationData?.totalElectronic || 0)}
                  </span>
                </div>
                <div className="border-t border-gray-700 pt-3">
                  <div className="flex justify-between text-[clamp(1rem,4vw,1.125rem)] font-bold">
                    <span style={{ color: '#8899a6' }}>Total Ventas:</span>
                    <span style={{ color: '#0a84ff' }}>
                      {formatCurrency(calculationData?.totalGeneral || 0)}
                    </span>
                  </div>
                </div>
                {(calculationData?.totalExpenses || 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#8899a6' }}>Gastos:</span>
                    <span className="font-bold text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#ff9f0a' }}>
                      +{formatCurrency(calculationData?.totalExpenses || 0)}
                    </span>
                  </div>
                )}
                {(calculationData?.totalExpenses || 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#8899a6' }}>Ventas + Gastos:</span>
                    <span className="font-bold text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#e1e8ed' }}>
                      {formatCurrency(calculationData?.totalWithExpenses || 0)}
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
                    {(calculationData?.difference || 0) >= 0 ? 'Sobrante:' : 'Faltante:'}
                  </span>
                  <span style={{ 
                    color: (calculationData?.difference || 0) >= 0 ? '#00ba7c' : '#f4212e'
                  }}>
                    {formatCurrency(Math.abs(calculationData?.difference || 0))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Cambio para Mañana - 🤖 [IA] - v1.1.08: Glass morphism */}
          <div style={{
            background: 'rgba(36, 36, 36, 0.4)',
            backdropFilter: `blur(clamp(12px, 4vw, 20px))`,
            WebkitBackdropFilter: `blur(clamp(12px, 4vw, 20px))`,
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: `clamp(8px, 3vw, 16px)`,
            padding: `clamp(1rem, 5vw, 1.5rem)`
          }}>
            <h3 className="text-[clamp(1rem,4.5vw,1.25rem)] font-bold mb-[clamp(0.75rem,3vw,1rem)]" style={{ color: '#e1e8ed' }}>
              Cambio para Mañana
            </h3>
            <div className="space-y-[clamp(0.75rem,3vw,1rem)]">
              <div className="text-center">
                <div className="text-[clamp(1.5rem,7vw,2rem)] font-bold mb-2" style={{ color: '#00ba7c' }}>
                  $50.00
                </div>
                <p className="text-[clamp(0.75rem,3vw,0.875rem)]" style={{ color: '#8899a6' }}>Cambio calculado</p>
              </div>
              
              <div className="p-[clamp(0.75rem,3vw,1rem)] rounded-[clamp(0.5rem,2vw,0.75rem)]" style={{
                background: 'rgba(0, 186, 124, 0.1)',
                border: '1px solid rgba(0, 186, 124, 0.3)'
              }}>
                <p className="text-[clamp(0.75rem,3vw,0.875rem)] font-medium mb-3" style={{ color: '#00ba7c' }}>
                  Detalle del cambio:
                </p>
                
                <div className="space-y-2">
                  {/* Show exact denominations remaining in cash after Phase 2 */}
                  {phaseState?.shouldSkipPhase2 ? (
                    // If Phase 2 was skipped, show all original denominations  
                    <div className="space-y-1">
                      {generateRemainingDenominationsDisplay(cashCount)}
                    </div>
                  ) : (
                    // If Phase 2 was completed, show what should remain ($50 worth)
                    <div className="space-y-1">
                      {deliveryCalculation?.denominationsToKeep ? 
                        generateRemainingDenominationsFromPhase2() :
                        generateCalculated50Display()
                      }
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
            </>
          )}

          {/* 🤖 [IA] - v1.3.7: ANTI-FRAUDE - Bloque de acción SIEMPRE visible */}
          <div style={{
            background: 'rgba(36, 36, 36, 0.4)',
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

              {/* Botones de acción */}
              {/* 🤖 [IA] - v2.4.1: Grid adaptativo - 2 columnas si Copiar oculto, 3 si visible */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[clamp(0.5rem,2vw,0.75rem)] lg:max-w-2xl mx-auto">
                <ConstructiveActionButton
                  onClick={handleWhatsAppSend}
                  disabled={false}
                  aria-label="Enviar reporte por WhatsApp"
                >
                  <Share />
                  {reportSent ? '✅ Reporte Enviado' : whatsappOpened ? 'Reenviar WhatsApp' : 'Enviar WhatsApp'}
                </ConstructiveActionButton>

                {/* 🤖 [IA] - v2.4.1: Botón Copiar OCULTO (redundante con copia automática)
                    ⚠️ REACTIVACIÓN: Descomentar este bloque si se necesita botón manual de copia
                    Casos de uso: Debugging, usuarios que prefieren control manual, fallback si clipboard API falla
                */}
                {/* <NeutralActionButton
                  onClick={handleCopyToClipboard}
                  disabled={false}
                  aria-label="Copiar reporte manualmente"
                >
                  <Copy />
                  Copiar
                </NeutralActionButton> */}

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
              {/* 🤖 [IA] - v2.4.1b: Botón de confirmación eliminado (redundante con modal) */}
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

          {/* 🤖 [IA] - v2.4.1: Banner pop-up bloqueado - Actualizado sin referencia a botón Copiar */}
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
          setShowFinishConfirmation(false);
          onComplete();
        }}
        onCancel={() => setShowFinishConfirmation(false)}
      />

      {/* 🤖 [IA] - v2.4.1: Modal de instrucciones para envío WhatsApp en desktop */}
      {/* 🤖 [IA] - v2.8.3: onOpenChange usa closeInstructions del hook */}
      <Dialog open={showWhatsAppInstructions} onOpenChange={(open) => !open && closeInstructions()}>
        <DialogContent className="glass-morphism-panel max-w-md p-0">
          <DialogTitle className="sr-only">
            Instrucciones para enviar reporte por WhatsApp
          </DialogTitle>
          <DialogDescription className="sr-only">
            Pasos detallados para enviar el reporte copiado a WhatsApp Web
          </DialogDescription>

          <div className="p-fluid-lg space-y-fluid-lg">
            {/* Header */}
            <div className="flex items-center gap-fluid-md">
              <MessageSquare
                className="flex-shrink-0 w-[clamp(1.5rem,6vw,2rem)] h-[clamp(1.5rem,6vw,2rem)]"
                style={{ color: '#00ba7c' }}
                aria-label="Icono de WhatsApp"
              />
              <div className="flex flex-col">
                <h2 className="font-bold text-[clamp(1.125rem,5vw,1.375rem)] text-[#e1e8ed] leading-tight">
                  Cómo enviar el reporte
                </h2>
                <p className="text-[clamp(0.625rem,2.5vw,0.75rem)] text-[#8899a6] mt-[clamp(0.125rem,0.5vw,0.25rem)]">
                  Siga estos pasos para enviar por WhatsApp Web
                </p>
              </div>
            </div>

            {/* Pasos */}
            <div className="space-y-[clamp(0.75rem,3vw,1rem)]">
              {/* Paso 1 */}
              <div className="flex items-start gap-[clamp(0.5rem,2vw,0.75rem)]">
                <div 
                  className="w-[clamp(1.75rem,7vw,2rem)] h-[clamp(1.75rem,7vw,2rem)] rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'rgba(0, 186, 124, 0.2)',
                    border: '1px solid rgba(0, 186, 124, 0.3)'
                  }}
                >
                  <span className="text-[clamp(0.875rem,3.5vw,1rem)] font-bold" style={{ color: '#00ba7c' }}>1</span>
                </div>
                <div>
                  <p className="font-medium text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#e1e8ed' }}>
                    Vaya a su WhatsApp Web
                  </p>
                  <p className="text-[clamp(0.75rem,3vw,0.875rem)] mt-1" style={{ color: '#8899a6' }}>
                    Debe estar ya abierto según el protocolo
                  </p>
                </div>
              </div>

              {/* Paso 2 */}
              <div className="flex items-start gap-[clamp(0.5rem,2vw,0.75rem)]">
                <div 
                  className="w-[clamp(1.75rem,7vw,2rem)] h-[clamp(1.75rem,7vw,2rem)] rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'rgba(0, 186, 124, 0.2)',
                    border: '1px solid rgba(0, 186, 124, 0.3)'
                  }}
                >
                  <span className="text-[clamp(0.875rem,3.5vw,1rem)] font-bold" style={{ color: '#00ba7c' }}>2</span>
                </div>
                <div>
                  <p className="font-medium text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#e1e8ed' }}>
                    Seleccione el chat de gerencia
                  </p>
                  <p className="text-[clamp(0.75rem,3vw,0.875rem)] mt-1" style={{ color: '#8899a6' }}>
                    O el grupo correspondiente para reportes
                  </p>
                </div>
              </div>

              {/* Paso 3 */}
              <div className="flex items-start gap-[clamp(0.5rem,2vw,0.75rem)]">
                <div 
                  className="w-[clamp(1.75rem,7vw,2rem)] h-[clamp(1.75rem,7vw,2rem)] rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'rgba(0, 186, 124, 0.2)',
                    border: '1px solid rgba(0, 186, 124, 0.3)'
                  }}
                >
                  <span className="text-[clamp(0.875rem,3.5vw,1rem)] font-bold" style={{ color: '#00ba7c' }}>3</span>
                </div>
                <div>
                  <p className="font-medium text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#e1e8ed' }}>
                    Pegue el reporte
                  </p>
                  <p className="text-[clamp(0.75rem,3vw,0.875rem)] mt-1" style={{ color: '#8899a6' }}>
                    Presione {isMac ? 'Cmd+V' : 'Ctrl+V'} en el campo de mensaje
                  </p>
                </div>
              </div>

              {/* Paso 4 */}
              <div className="flex items-start gap-[clamp(0.5rem,2vw,0.75rem)]">
                <div 
                  className="w-[clamp(1.75rem,7vw,2rem)] h-[clamp(1.75rem,7vw,2rem)] rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'rgba(0, 186, 124, 0.2)',
                    border: '1px solid rgba(0, 186, 124, 0.3)'
                  }}
                >
                  <span className="text-[clamp(0.875rem,3.5vw,1rem)] font-bold" style={{ color: '#00ba7c' }}>4</span>
                </div>
                <div>
                  <p className="font-medium text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#e1e8ed' }}>
                    Envíe el mensaje
                  </p>
                  <p className="text-[clamp(0.75rem,3vw,0.875rem)] mt-1" style={{ color: '#8899a6' }}>
                    Presione Enter para enviar el reporte
                  </p>
                </div>
              </div>

              {/* Banner de confirmación */}
              <div 
                className="p-[clamp(0.75rem,3vw,1rem)] rounded-[clamp(0.5rem,2vw,0.75rem)] flex items-center gap-[clamp(0.5rem,2vw,0.75rem)]"
                style={{
                  background: 'rgba(0, 186, 124, 0.1)',
                  border: '1px solid rgba(0, 186, 124, 0.3)'
                }}
              >
                <CheckCircle className="w-[clamp(1rem,4vw,1.25rem)] h-[clamp(1rem,4vw,1.25rem)] flex-shrink-0" style={{ color: '#00ba7c' }} />
                <p className="text-[clamp(0.75rem,3vw,0.875rem)]" style={{ color: '#00ba7c' }}>
                  El reporte ya está copiado en su portapapeles
                </p>
              </div>
            </div>

            {/* Botones */}
            {/* 🤖 [IA] - v2.8.3: Botones actualizados para usar hook */}
            <div className="flex gap-[clamp(0.5rem,2vw,0.75rem)] pt-fluid-md border-t border-slate-600">
              <Button
                variant="ghost"
                onClick={closeInstructions}
                className="flex-1 h-fluid-3xl"
              >
                Cerrar
              </Button>
              <ConstructiveActionButton
                onClick={handleConfirmSent}
                className="flex-1"
              >
                <CheckCircle className="w-4 h-4" />
                Ya lo envié
              </ConstructiveActionButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CashCalculation;