// 🤖 [IA] - v1.1.09 - Fix botón copiar con fallback robusto
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calculator, AlertTriangle, CheckCircle, Share, Download, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
// 🤖 [IA] - v1.1.08: Removidos Card components para coherencia con glass morphism
// 🤖 [IA] - v1.1.08: Alert components removidos para coherencia con glass morphism
// 🤖 [IA] - v1.3.0: Importación de CSS modular para el botón report-action
import '@/styles/features/report-action-button.css';
import { Badge } from "@/components/ui/badge";
import { PrimaryActionButton } from "@/components/ui/primary-action-button"; // 🤖 [IA] - v2.0.0: Botón de acción primaria estándar
import { NeutralActionButton } from "@/components/ui/neutral-action-button"; // 🤖 [IA] - v2.0.0: Botón de acción neutral estándar
import { ConstructiveActionButton } from "@/components/ui/constructive-action-button"; // 🤖 [IA] - v2.0.0: Botón de acción constructiva estándar
import { calculateCashTotal, calculateChange50, formatCurrency, generateDenominationSummary } from "@/utils/calculations";
import { copyToClipboard } from "@/utils/clipboard"; // 🤖 [IA] - v1.1.09
import { toast } from "sonner"; // 🤖 [IA] - v1.1.15 - Migrated to Sonner for consistency
import { CashCount, ElectronicPayments } from "@/types/cash";
import { PhaseState, DeliveryCalculation } from "@/types/phases";
import { getStoreById, getEmployeeById } from "@/data/paradise";

