// 🤖 [IA] - ORDEN #075: Step 1 - Protocolo Anti-Fraude (Flujo Guiado)
import { currentProtocolRules } from '@/config/flows/initialWizardFlow';
import { ProtocolRule } from '@/components/wizards/ProtocolRule';
import type { Step1Props } from '@/types/initialWizard';

export function Step1ProtocolRules({
  rulesFlowState,
  getRuleState,
  handleRuleAcknowledge,
}: Step1Props) {
  return (
    <div className="glass-morphism-panel space-y-fluid-lg">
      <div className="flex flex-col gap-fluid-lg">
        {currentProtocolRules.map((rule, index) => (
          <ProtocolRule
            key={rule.id}
            rule={rule}
            state={getRuleState(rule.id)}
            isCurrent={index === rulesFlowState.currentRuleIndex}
            onAcknowledge={() => handleRuleAcknowledge(rule.id, index)}
          />
        ))}
      </div>
    </div>
  );
}
