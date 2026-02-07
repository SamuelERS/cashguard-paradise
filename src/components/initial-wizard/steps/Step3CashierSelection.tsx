// 🤖 [IA] - ORDEN #075: Step 3 - Selección de Cajero
import { motion } from 'framer-motion';
import { Users, CheckCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Step3Props } from '@/types/initialWizard';

export function Step3CashierSelection({
  wizardData,
  updateWizardData,
  availableEmployees,
}: Step3Props) {
  return (
    <div className="glass-morphism-panel space-y-fluid-lg">
      <div className="glass-morphism-panel header-section">
        <Users
          className="flex-shrink-0 w-[clamp(1.5rem,6vw,2rem)] h-[clamp(1.5rem,6vw,2rem)] bg-gradient-to-br from-blue-500 to-purple-500 bg-clip-text text-transparent"
          aria-label="Icono de cajero responsable"
          role="img"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-primary-foreground text-fluid-xl">Cajero</h3>
          <p className="text-muted-foreground text-fluid-xs mt-fluid-xs">¿Quién Cobró este día?</p>
        </div>
      </div>

      <Select
        value={wizardData.selectedCashier}
        onValueChange={(value) => updateWizardData({ selectedCashier: value })}
      >
        <SelectTrigger className="wizard-select-trigger w-full">
          <SelectValue placeholder="Seleccione el cajero responsable" />
        </SelectTrigger>
        <SelectContent className="wizard-select-content">
          {availableEmployees.map((employee) => (
            <SelectItem key={employee.id} value={employee.id}>
              {employee.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {wizardData.selectedCashier && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-morphism-panel border border-green-400/40 shadow-lg shadow-green-400/20"
        >
          <div className="flex items-center gap-fluid-md">
            <CheckCircle
              className="flex-shrink-0 text-green-400 w-[clamp(1rem,4vw,1.25rem)] h-[clamp(1rem,4vw,1.25rem)]"
              aria-label="Cajero seleccionado correctamente"
            />
            <span className="font-medium text-primary-foreground text-fluid-sm">✓ Cajero seleccionado</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
