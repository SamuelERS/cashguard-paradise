// 🤖 [IA] - ORDEN #075: Step 4 - Selección de Testigo
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Step4Props } from '@/types/initialWizard';

export function Step4WitnessSelection({
  wizardData,
  updateWizardData,
  selectedCashier,
  availableEmployees,
}: Step4Props) {
  return (
    <div className="glass-morphism-panel space-y-fluid-lg">
      <div className="glass-morphism-panel header-section">
        <Shield className="flex-shrink-0 w-[clamp(1.5rem,6vw,2rem)] h-[clamp(1.5rem,6vw,2rem)] text-primary" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-primary-foreground text-fluid-xl">Testigo</h3>
          <p className="text-muted-foreground text-fluid-xs mt-fluid-xs">
            Selecciona quien Ayudara
          </p>
        </div>
      </div>

      <Select
        value={wizardData.selectedWitness}
        onValueChange={(value) => updateWizardData({ selectedWitness: value })}
      >
        <SelectTrigger className="wizard-select-trigger w-full">
          <SelectValue placeholder="Seleccione el testigo" />
        </SelectTrigger>
        <SelectContent className="wizard-select-content">
          {availableEmployees
            .filter(emp => emp.id !== selectedCashier)
            .map((employee) => (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.name}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      {wizardData.selectedWitness === selectedCashier &&
       wizardData.selectedWitness !== '' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-morphism-panel border border-red-500/40 shadow-lg shadow-red-500/20"
        >
          <div className="flex items-center gap-fluid-md">
            <AlertTriangle className="flex-shrink-0 text-red-500 w-[clamp(1rem,4vw,1.25rem)] h-[clamp(1rem,4vw,1.25rem)]" />
            <span className="font-medium text-red-500 text-fluid-sm">
              El cajero y el testigo deben ser personas diferentes
            </span>
          </div>
        </motion.div>
      )}

      {wizardData.selectedWitness &&
       wizardData.selectedWitness !== selectedCashier && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-morphism-panel border border-green-400/40 shadow-lg shadow-green-400/20"
        >
          <div className="flex items-center gap-fluid-md">
            <CheckCircle className="flex-shrink-0 text-green-400 w-[clamp(1rem,4vw,1.25rem)] h-[clamp(1rem,4vw,1.25rem)]" />
            <span className="font-medium text-primary-foreground text-fluid-sm">Testigo seleccionado correctamente</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
