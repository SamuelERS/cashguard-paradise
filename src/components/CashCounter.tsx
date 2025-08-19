import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Calculator, Users, MapPin, DollarSign, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FloatingOrbs } from "@/components/FloatingOrbs";
import CashCalculation from "@/components/CashCalculation";
import { STORES, EMPLOYEES, getEmployeesByStore } from "@/data/paradise";
import { DENOMINATIONS, CashCount, ElectronicPayments } from "@/types/cash";

interface CashCounterProps {
  onBack?: () => void;
}

const CashCounter = ({ onBack }: CashCounterProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedStore, setSelectedStore] = useState("");
  const [selectedCashier, setSelectedCashier] = useState("");
  const [selectedWitness, setSelectedWitness] = useState("");
  const [expectedSales, setExpectedSales] = useState("");

  // Cash count state
  const [cashCount, setCashCount] = useState<CashCount>({
    penny: 0,
    nickel: 0,
    dime: 0,
    quarter: 0,
    dollarCoin: 0,
    bill1: 0,
    bill5: 0,
    bill10: 0,
    bill20: 0,
    bill50: 0,
    bill100: 0,
  });

  // Electronic payments state
  const [electronicPayments, setElectronicPayments] = useState<ElectronicPayments>({
    credomatic: 0,
    promerica: 0,
    bankTransfer: 0,
    paypal: 0,
  });

  const availableEmployees = selectedStore ? getEmployeesByStore(selectedStore) : [];

  const handleCashCountChange = (denomination: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setCashCount(prev => ({
      ...prev,
      [denomination]: numValue
    }));
  };

  const handleElectronicChange = (method: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setElectronicPayments(prev => ({
      ...prev,
      [method]: numValue
    }));
  };

  const canProceedToStep2 = selectedStore && selectedCashier && selectedWitness && 
                           selectedCashier !== selectedWitness && expectedSales;

  const handleCompleteCalculation = () => {
    // Reset form and go back to beginning
    setCurrentStep(1);
    setSelectedStore("");
    setSelectedCashier("");
    setSelectedWitness("");
    setExpectedSales("");
    setCashCount({
      penny: 0, nickel: 0, dime: 0, quarter: 0, dollarCoin: 0,
      bill1: 0, bill5: 0, bill10: 0, bill20: 0, bill50: 0, bill100: 0,
    });
    setElectronicPayments({
      credomatic: 0, promerica: 0, bankTransfer: 0, paypal: 0,
    });
    
    if (onBack) onBack();
  };

  const renderStoreSelection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-primary mb-2">Paso 1: Información Inicial</h2>
        <p className="text-muted-foreground">Seleccione la sucursal y el personal</p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <MapPin className="w-5 h-5" />
            Sucursal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedStore} onValueChange={setSelectedStore}>
            <SelectTrigger className="bg-input/50 border-primary/30">
              <SelectValue placeholder="Seleccione una sucursal" />
            </SelectTrigger>
            <SelectContent>
              {STORES.map(store => (
                <SelectItem key={store.id} value={store.id}>
                  <div>
                    <div className="font-medium">{store.name}</div>
                    <div className="text-sm text-muted-foreground">{store.address}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-secondary">
            <Users className="w-5 h-5" />
            Personal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="cashier" className="text-sm font-medium mb-2 block">
              Cajero/a
            </Label>
            <Select value={selectedCashier} onValueChange={setSelectedCashier} disabled={!selectedStore}>
              <SelectTrigger className="bg-input/50 border-primary/30">
                <SelectValue placeholder="Seleccione el cajero" />
              </SelectTrigger>
              <SelectContent>
                {availableEmployees.map(employee => (
                  <SelectItem key={employee.id} value={employee.id}>
                    <div>
                      <div className="font-medium">{employee.name}</div>
                      <div className="text-sm text-muted-foreground">{employee.role}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="witness" className="text-sm font-medium mb-2 block">
              Testigo
            </Label>
            <Select value={selectedWitness} onValueChange={setSelectedWitness} disabled={!selectedStore}>
              <SelectTrigger className="bg-input/50 border-primary/30">
                <SelectValue placeholder="Seleccione el testigo" />
              </SelectTrigger>
              <SelectContent>
                {availableEmployees
                  .filter(emp => emp.id !== selectedCashier)
                  .map(employee => (
                    <SelectItem key={employee.id} value={employee.id}>
                      <div>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-muted-foreground">{employee.role}</div>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCashier === selectedWitness && selectedCashier && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
              <p className="text-destructive text-sm">
                ⚠️ El cajero y el testigo deben ser personas diferentes (protocolo anti-fraude)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-success">
            <DollarSign className="w-5 h-5" />
            Venta Esperada del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={expectedSales}
              onChange={(e) => setExpectedSales(e.target.value)}
              placeholder="0.00"
              className="pl-8 bg-input/50 border-primary/30 focus:border-primary"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1 border-muted hover:bg-muted/50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <Button
          onClick={() => setCurrentStep(2)}
          disabled={!canProceedToStep2}
          className="flex-1 bg-gradient-aqua hover:scale-105 transform transition-all duration-300 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          Continuar al Conteo
          <DollarSign className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );

  const renderCashCounting = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-primary mb-2">Paso 2: Conteo de Efectivo</h2>
        <p className="text-muted-foreground">Ingrese las cantidades físicas (no valores)</p>
      </div>

      {/* Coins Section */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-warning">
            <div className="w-6 h-6 cash-coin rounded-full"></div>
            Monedas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(DENOMINATIONS.COINS).map(([key, denom]) => (
              <div key={key} className="space-y-2">
                <Label className="text-sm font-medium">{denom.name}</Label>
                <Input
                  type="number"
                  min="0"
                  value={cashCount[key as keyof typeof cashCount]}
                  onChange={(e) => handleCashCountChange(key, e.target.value)}
                  placeholder="0"
                  className="bg-input/50 border-warning/30 focus:border-warning text-center"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bills Section */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-success">
            <div className="w-8 h-5 cash-bill rounded"></div>
            Billetes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {Object.entries(DENOMINATIONS.BILLS).map(([key, denom]) => (
              <div key={key} className="space-y-2">
                <Label className="text-sm font-medium">{denom.name}</Label>
                <Input
                  type="number"
                  min="0"
                  value={cashCount[key as keyof typeof cashCount]}
                  onChange={(e) => handleCashCountChange(key, e.target.value)}
                  placeholder="0"
                  className="bg-input/50 border-success/30 focus:border-success text-center"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Electronic Payments */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-secondary">
            <CreditCard className="w-5 h-5" />
            Pagos Electrónicos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Credomatic</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={electronicPayments.credomatic}
                  onChange={(e) => handleElectronicChange('credomatic', e.target.value)}
                  placeholder="0.00"
                  className="pl-8 bg-input/50 border-secondary/30 focus:border-secondary"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Promerica</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={electronicPayments.promerica}
                  onChange={(e) => handleElectronicChange('promerica', e.target.value)}
                  placeholder="0.00"
                  className="pl-8 bg-input/50 border-secondary/30 focus:border-secondary"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Transferencia</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={electronicPayments.bankTransfer}
                  onChange={(e) => handleElectronicChange('bankTransfer', e.target.value)}
                  placeholder="0.00"
                  className="pl-8 bg-input/50 border-secondary/30 focus:border-secondary"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">PayPal</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={electronicPayments.paypal}
                  onChange={(e) => handleElectronicChange('paypal', e.target.value)}
                  placeholder="0.00"
                  className="pl-8 bg-input/50 border-secondary/30 focus:border-secondary"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button
          onClick={() => setCurrentStep(1)}
          variant="outline"
          className="flex-1 border-muted hover:bg-muted/50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <Button
          onClick={() => setCurrentStep(3)}
          className="flex-1 bg-gradient-aqua hover:scale-105 transform transition-all duration-300 text-white font-semibold"
        >
          <Calculator className="w-4 h-4 mr-2" />
          Calcular Totales
        </Button>
      </div>
    </motion.div>
  );

  if (currentStep === 3) {
    return (
      <CashCalculation
        storeId={selectedStore}
        cashierId={selectedCashier}
        witnessId={selectedWitness}
        expectedSales={parseFloat(expectedSales)}
        cashCount={cashCount}
        electronicPayments={electronicPayments}
        onBack={() => setCurrentStep(2)}
        onComplete={handleCompleteCalculation}
      />
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingOrbs />
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {currentStep === 1 && renderStoreSelection()}
        {currentStep === 2 && renderCashCounting()}
      </div>
    </div>
  );
};

export default CashCounter;