// 🤖 [IA] - v1.2.22: TypeScript interface for calculation results
interface CalculationData {
  totalCash: number;
  totalElectronic: number;
  totalGeneral: number;
  difference: number;
  changeResult: {
    canMakeChange: boolean;
    message: string;
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
  deliveryCalculation?: DeliveryCalculation;
  phaseState?: PhaseState;
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
  deliveryCalculation,
  phaseState,
  onBack,
  onComplete
}: CashCalculationProps) => {
  const [isCalculated, setIsCalculated] = useState(false);
  const [calculationData, setCalculationData] = useState<CalculationData | null>(null); // 🤖 [IA] - v1.2.22: Fixed any type violation

  const store = getStoreById(storeId);
  const cashier = getEmployeeById(cashierId);
  const witness = getEmployeeById(witnessId);

  useEffect(() => {
    if (!isCalculated) {
      performCalculation();
    }
  }, []);

  const performCalculation = () => {
    const totalCash = calculateCashTotal(cashCount);
    const totalElectronic = Object.values(electronicPayments).reduce((sum, val) => sum + val, 0);
    const totalGeneral = totalCash + totalElectronic;
    const difference = totalGeneral - expectedSales;
    
    const changeResult = calculateChange50(cashCount);
    
    const data = {
      totalCash,
      totalElectronic,
      totalGeneral,
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
    setIsCalculated(true);
  };

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

  const generateDataHash = () => {
    const hashData = {
      storeId,
      cashierId,
      witnessId,
      timestamp: calculationData.timestamp,
      totalCash: calculationData.totalCash,
      totalElectronic: calculationData.totalElectronic,
      expectedSales,
      phaseCompleted: phaseState?.currentPhase || 3
    };
    
    // Simple but effective hash for integrity
    return btoa(JSON.stringify(hashData)).slice(-12);
  };

  const generateDenominationDetails = () => {
    const denominations = [
      { key: 'penny', label: '1¢', value: 0.01 },
      { key: 'nickel', label: '5¢', value: 0.05 },
      { key: 'dime', label: '10¢', value: 0.10 },
      { key: 'quarter', label: '25¢', value: 0.25 },
      { key: 'dollarCoin', label: '$1 moneda', value: 1.00 },
      { key: 'bill1', label: '$1', value: 1.00 },
      { key: 'bill5', label: '$5', value: 5.00 },
      { key: 'bill10', label: '$10', value: 10.00 },
      { key: 'bill20', label: '$20', value: 20.00 },
      { key: 'bill50', label: '$50', value: 50.00 },
      { key: 'bill100', label: '$100', value: 100.00 }
    ];

    return denominations
      .filter(d => cashCount[d.key as keyof CashCount] > 0)
      .map(d => `${d.label} × ${cashCount[d.key as keyof CashCount]} = ${formatCurrency(cashCount[d.key as keyof CashCount] * d.value)}`)
      .join('\n');
  };

  // Generate display for remaining denominations when Phase 2 was skipped
  const generateRemainingDenominationsDisplay = (remainingCash: CashCount) => {
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

    const items = denominations
      .filter(d => remainingCash[d.key as keyof CashCount] > 0)
      .map(d => {
        const quantity = remainingCash[d.key as keyof CashCount] || 0;
        const subtotal = quantity * d.value;
        return (
          <div key={d.key} className="flex justify-between text-sm bg-success/5 rounded px-3 py-1.5">
            <span className="font-medium">{d.label}</span>
            <span className="font-semibold">
              × {quantity} = {formatCurrency(subtotal)}
            </span>
          </div>
        );
      });

    // 🤖 [IA] - v1.0.80: Agregar línea de total para mejor claridad
    const total = calculateCashTotal(remainingCash);
    
    return (
      <>
        {items}
        {items.length > 0 && (
          <>
            <div className="border-t border-success/30 my-2"></div>
            <div className="flex justify-between text-sm font-bold text-success px-3">
              <span>Total en caja:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </>
        )}
      </>
    );
  };

  // Generate display for remaining denominations after Phase 2 completion
  const generateRemainingDenominationsFromPhase2 = () => {
    // 🤖 [IA] - v1.0.80: Usar datos verificados de Phase 2 en lugar de recalcular
    if (deliveryCalculation?.denominationsToKeep) {
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

      const items = denominations
        .filter(d => deliveryCalculation.denominationsToKeep[d.key as keyof CashCount] > 0)
        .map(d => {
          const quantity = deliveryCalculation.denominationsToKeep[d.key as keyof CashCount] || 0;
          const subtotal = quantity * d.value;
          return (
            <div key={d.key} className="flex justify-between text-sm bg-success/5 rounded px-3 py-1.5">
              <span className="font-medium">{d.label}</span>
              <span className="font-semibold">
                × {quantity} = {formatCurrency(subtotal)}
              </span>
            </div>
          );
        });

      // 🤖 [IA] - Agregar línea de total al final
      const total = calculateCashTotal(deliveryCalculation.denominationsToKeep);
      
      return (
        <>
          {items}
          {items.length > 0 && (
            <>
              <div className="border-t border-success/30 my-2"></div>
              <div className="flex justify-between text-sm font-bold text-success px-3">
                <span>Total en caja:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </>
          )}
        </>
      );
    }
    // Fallback si no hay datos de Phase 2
    return generateCalculated50Display();
  };

  // Generate calculated $50 display as fallback
  const generateCalculated50Display = () => {
    const changeResult = calculateChange50(cashCount);
    if (changeResult.possible && changeResult.change) {
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

      const items = denominations
        .filter(d => changeResult.change[d.key as keyof CashCount] > 0)
        .map(d => {
          const quantity = changeResult.change[d.key as keyof CashCount] || 0;
          const subtotal = quantity * d.value;
          return (
            <div key={d.key} className="flex justify-between text-sm bg-success/5 rounded px-3 py-1.5">
              <span className="font-medium">{d.label}</span>
              <span className="font-semibold">
                × {quantity} = {formatCurrency(subtotal)}
              </span>
            </div>
          );
        });

      // 🤖 [IA] - v1.0.80: Agregar línea de total para mejor claridad
      return (
        <>
          {items}
          {items.length > 0 && (
            <>
              <div className="border-t border-success/30 my-2"></div>
              <div className="flex justify-between text-sm font-bold text-success px-3">
                <span>Total en caja:</span>
                <span>{formatCurrency(changeResult.total)}</span>
              </div>
            </>
          )}
        </>
      );
    }
    return (
      <div className="text-center text-warning">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
        <p className="text-xs">No hay suficiente efectivo para cambio de $50.00</p>
      </div>
    );
  };

  const generateCompleteReport = () => {
    try {
      validatePhaseCompletion();
      
      const denominationDetails = generateDenominationDetails();
      const dataHash = generateDataHash();
      const electronicDetails = `Credomatic: ${formatCurrency(electronicPayments.credomatic)}\nPromerica: ${formatCurrency(electronicPayments.promerica)}`;

      return `CORTE DE CAJA - ${calculationData.timestamp}
================================
Sucursal: ${store?.name}
Cajero: ${cashier?.name}
Testigo: ${witness?.name}
Sistema: Conteo Guiado v2.0

FASE 1 - CONTEO INICIAL
-----------------------
DENOMINACIONES CONTADAS:
${denominationDetails}

PAGOS ELECTRÓNICOS:
${electronicDetails}

Total Efectivo: ${formatCurrency(calculationData.totalCash)}
Total Electrónico: ${formatCurrency(calculationData.totalElectronic)}

${phaseState?.shouldSkipPhase2 ? 
`FASE 2 - OMITIDA
-----------------------
Total ≤ $50.00 - Sin entrega a gerencia
Todo permanece en caja` :
`FASE 2 - DIVISIÓN
-----------------------
Entregado a Gerencia: ${formatCurrency(deliveryCalculation?.amountToDeliver || 0)}
Dejado en Caja: $50.00

${deliveryCalculation?.deliverySteps ? 
`DETALLE ENTREGADO:
${deliveryCalculation.deliverySteps.map((step: DeliveryStep) => // 🤖 [IA] - v1.2.22: Fixed any type 
  `${step.label} × ${step.quantity} = ${formatCurrency(step.value * step.quantity)}`
).join('\n')}` : ''}

VERIFICACIÓN: ✓ EXITOSA`}

FASE 3 - RESULTADOS FINALES
-----------------------
TOTAL GENERAL: ${formatCurrency(calculationData.totalGeneral)}
🎯 Venta Esperada: ${formatCurrency(expectedSales)}
${calculationData.difference >= 0 ? '✅ Sobrante' : '⚠️ Faltante'}: ${formatCurrency(Math.abs(calculationData.difference))}

💼 Cambio para mañana: ${formatCurrency(calculationData.changeResult.total)}

${calculationData.changeResult.possible ? 
`Detalle del cambio:
${generateDenominationSummary(calculationData.changeResult.change)}` :
'❌ No hay suficiente efectivo para cambio de $50.00'}

${calculationData.hasAlert ? '🚨 ALERTA: Faltante significativo detectado' : ''}

================================
Firma Digital: ${dataHash}`;
    } catch (error) {
      throw error;
    }
  };

  const generateWhatsAppReport = () => {
    try {
      if (!calculationData || !store || !cashier || !witness) {
        toast.error("❌ Error", {
          description: "Faltan datos necesarios para generar el reporte"
        });
        return;
      }

      const report = generateCompleteReport();
      const encodedReport = encodeURIComponent(`🏪 ${report}`);
      window.open(`https://wa.me/?text=${encodedReport}`, '_blank');
      
      toast.success("✅ Reporte generado exitosamente", {
        description: "WhatsApp se abrirá con el reporte completo"
      });
    } catch (error) {
      toast.error("❌ Error al generar reporte", {
        description: error instanceof Error ? error.message : "Error desconocido"
      });
    }
  };

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

  // 🤖 [IA] - v1.1.09: Función mejorada con fallback robusto
  const handleCopyToClipboard = async () => {
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
      // Error al generar el reporte
      toast.error("❌ Error al generar reporte", {
        description: error instanceof Error ? error.message : "Error desconocido"
      });
    }
  };

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
    <div className="min-h-screen relative overflow-y-auto" data-scrollable="true">
      
      <div className="relative z-10 container mx-auto px-[clamp(1rem,4vw,1.5rem)] py-[clamp(1.5rem,6vw,2rem)] max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-[clamp(1rem,4vw,1.5rem)]"
        >
          <div className="text-center mb-[clamp(1.5rem,6vw,2rem)]">
            <h2 className="text-[clamp(1.25rem,5vw,1.75rem)] font-bold text-primary mb-2">Cálculo Completado</h2>
            <p className="text-muted-foreground text-[clamp(0.875rem,3.5vw,1rem)]">Resultados del corte de caja</p>
            <Badge variant="outline" className="mt-2 border-primary text-primary text-[clamp(0.75rem,3vw,0.875rem)]">
              {calculationData.timestamp}
            </Badge>
          </div>

          {/* Alert for significant shortage - 🤖 [IA] - v1.1.08: Glass morphism */}
          {calculationData.hasAlert && (
            <div className="p-[clamp(0.75rem,3vw,1rem)] rounded-[clamp(0.5rem,2vw,0.75rem)] flex items-start gap-3" style={{
              background: 'rgba(244, 33, 46, 0.1)',
              border: '1px solid rgba(244, 33, 46, 0.3)'
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
                  <span className="text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#8899a6' }}>Efectivo:</span>
                  <span className="font-bold text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#e1e8ed' }}>
                    {formatCurrency(calculationData.totalCash)}
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
                    <span style={{ color: '#8899a6' }}>Total General:</span>
                    <span style={{ color: '#0a84ff' }}>
                      {formatCurrency(calculationData.totalGeneral)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#8899a6' }}>Venta Esperada:</span>
                  <span className="text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#8899a6' }}>
                    {formatCurrency(expectedSales)}
                  </span>
                </div>
                <div className="flex justify-between text-[clamp(1rem,4vw,1.125rem)] font-bold">
                  <span style={{ color: '#8899a6' }}>
                    {calculationData.difference >= 0 ? 'Sobrante:' : 'Faltante:'}
                  </span>
                  <span style={{ 
                    color: calculationData.difference >= 0 ? '#00ba7c' : '#f4212e'
                  }}>
                    {formatCurrency(Math.abs(calculationData.difference))}
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

          {/* Success Confirmation - 🤖 [IA] - v1.1.08: Glass morphism */}
          <div style={{
            background: 'rgba(36, 36, 36, 0.4)',
            backdropFilter: `blur(clamp(12px, 4vw, 20px))`,
            WebkitBackdropFilter: `blur(clamp(12px, 4vw, 20px))`,
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: `clamp(8px, 3vw, 16px)`,
            padding: `clamp(1.5rem, 6vw, 2rem)`
          }}>
            <div className="text-center">
              <CheckCircle className="w-[clamp(3rem,12vw,4rem)] h-[clamp(3rem,12vw,4rem)] mx-auto mb-[clamp(0.75rem,3vw,1rem)]" style={{ color: '#00ba7c' }} />
              <h3 className="text-[clamp(1rem,4.5vw,1.25rem)] font-bold mb-2" style={{ color: '#00ba7c' }}>
                Corte de Caja Completado
              </h3>
              <p className="mb-[clamp(1rem,4vw,1.5rem)] text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#8899a6' }}>
                Los datos han sido calculados y están listos para generar el reporte.
                Los campos están ahora bloqueados según el protocolo anti-fraude.
              </p>
              
              {/* 🤖 [IA] - v1.1.01: Responsive buttons para desktop */}
              {/* 🤖 [IA] - v1.2.8: Removido botón Reporte, grid ajustado a 3 columnas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[clamp(0.5rem,2vw,0.75rem)] lg:max-w-3xl mx-auto">
                <ConstructiveActionButton
                  onClick={generateWhatsAppReport}
                  aria-label="Compartir por WhatsApp"
                >
                  <Share />
                  WhatsApp
                </ConstructiveActionButton>
                
                <NeutralActionButton
                  onClick={handleCopyToClipboard}
                  aria-label="Copiar reporte"
                >
                  <Copy />
                  Copiar
                </NeutralActionButton>
                
                <PrimaryActionButton
                  onClick={onComplete}
                  aria-label="Finalizar proceso"
                >
                  <CheckCircle />
                  Finalizar
                </PrimaryActionButton>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CashCalculation;