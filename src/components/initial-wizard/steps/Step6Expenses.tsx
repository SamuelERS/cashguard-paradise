// 🤖 [IA] - ORDEN #075: Step 6 - Gastos del Día
import { DollarSign } from 'lucide-react';
import { DailyExpensesManager } from '@/components/cash-counting/expenses/DailyExpensesManager';
import { Textarea } from '@/components/ui/textarea';
import type { Step6Props } from '@/types/initialWizard';

export function Step6Expenses({ wizardData, updateWizardData, completionError }: Step6Props) {
  const requiereMotivoNuevoCorte = (completionError ?? '')
    .toLowerCase()
    .includes('ya existe un corte finalizado para hoy');
  const motivoNuevoCorte = wizardData.motivo_nuevo_corte ?? '';
  const motivoValido = motivoNuevoCorte.trim().length > 0;

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

      <div className="glass-morphism-panel border-l-4 border-l-blue-500 shadow-lg shadow-blue-500/20 space-y-fluid-sm">
        <h4 className="font-semibold text-blue-400 text-fluid-sm">
          Justificación para Nuevo Corte
        </h4>
        <p className="text-fluid-xs text-muted-foreground">
          Complete este campo solo si el sistema detecta un corte FINALIZADO hoy.
        </p>
        <Textarea
          id="motivo-nuevo-corte"
          value={motivoNuevoCorte}
          onChange={(event) => updateWizardData({ motivo_nuevo_corte: event.target.value })}
          placeholder="Ejemplo: Se requiere reconteo por discrepancia en cierre anterior."
          aria-label="Motivo para crear un nuevo corte"
          className="bg-background/40 border-slate-600 text-primary-foreground placeholder:text-muted-foreground min-h-[90px]"
        />
        {requiereMotivoNuevoCorte && !motivoValido && (
          <p className="text-fluid-xs text-red-300">
            Debe ingresar una justificación para continuar.
          </p>
        )}
      </div>

      <div className="glass-morphism-panel border-l-4 border-l-amber-500 shadow-lg shadow-amber-500/20">
        <p className="text-fluid-xs text-muted-foreground">
          💡 <strong>Tip:</strong> Si no hubo gastos hoy, puede continuar directamente sin agregar ninguno.
        </p>
      </div>
    </div>
  );
}
