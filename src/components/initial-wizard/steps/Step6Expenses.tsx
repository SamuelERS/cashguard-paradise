// 🤖 [IA] - ORDEN #075: Step 6 - Gastos del Día
import { DollarSign } from 'lucide-react';
import { DailyExpensesManager } from '@/components/cash-counting/expenses/DailyExpensesManager';
import type { WizardStepProps } from '@/types/initialWizard';

export function Step6Expenses({ wizardData, updateWizardData }: WizardStepProps) {
  return (
    <div className="glass-morphism-panel space-y-fluid-lg">
      <div className="glass-morphism-panel header-section">
        <DollarSign className="flex-shrink-0 w-[clamp(1.5rem,6vw,2rem)] h-[clamp(1.5rem,6vw,2rem)] text-amber-400" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-primary-foreground text-fluid-xl">
            💸 Gastos del Día
          </h3>
          <p className="text-muted-foreground text-fluid-xs mt-fluid-xs">
            Registre gastos operacionales (opcional)
          </p>
        </div>
      </div>

      <DailyExpensesManager
        expenses={wizardData.dailyExpenses || []}
        onExpensesChange={(expenses) => updateWizardData({ dailyExpenses: expenses })}
        disabled={false}
        maxExpenses={10}
      />

      <div className="glass-morphism-panel border-l-4 border-l-amber-500 shadow-lg shadow-amber-500/20">
        <p className="text-fluid-xs text-muted-foreground">
          💡 <strong>Tip:</strong> Si no hubo gastos hoy, puede continuar directamente sin agregar ninguno.
        </p>
      </div>
    </div>
  );
}
