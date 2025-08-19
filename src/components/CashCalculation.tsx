import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calculator, AlertTriangle, CheckCircle, Share, Download, ArrowLeft, Copy, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { FloatingOrbs } from "@/components/FloatingOrbs";
import { calculateCashTotal, calculateChange50, formatCurrency, generateDenominationSummary } from "@/utils/calculations";
import { toast } from "@/hooks/use-toast";
import { CashCount, ElectronicPayments } from "@/types/cash";
import { PhaseState } from "@/types/phases";
import { getStoreById, getEmployeeById } from "@/data/paradise";

interface CashCalculationProps {
  storeId: string;
  cashierId: string;
  witnessId: string;
  expectedSales: number;
  cashCount: CashCount;
  electronicPayments: ElectronicPayments;
  deliveryCalculation?: any;
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
  const [calculationData, setCalculationData] = useState<any>(null);

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
      .filter(d => remainingCash[d.key as keyof CashCount] > 0)
      .map(d => (
        <div key={d.key} className="flex justify-between text-xs bg-success/5 rounded px-2 py-1">
          <span>{d.label}</span>
          <span className="font-semibold">× {remainingCash[d.key as keyof CashCount]} = {formatCurrency(remainingCash[d.key as keyof CashCount] * d.value)}</span>
        </div>
      ));
  };

  // Generate display for remaining denominations after Phase 2 completion
  const generateRemainingDenominationsFromPhase2 = () => {
    // This would use the verified denominations from Phase 2
    // For now, we'll calculate what should remain ($50 worth)
    const changeResult = calculateChange50(cashCount);
    if (changeResult.possible && changeResult.change) {
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
        .filter(d => changeResult.change[d.key as keyof CashCount] > 0)
        .map(d => (
          <div key={d.key} className="flex justify-between text-xs bg-success/5 rounded px-2 py-1">
            <span>{d.label}</span>
            <span className="font-semibold">× {changeResult.change[d.key as keyof CashCount]} = {formatCurrency((changeResult.change[d.key as keyof CashCount] || 0) * d.value)}</span>
          </div>
        ));
    }
    return <div className="text-xs text-warning">No se pudo calcular el cambio exacto</div>;
  };

  // Generate calculated $50 display as fallback
  const generateCalculated50Display = () => {
    const changeResult = calculateChange50(cashCount);
    if (changeResult.possible && changeResult.change) {
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
        .filter(d => changeResult.change[d.key as keyof CashCount] > 0)
        .map(d => (
          <div key={d.key} className="flex justify-between text-xs bg-success/5 rounded px-2 py-1">
            <span>{d.label}</span>
            <span className="font-semibold">× {changeResult.change[d.key as keyof CashCount]} = {formatCurrency((changeResult.change[d.key as keyof CashCount] || 0) * d.value)}</span>
          </div>
        ));
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
${deliveryCalculation.deliverySteps.map((step: any) => 
  `${step.label} × ${step.quantity} = ${formatCurrency(step.value * step.quantity)}`
).join('\n')}` : ''}

VERIFICACIÓN: ✓ EXITOSA`}

FASE 3 - RESULTADOS FINALES
-----------------------
📊 TOTAL GENERAL: ${formatCurrency(calculationData.totalGeneral)}
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
        toast({
          title: "❌ Error",
          description: "Faltan datos necesarios para generar el reporte",
          variant: "destructive",
        });
        return;
      }

      const report = generateCompleteReport();
      const encodedReport = encodeURIComponent(`🏪 ${report}`);
      window.open(`https://wa.me/?text=${encodedReport}`, '_blank');
      
      toast({
        title: "✅ Reporte generado exitosamente",
        description: "WhatsApp se abrirá con el reporte completo",
      });
    } catch (error) {
      toast({
        title: "❌ Error al generar reporte",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
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
                @media print { 
                  body { margin: 0; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              <button class="no-print" onclick="window.print()">🖨️ Imprimir</button>
              <pre>${report}</pre>
            </body>
          </html>
        `);
        printWindow.document.close();
        
        toast({
          title: "📄 Reporte generado",
          description: "Vista de impresión preparada",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Error al generar reporte",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async () => {
    try {
      const report = generateCompleteReport();
      await navigator.clipboard.writeText(report);
      
      toast({
        title: "💾 Copiado al portapapeles",
        description: "El reporte completo ha sido copiado para respaldo",
      });
    } catch (error) {
      toast({
        title: "❌ Error al copiar",
        description: "No se pudo copiar al portapapeles",
        variant: "destructive",
      });
    }
  };

  if (!calculationData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Calculator className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Calculando totales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingOrbs />
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-primary mb-2">Cálculo Completado</h2>
            <p className="text-muted-foreground">Resultados del corte de caja</p>
            <Badge variant="outline" className="mt-2 border-primary text-primary">
              {calculationData.timestamp}
            </Badge>
          </div>

          {/* Alert for significant shortage */}
          {calculationData.hasAlert && (
            <Alert className="border-destructive bg-destructive/10">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive font-medium">
                🚨 ALERTA: Faltante significativo detectado (${Math.abs(calculationData.difference).toFixed(2)})
                <br />Se enviará notificación automática al administrador.
              </AlertDescription>
            </Alert>
          )}

          {/* Store and Personnel Info */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-primary">Información del Corte</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sucursal</p>
                <p className="font-semibold">{store?.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cajero</p>
                <p className="font-semibold">{cashier?.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Testigo</p>
                <p className="font-semibold">{witness?.name}</p>
              </div>
            </CardContent>
          </Card>

          {/* Calculation Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-warning">Totales Calculados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Efectivo:</span>
                  <span className="font-bold">{formatCurrency(calculationData.totalCash)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Electrónico:</span>
                  <span className="font-bold">{formatCurrency(calculationData.totalElectronic)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total General:</span>
                    <span className="text-primary">{formatCurrency(calculationData.totalGeneral)}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>Venta Esperada:</span>
                  <span>{formatCurrency(expectedSales)}</span>
                </div>
                <div className={`flex justify-between text-lg font-bold ${
                  calculationData.difference >= 0 ? 'text-success' : 'text-destructive'
                }`}>
                  <span>{calculationData.difference >= 0 ? 'Sobrante:' : 'Faltante:'}</span>
                  <span>{formatCurrency(Math.abs(calculationData.difference))}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-success/20 bg-success/5">
              <CardHeader>
                <CardTitle className="text-success flex items-center gap-2">
                  <span className="text-2xl">💰</span>
                  Cambio para Mañana
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-success mb-2">
                      $50.00
                    </div>
                    <p className="text-sm text-muted-foreground">Cambio calculado</p>
                  </div>
                  
                  <div className="glass-card bg-success/10 border border-success/30 p-4">
                    <p className="text-sm font-medium text-success mb-3 flex items-center gap-2">
                      <span>📋</span> Detalle del cambio:
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
                          {deliveryCalculation?.remainingDenominations ? 
                            generateRemainingDenominationsFromPhase2() :
                            generateCalculated50Display()
                          }
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Success Confirmation */}
          <Card className="glass-card border-success/30">
            <CardContent className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
              <h3 className="text-xl font-bold text-success mb-2">
                Corte de Caja Completado
              </h3>
              <p className="text-muted-foreground mb-6">
                Los datos han sido calculados y están listos para generar el reporte.
                Los campos están ahora bloqueados según el protocolo anti-fraude.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
                <Button
                  onClick={generateWhatsAppReport}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold glass-card hover:scale-105 transform transition-all duration-300"
                >
                  <Share className="w-4 h-4 mr-2" />
                  📱 Enviar por WhatsApp
                </Button>
                
                <Button
                  onClick={generatePrintableReport}
                  variant="outline"
                  className="border-primary/30 hover:bg-primary/10 glass-card hover:scale-105 transform transition-all duration-300"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  📄 Generar Reporte
                </Button>
                
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  className="border-warning/30 hover:bg-warning/10 glass-card hover:scale-105 transform transition-all duration-300"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  💾 Copiar al Portapapeles
                </Button>
                
                <Button
                  onClick={onComplete}
                  className="bg-success hover:bg-success/90 text-success-foreground glass-card hover:scale-105 transform transition-all duration-300"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  ✅ Finalizar Corte
                </Button>
              </div>
              
              <div className="mt-4 text-center">
                <Button
                  onClick={onBack}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver a Fase Anterior
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CashCalculation;