import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calculator, AlertTriangle, CheckCircle, Share, Download, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { FloatingOrbs } from "@/components/FloatingOrbs";
import { calculateCashTotal, calculateChange50, formatCurrency, generateDenominationSummary } from "@/utils/calculations";
import { CashCount, ElectronicPayments } from "@/types/cash";
import { getStoreById, getEmployeeById } from "@/data/paradise";

interface CashCalculationProps {
  storeId: string;
  cashierId: string;
  witnessId: string;
  expectedSales: number;
  cashCount: CashCount;
  electronicPayments: ElectronicPayments;
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

  const generateWhatsAppReport = () => {
    if (!calculationData || !store || !cashier || !witness) return;

    const report = `🏪 CORTE DE CAJA - ${store.name}
📅 ${calculationData.timestamp}
👤 Cajero: ${cashier.name}
👁️ Testigo: ${witness.name}

💵 EFECTIVO
Total: ${formatCurrency(calculationData.totalCash)}

💳 ELECTRÓNICO: ${formatCurrency(calculationData.totalElectronic)}

📊 TOTAL GENERAL: ${formatCurrency(calculationData.totalGeneral)}
🎯 Venta Esperada: ${formatCurrency(expectedSales)}
${calculationData.difference >= 0 ? '✅ Sobrante' : '⚠️ Faltante'}: ${formatCurrency(Math.abs(calculationData.difference))}

💼 Cambio para mañana: ${formatCurrency(calculationData.changeResult.total)}

${calculationData.changeResult.possible ? 
`Detalle del cambio:
${generateDenominationSummary(calculationData.changeResult.change)}` :
'❌ No hay suficiente efectivo para cambio de $50.00'}

${calculationData.hasAlert ? '🚨 ALERTA: Faltante significativo detectado' : ''}

---
Sistema Paradise Cash Control v2.0`;

    const encodedReport = encodeURIComponent(report);
    window.open(`https://wa.me/?text=${encodedReport}`, '_blank');
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

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-success">Cambio para Mañana</CardTitle>
              </CardHeader>
              <CardContent>
                {calculationData.changeResult.possible ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-success">
                        {formatCurrency(calculationData.changeResult.total)}
                      </div>
                      <p className="text-sm text-muted-foreground">Cambio calculado</p>
                    </div>
                    <div className="bg-success/10 border border-success/30 rounded-lg p-3">
                      <p className="text-sm font-medium text-success mb-2">Detalle del cambio:</p>
                      <pre className="text-xs whitespace-pre-wrap">
                        {generateDenominationSummary(calculationData.changeResult.change)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <AlertTriangle className="w-12 h-12 text-warning mx-auto" />
                    <p className="text-warning font-medium">
                      No hay suficiente efectivo para cambio de $50.00
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Se requiere gestionar más efectivo antes del siguiente turno
                    </p>
                  </div>
                )}
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
              
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={onBack}
                  variant="outline"
                  className="border-muted hover:bg-muted/50"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
                <Button
                  onClick={generateWhatsAppReport}
                  className="bg-gradient-aqua hover:scale-105 transform transition-all duration-300 text-white font-semibold"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Enviar por WhatsApp
                </Button>
                <Button
                  onClick={onComplete}
                  className="bg-success hover:bg-success/90 text-success-foreground"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Finalizar
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