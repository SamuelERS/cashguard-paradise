// 🤖 [IA] - ORDEN #075: Step 2 - Selección de Sucursal
import { motion } from 'framer-motion';
import { MapPin, CheckCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Step2Props } from '@/types/initialWizard';

export function Step2StoreSelection({ wizardData, updateWizardData, availableStores }: Step2Props) {
  return (
    <div className="glass-morphism-panel space-y-fluid-lg">
      <div className="glass-morphism-panel header-section">
        <MapPin className="flex-shrink-0 w-[clamp(1.5rem,6vw,2rem)] h-[clamp(1.5rem,6vw,2rem)] bg-gradient-to-br from-blue-500 to-purple-500 bg-clip-text text-transparent" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-primary-foreground text-fluid-xl">Ubicación</h3>
          <p className="text-muted-foreground text-fluid-xs mt-fluid-xs">Sucursal del corte</p>
        </div>
      </div>

      <Select
        value={wizardData.selectedStore}
        onValueChange={(value) => updateWizardData({ selectedStore: value })}
        aria-label="Selección de sucursal para corte de caja"
        aria-required="true"
      >
        <SelectTrigger
          className={cn(
            'wizard-select-trigger w-full',
            'shadow-none border-input transition-all duration-300 ease-in-out',
            'focus:neon-glow-primary data-[state=open]:neon-glow-primary'
          )}
        >
          <SelectValue placeholder="Elegir sucursal" />
        </SelectTrigger>
        <SelectContent className="wizard-select-content">
          {availableStores.map((store) => (
            <SelectItem key={store.id} value={store.id}>
              {store.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {wizardData.selectedStore && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-morphism-panel border border-green-400/40 shadow-lg shadow-green-400/20"
        >
          <div className="flex items-center gap-fluid-md">
            <CheckCircle className="flex-shrink-0 text-green-400 w-[clamp(1rem,4vw,1.25rem)] h-[clamp(1rem,4vw,1.25rem)]" />
            <span className="font-medium text-primary-foreground text-fluid-sm">✓ Seleccionada</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
