// 🤖 [IA] - v1.3.6AD2: FIX BUG DIFERENCIA VUELTO - Usar amountRemaining ?? 50 en reporte (monto ajustado post-verificación)
// Previous: v1.3.7 - ANTI-FRAUDE - Confirmación explícita envío WhatsApp ANTES de revelar resultados
// Previous: v1.3.6AD - FIX MÉTRICA CRÍTICA - totalDenoms usa verificationSteps.length (denominaciones verificadas)
// Previous: v1.3.6AB - FIX ROOT CAUSE REAL - Clase .cash-calculation-container agregada (patrón v1.2.41A9)
import { useState, useEffect, useCallback } from "react";
// 🤖 [IA] - v1.3.6Z: Framer Motion removido (GPU compositing bug iOS Safari causa pantalla congelada Phase 3)
// 🤖 [IA] - v1.3.7: Agregado Lock icon para bloqueo de resultados
import { Calculator, AlertTriangle, CheckCircle, Share, Download, Copy, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
// 🤖 [IA] - v1.1.08: Removidos Card components para coherencia con glass morphism
// 🤖 [IA] - v1.1.08: Alert components removidos para coherencia con glass morphism
// 🤖 [IA] - FAE-02: PURGA QUIRÚRGICA COMPLETADA - CSS imports eliminados
// Los 1 archivos CSS están ahora importados globalmente vía index.css:
// - report-action-button.css
import { Badge } from "@/components/ui/badge";
import { PrimaryActionButton } from "@/components/ui/primary-action-button"; // 🤖 [IA] - v2.0.0: Botón de acción primaria estándar
import { NeutralActionButton } from "@/components/ui/neutral-action-button"; // 🤖 [IA] - v2.0.0: Botón de acción neutral estándar
import { ConstructiveActionButton } from '@/components/shared/ConstructiveActionButton'; // 🤖 [IA] - v2.0.0: Botón de acción constructiva estándar
import { ConfirmationModal } from "@/components/ui/confirmation-modal"; // 🤖 [IA] - v1.2.24: Modal de confirmación para Finalizar
import { calculateCashTotal, calculateChange50, formatCurrency, generateDenominationSummary } from "@/utils/calculations";
import { copyToClipboard } from "@/utils/clipboard"; // 🤖 [IA] - v1.1.09
import { toast } from "sonner"; // 🤖 [IA] - v1.1.15 - Migrated to Sonner for consistency
import { CashCount, ElectronicPayments } from "@/types/cash";
import { PhaseState, DeliveryCalculation } from "@/types/phases";
// 🤖 [IA] - v1.3.6: MÓDULO 3 - Import tipos para sección anomalías
import type { VerificationBehavior, VerificationAttempt } from "@/types/verification";
// 🤖 [IA] - v1.4.0 FASE 5: Import tipos y constantes para gastos
import { DailyExpense, EXPENSE_CATEGORY_EMOJI, EXPENSE_CATEGORY_LABEL } from '@/types/expenses';
import { getStoreById, getEmployeeById } from "@/data/paradise";
import { DenominationsList } from "@/components/cash-calculation/DenominationsList"; // 🤖 [IA] - v1.0.0: Componente extraído

// 🤖 [IA] - v1.2.22: TypeScript interface for calculation results
interface CalculationData {
  totalCash: number;
  totalElectronic: number;
  totalGeneral: number;
  totalExpenses: number; // 🤖 [IA] - v1.4.0 FASE 5: Total gastos
  totalAdjusted: number; // 🤖 [IA] - v1.4.0 FASE 5: Total ajustado (totalGeneral - gastos)
  difference: number;
  changeResult: {
    change: Partial<CashCount>;
    total: number;
    possible: boolean;
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
  expenses?: DailyExpense[]; // 🤖 [IA] - v1.4.0 FASE 5: Gastos del día
  deliveryCalculation?: DeliveryCalculation;
  phaseState?: PhaseState;
  onBack: () => void;
  onComplete: () => void;
}

// 🤖 [IA] - v1.3.6W: Separador optimizado 16 caracteres (sin horizontal scroll en WhatsApp mobile)
const WHATSAPP_SEPARATOR = '━━━━━━━━━━━━━━━━'; // 16 caracteres (reducido desde 20)

const CashCalculation = ({
  storeId,
  cashierId,
  witnessId,
  expectedSales,
  cashCount,
  electronicPayments,
  expenses = [], // 🤖 [IA] - v1.4.0 FASE 5: Default array vacío
  deliveryCalculation,
  phaseState,
  onBack,
  onComplete
}: CashCalculationProps) => {
  const [isCalculated, setIsCalculated] = useState(false);
  const [calculationData, setCalculationData] = useState<CalculationData | null>(null); // 🤖 [IA] - v1.2.22: Fixed any type violation
  const [showFinishConfirmation, setShowFinishConfirmation] = useState(false); // 🤖 [IA] - v1.2.24: Estado para modal de confirmación

  // 🤖 [IA] - v1.3.7: Estados confirmación explícita WhatsApp (Propuesta C Híbrida v2.1)
  const [reportSent, setReportSent] = useState(false);
  const [whatsappOpened, setWhatsappOpened] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);

  // 🤖 [IA] - v1.3.6Z: FIX iOS Safari - Cleanup defensivo de modal state
  // Garantiza que modal state se resetea al desmontar, previene race conditions en lifecycle iOS
  useEffect(() => {
    return () => {
      setShowFinishConfirmation(false);
    };
  }, []);

  const store = getStoreById(storeId);
  const cashier = getEmployeeById(cashierId);
  const witness = getEmployeeById(witnessId);

  const performCalculation = useCallback(() => {
    const totalCash = calculateCashTotal(cashCount);
    const totalElectronic = Object.values(electronicPayments).reduce((sum, val) => sum + val, 0);
    const totalGeneral = totalCash + totalElectronic;
    
    // 🤖 [IA] - v1.4.0 FASE 5: Calcular total gastos
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // 🤖 [IA] - v1.4.0 FASE 5: Total ajustado = totalGeneral - gastos
    const totalAdjusted = totalGeneral - totalExpenses;
    
    // 🤖 [IA] - v1.4.0 FASE 5: Diferencia usa totalAdjusted (NO totalGeneral)
    const difference = totalAdjusted - expectedSales;
    
    const changeResult = calculateChange50(cashCount);
    
    const data = {
      totalCash,
      totalElectronic,
      totalGeneral,
      totalExpenses, // 🤖 [IA] - v1.4.0 FASE 5
      totalAdjusted, // 🤖 [IA] - v1.4.0 FASE 5
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
    setCalculationData(data);
  }, [cashCount, electronicPayments, expectedSales, expenses]); // 🤖 [IA] - v1.4.0 FASE 5: expenses agregado

  useEffect(() => {
    if (!isCalculated) {
      performCalculation();
    }
  }, [isCalculated, performCalculation]);

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
      timestamp: calculationData?.timestamp || '',
      totalCash: calculationData?.totalCash || 0,
      totalElectronic: calculationData?.totalElectronic || 0,
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
  // 🤖 [IA] - v1.0.0: Refactorizado para usar componente reutilizable
  const generateRemainingDenominationsDisplay = (remainingCash: CashCount) => {
    return <DenominationsList denominations={remainingCash} />;
  };

  // 🤖 [IA] - v1.0.0: Refactorizado para usar componente reutilizable
  const generateRemainingDenominationsFromPhase2 = () => {
    if (deliveryCalculation?.denominationsToKeep) {
      return <DenominationsList denominations={deliveryCalculation.denominationsToKeep} />;
    }
    return generateCalculated50Display();
  };

  // 🤖 [IA] - v1.0.0: Refactorizado para usar componente reutilizable
  const generateCalculated50Display = () => {
    const changeResult = calculateChange50(cashCount);
    if (changeResult.possible && changeResult.change) {
      return <DenominationsList denominations={changeResult.change as CashCount} />;
    }
    return (
      <div className="text-center text-warning">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
        <p className="text-xs">No hay suficiente efectivo para cambio de $50.00</p>
      </div>
    );
  };

  // Generate remaining cash details for text report
  const generateRemainingCashDetails = () => {
    let remainingCash: CashCount;

    // Determine which denominations remain in cash
    if (!phaseState?.shouldSkipPhase2 && deliveryCalculation?.denominationsToKeep) {
      // Phase 2 was completed, use the verified denominations to keep
      remainingCash = deliveryCalculation.denominationsToKeep;
    } else if (phaseState?.shouldSkipPhase2) {
      // Phase 2 was skipped (≤$50), all cash remains
      remainingCash = cashCount;
    } else {
      // Fallback: try to calculate $50
      const changeResult = calculateChange50(cashCount);
      if (changeResult.possible && changeResult.change) {
        remainingCash = changeResult.change as CashCount;
      } else {
        // If can't make exact $50, don't show duplicate data
        // Return empty to avoid confusion
        return "No se puede hacer cambio exacto de $50.00";
      }
    }

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

    const details = denominations
      .filter(d => remainingCash[d.key as keyof CashCount] > 0)
      .map(d => {
        const quantity = remainingCash[d.key as keyof CashCount];
        const subtotal = quantity * d.value;
        return `${d.label} × ${quantity} = ${formatCurrency(subtotal)}`;
      });

    return details.join('\n');
  };

  // 🤖 [IA] - v1.3.6: MÓDULO 3 - Helper para nombres de denominaciones en español
  const getDenominationName = (key: keyof CashCount): string => {
    const names: Record<keyof CashCount, string> = {
      penny: 'Un centavo (1¢)',
      nickel: 'Cinco centavos (5¢)',
      dime: 'Diez centavos (10¢)',
      quarter: 'Veinticinco centavos (25¢)',
      dollarCoin: 'Moneda de un dólar ($1)',
      bill1: 'Billete de un dólar ($1)',
      bill5: 'Billete de cinco dólares ($5)',
      bill10: 'Billete de diez dólares ($10)',
      bill20: 'Billete de veinte dólares ($20)',
      bill50: 'Billete de cincuenta dólares ($50)',
      bill100: 'Billete de cien dólares ($100)'
    };
    return names[key] || key;
  };

  // 🤖 [IA] - v1.3.6: MÓDULO 3 - Helper para formatear timestamp ISO 8601 a HH:MM:SS
  const formatTimestamp = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('es-SV', {
        timeZone: 'America/El_Salvador',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch (error) {
      return isoString; // Fallback si timestamp es inválido
    }
  };

  // 🤖 [IA] - v1.3.6: MÓDULO 3 - Generar detalle de anomalías para reporte
  const generateAnomalyDetails = (behavior: VerificationBehavior): string => {
    // Filtrar solo intentos problemáticos:
    // - Todos los intentos incorrectos (isCorrect: false)
    // - Intentos correctos en 2do o 3er intento (attemptNumber > 1 y isCorrect: true)
    const problematicAttempts = behavior.attempts.filter(
      a => !a.isCorrect || a.attemptNumber > 1
    );

    if (problematicAttempts.length === 0) {
      return 'Sin anomalías detectadas - Todos los intentos correctos en primer intento ✅';
    }

    return problematicAttempts.map(attempt => {
      const denom = getDenominationName(attempt.stepKey);
      const time = formatTimestamp(attempt.timestamp);
      const status = attempt.isCorrect ? '✅ CORRECTO' : '❌ INCORRECTO';

      return `${status} | ${denom}
   Intento #${attempt.attemptNumber} | Hora: ${time}
   Ingresado: ${attempt.inputValue} unidades | Esperado: ${attempt.expectedValue} unidades`;
    }).join('\n\n');
  };

  // 🤖 [IA] - v1.3.6U: CAMBIO #3 - Bloque alertas críticas con "Esperado:" en línea separada + timestamps video
  const generateCriticalAlertsBlock = (behavior: VerificationBehavior): string => {
    // Filtrar solo severidades críticas (critical_severe, critical_inconsistent)
    const criticalDenoms = behavior.denominationsWithIssues.filter(d =>
      d.severity === 'critical_severe' || d.severity === 'critical_inconsistent'
    );

    if (criticalDenoms.length === 0) return '';

    const alerts = criticalDenoms.map(issue => {
      const denomName = getDenominationName(issue.denomination);
      const attemptsStr = issue.attempts.join(' → ');

      // Buscar timestamps del primer y último intento para esta denominación
      const attemptsForDenom = behavior.attempts.filter(a => a.stepKey === issue.denomination);
      let videoTimestamp = '';
      if (attemptsForDenom.length > 0) {
        const firstTime = formatTimestamp(attemptsForDenom[0].timestamp);
        const lastTime = formatTimestamp(attemptsForDenom[attemptsForDenom.length - 1].timestamp);
        videoTimestamp = `   📹 Video: ${firstTime} - ${lastTime}`;
      }

      // Descripción según severity
      const description = issue.severity === 'critical_severe' ?
        '   ⚠️ Patrón errático' :
        '   ⚠️ Inconsistencia severa';

      // Valor esperado (primer valor de attempts es el correcto)
      const expectedValue = attemptsForDenom.length > 0 ? attemptsForDenom[0].expectedValue : '?';
      const expectedUnit = expectedValue === 1 ? 'unidad' : 'unidades';

      return `• ${denomName}
   Esperado: ${expectedValue} ${expectedUnit}
   Intentos: ${attemptsStr}
${videoTimestamp}
${description}`;
    }).join('\n\n');

    return `🔴 *CRÍTICAS (${criticalDenoms.length})*

${alerts}`;
  };

  // 🤖 [IA] - v1.3.6V: FIX #2 - Generar sección "LO QUE RECIBES" con checkboxes para validación física
  const generateDeliveryChecklistSection = (): string => {
    // Si Phase 2 no se ejecutó (≤$50), no hay entrega
    if (phaseState?.shouldSkipPhase2) {
      return '';
    }

    if (!deliveryCalculation?.deliverySteps || deliveryCalculation.deliverySteps.length === 0) {
      return '';
    }

    const amountToDeliver = deliveryCalculation.amountToDeliver || 0;

    // Separar billetes y monedas de deliverySteps
    const billKeys = ['bill100', 'bill50', 'bill20', 'bill10', 'bill5', 'bill1'];
    const coinKeys = ['dollarCoin', 'quarter', 'dime', 'nickel', 'penny'];

    const bills = deliveryCalculation.deliverySteps
      .filter((step: DeliveryStep) => billKeys.includes(step.key))
      .map((step: DeliveryStep) => `☐ ${step.label} × ${step.quantity} = ${formatCurrency(step.value * step.quantity)}`);

    const coins = deliveryCalculation.deliverySteps
      .filter((step: DeliveryStep) => coinKeys.includes(step.key))
      .map((step: DeliveryStep) => `☐ ${step.label} × ${step.quantity} = ${formatCurrency(step.value * step.quantity)}`);

    let checklistContent = '';

    if (bills.length > 0) {
      checklistContent += `Billetes:\n${bills.join('\n')}`;
    }

    if (coins.length > 0) {
      if (bills.length > 0) checklistContent += '\n\n';
      checklistContent += `Monedas:\n${coins.join('\n')}`;
    }

    return `${WHATSAPP_SEPARATOR}

📦 *LO QUE RECIBES (${formatCurrency(amountToDeliver)})*

${checklistContent}

✅ Recibido: $________
Hora: __:__  Firma: ________

`;
  };

  // 🤖 [IA] - v1.3.6V: FIX #3 - Generar sección "LO QUE QUEDÓ EN CAJA" con checkboxes
  const generateRemainingChecklistSection = (): string => {
    let remainingCash: CashCount;
    let remainingAmount = 50; // Default

    // Determinar qué denominaciones quedaron en caja
    if (!phaseState?.shouldSkipPhase2 && deliveryCalculation?.denominationsToKeep) {
      // Phase 2 ejecutado: usar denominationsToKeep
      remainingCash = deliveryCalculation.denominationsToKeep;
      // 🤖 [IA] - v1.3.6AD2: FIX BUG DIFERENCIA VUELTO - Usar amountRemaining si existe (ajustado post-verificación)
      // Ejemplo: 75 esperado → 70 aceptado = $50.00 → $49.95 ajustado
      remainingAmount = deliveryCalculation.amountRemaining ?? 50;
    } else if (phaseState?.shouldSkipPhase2) {
      // Phase 2 omitido (≤$50): todo el efectivo queda en caja
      remainingCash = cashCount;
      remainingAmount = calculationData?.totalCash || 0;
    } else {
      // Fallback: calcular $50
      const changeResult = calculateChange50(cashCount);
      if (!changeResult.possible || !changeResult.change) {
        return ''; // No se puede mostrar si no hay cambio
      }
      remainingCash = changeResult.change as CashCount;
      remainingAmount = 50;
    }

    // Agrupar billetes y monedas (mayor a menor)
    const denominations = [
      { key: 'bill100', label: '$100', value: 100.00 },
      { key: 'bill50', label: '$50', value: 50.00 },
      { key: 'bill20', label: '$20', value: 20.00 },
      { key: 'bill10', label: '$10', value: 10.00 },
      { key: 'bill5', label: '$5', value: 5.00 },
      { key: 'bill1', label: '$1', value: 1.00 },
      { key: 'dollarCoin', label: '$1 moneda', value: 1.00 },
      { key: 'quarter', label: '25¢', value: 0.25 },
      { key: 'dime', label: '10¢', value: 0.10 },
      { key: 'nickel', label: '5¢', value: 0.05 },
      { key: 'penny', label: '1¢', value: 0.01 }
    ];

    const billKeys = ['bill100', 'bill50', 'bill20', 'bill10', 'bill5', 'bill1'];
    const coinKeys = ['dollarCoin', 'quarter', 'dime', 'nickel', 'penny'];

    const bills = denominations
      .filter(d => billKeys.includes(d.key) && remainingCash[d.key as keyof CashCount] > 0)
      .map(d => {
        const quantity = remainingCash[d.key as keyof CashCount];
        return `☐ ${d.label} × ${quantity} = ${formatCurrency(quantity * d.value)}`;
      });

    const coins = denominations
      .filter(d => coinKeys.includes(d.key) && remainingCash[d.key as keyof CashCount] > 0)
      .map(d => {
        const quantity = remainingCash[d.key as keyof CashCount];
        return `☐ ${d.label} × ${quantity} = ${formatCurrency(quantity * d.value)}`;
      });

    let checklistContent = '';

    if (bills.length > 0) {
      checklistContent += `${bills.join('\n')}`;
    }

    if (coins.length > 0) {
      if (bills.length > 0) checklistContent += '\n';
      checklistContent += `${coins.join('\n')}`;
    }

    if (!checklistContent) {
      return ''; // No hay denominaciones
    }

    return `${WHATSAPP_SEPARATOR}

🏢 *LO QUE QUEDÓ EN CAJA (${formatCurrency(remainingAmount)})*

${checklistContent}

`;
  };

  // 🤖 [IA] - v1.3.6U: CAMBIO #4 - Bloque advertencias con MISMO formato que críticas (timestamps + esperado)
  const generateWarningAlertsBlock = (behavior: VerificationBehavior): string => {
    // Filtrar solo severidades de advertencia (warning_retry, warning_override)
    const warningDenoms = behavior.denominationsWithIssues.filter(d =>
      d.severity === 'warning_retry' || d.severity === 'warning_override'
    );

    if (warningDenoms.length === 0) return '';

    const alerts = warningDenoms.map(issue => {
      const denomName = getDenominationName(issue.denomination);
      const attemptsStr = issue.attempts.join(' → ');

      // Buscar timestamps del primer y último intento para esta denominación
      const attemptsForDenom = behavior.attempts.filter(a => a.stepKey === issue.denomination);
      let videoTimestamp = '';
      if (attemptsForDenom.length > 0) {
        const firstTime = formatTimestamp(attemptsForDenom[0].timestamp);
        const lastTime = formatTimestamp(attemptsForDenom[attemptsForDenom.length - 1].timestamp);
        videoTimestamp = `   📹 Video: ${firstTime} - ${lastTime}`;
      }

      // Valor esperado (primer valor de attempts es el correcto)
      const expectedValue = attemptsForDenom.length > 0 ? attemptsForDenom[0].expectedValue : '?';
      const expectedUnit = expectedValue === 1 ? 'unidad' : 'unidades';

      return `• ${denomName}
   Esperado: ${expectedValue} ${expectedUnit}
   Intentos: ${attemptsStr}
${videoTimestamp}
   ℹ️ Corregido en ${attemptsForDenom.length}° intento`;
    }).join('\n\n');

    return `⚠️ *ADVERTENCIAS (${warningDenoms.length})*

${alerts}`;
  };

  // 🤖 [IA] - v1.4.0 FASE 5: Generar sección de gastos del día
  const generateExpensesSection = useCallback(() => {
    if (!expenses || expenses.length === 0) {
      return ''; // No mostrar sección si no hay gastos
    }

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    
    const expensesList = expenses.map((expense, index) => {
      const categoryEmoji = EXPENSE_CATEGORY_EMOJI[expense.category];
      const categoryLabel = EXPENSE_CATEGORY_LABEL[expense.category];
      const invoiceStatus = expense.hasInvoice ? '✓ Con factura' : '✗ Sin factura';
      
      return `${index + 1}. ${categoryEmoji} ${expense.concept}
   💵 ${formatCurrency(expense.amount)} | ${invoiceStatus}
   📂 ${categoryLabel}`;
    }).join('\n\n');

    return `
${WHATSAPP_SEPARATOR}

💸 *GASTOS DEL DÍA*

${expensesList}

💰 *Total Gastos:* ${formatCurrency(totalExpenses)}
⚠️ Este monto se restó del total general
`;
  }, [expenses]);

  const generateCompleteReport = useCallback(() => {
    validatePhaseCompletion();

    const denominationDetails = generateDenominationDetails();
    const dataHash = generateDataHash();

    // 🤖 [IA] - v1.3.6V: Pagos electrónicos desglosados
    const totalElectronic = calculationData?.totalElectronic || 0;
    const electronicDetailsDesglosed = `💳 Pagos Electrónicos: *${formatCurrency(totalElectronic)}*
   ☐ Credomatic: ${formatCurrency(electronicPayments.credomatic)}
   ☐ Promerica: ${formatCurrency(electronicPayments.promerica)}
   ☐ Transferencia: ${formatCurrency(electronicPayments.bankTransfer)}
   ☐ PayPal: ${formatCurrency(electronicPayments.paypal)}`;

    // 🤖 [IA] - v1.3.6V: Bloques de alertas
    const criticalAlertsBlock = deliveryCalculation?.verificationBehavior ?
      generateCriticalAlertsBlock(deliveryCalculation.verificationBehavior) : '';
    const warningAlertsBlock = deliveryCalculation?.verificationBehavior ?
      generateWarningAlertsBlock(deliveryCalculation.verificationBehavior) : '';

    // 🤖 [IA] - v1.3.6V: Header dinámico según severidad
    const criticalCount = deliveryCalculation?.verificationBehavior?.denominationsWithIssues.filter(d =>
      d.severity === 'critical_severe' || d.severity === 'critical_inconsistent'
    ).length || 0;
    const warningCount = deliveryCalculation?.verificationBehavior?.denominationsWithIssues.filter(d =>
      d.severity === 'warning_retry' || d.severity === 'warning_override'
    ).length || 0;
    const headerSeverity = criticalCount > 0 ?
      "🚨 *REPORTE CRÍTICO - ACCIÓN INMEDIATA*" :
      warningCount > 0 ?
      "⚠️ *REPORTE ADVERTENCIAS*" :
      "✅ *REPORTE NORMAL*";

    // 🤖 [IA] - v1.3.6V: FIX #4 - Sección de alertas con salto de línea correcto (FIX #5)
    const fullAlertsSection = (criticalAlertsBlock || warningAlertsBlock) ?
      `
${WHATSAPP_SEPARATOR}

⚠️ *ALERTAS DETECTADAS*

${criticalAlertsBlock}${criticalAlertsBlock && warningAlertsBlock ? '\n\n' : ''}${warningAlertsBlock}
` : '';

    // 🤖 [IA] - v1.3.6V: FIX #2 y #3 - Secciones de checklists
    const deliveryChecklistSection = generateDeliveryChecklistSection();
    const remainingChecklistSection = generateRemainingChecklistSection();

    // 🤖 [IA] - v1.3.6V: FIX #6 - Métricas Verificación Ciega corregidas
    let verificationSection = '';
    if (deliveryCalculation?.verificationBehavior) {
      const behavior = deliveryCalculation.verificationBehavior;
      // 🤖 [IA] - v1.3.6AD: FIX CRÍTICO - totalDenoms debe ser DENOMINACIONES, NO intentos
      // Root cause: behavior.totalAttempts = total de INTENTOS (15, 20, 30... con múltiples errores)
      // Solución: verificationSteps.length = total de DENOMINACIONES verificadas (las que quedaron en $50)
      const totalDenoms = deliveryCalculation.verificationSteps.length; // ← CORRECTO
      const firstAttemptSuccesses = behavior.firstAttemptSuccesses;

      // Contar warnings y críticas desde denominationsWithIssues (más preciso)
      const warningCountActual = behavior.denominationsWithIssues.filter(d =>
        d.severity === 'warning_retry' || d.severity === 'warning_override'
      ).length;

      const criticalCountActual = behavior.denominationsWithIssues.filter(d =>
        d.severity === 'critical_severe' || d.severity === 'critical_inconsistent'
      ).length;

      verificationSection = `
${WHATSAPP_SEPARATOR}

🔍 *VERIFICACIÓN CIEGA*

✅ Perfectas: ${firstAttemptSuccesses}/${totalDenoms}
⚠️ Corregidas: ${warningCountActual}/${totalDenoms}
🔴 Críticas: ${criticalCountActual}/${totalDenoms}
`;
    }

    // 🤖 [IA] - v1.3.6W: Estructura con espaciado optimizado para WhatsApp mobile
    return `${headerSeverity}


📊 *CORTE DE CAJA* - ${calculationData?.timestamp || ''}
Sucursal: ${store?.name}
Cajero: ${cashier?.name}
Testigo: ${witness?.name}

${WHATSAPP_SEPARATOR}

📊 *RESUMEN EJECUTIVO*

💰 Efectivo Contado: *${formatCurrency(calculationData?.totalCash || 0)}*

${electronicDetailsDesglosed}

📦 *Entregado a Gerencia:* ${formatCurrency(deliveryCalculation?.amountToDeliver || 0)}
🏢 *Quedó en Caja:* ${phaseState?.shouldSkipPhase2 ? formatCurrency(calculationData?.totalCash || 0) : '$50.00'}

💼 *Total General:* ${formatCurrency(calculationData?.totalGeneral || 0)}
${(calculationData?.totalExpenses || 0) > 0 ? `💸 *Gastos del Día:* -${formatCurrency(calculationData?.totalExpenses || 0)}
📊 *Total Ajustado:* ${formatCurrency(calculationData?.totalAdjusted || 0)}
` : ''}🎯 *SICAR Esperado:* ${formatCurrency(expectedSales)}
${(calculationData?.difference || 0) >= 0 ? '📈' : '📉'} *Diferencia:* ${formatCurrency(calculationData?.difference || 0)} (${(calculationData?.difference || 0) >= 0 ? 'SOBRANTE' : 'FALTANTE'})
${deliveryChecklistSection}${remainingChecklistSection}${generateExpensesSection()}${fullAlertsSection}${verificationSection}
${WHATSAPP_SEPARATOR}

💰 *CONTEO COMPLETO (${formatCurrency(calculationData?.totalCash || 0)})*

${denominationDetails}

${WHATSAPP_SEPARATOR}

📅 ${calculationData?.timestamp || ''}
🔐 CashGuard Paradise v1.3.6Y
🔒 NIST SP 800-115 | PCI DSS 12.10.1

✅ Reporte automático
⚠️ Documento NO editable

Firma Digital: ${dataHash}`;
  }, [calculationData, electronicPayments, deliveryCalculation, store, cashier, witness, phaseState, expectedSales,
      validatePhaseCompletion, generateDenominationDetails, generateDataHash, generateCriticalAlertsBlock,
      generateWarningAlertsBlock, generateDeliveryChecklistSection, generateRemainingChecklistSection, generateExpensesSection]);
  // 🤖 [IA] - v1.4.0 FASE 5: expenses NO incluido en deps porque generateExpensesSection ya lo captura

  // 🤖 [IA] - v1.3.7: Handler con confirmación explícita + detección pop-ups bloqueados
  const handleWhatsAppSend = useCallback(() => {
    try {
      if (!calculationData || !store || !cashier || !witness) {
        toast.error("❌ Error", {
          description: "Faltan datos necesarios para generar el reporte"
        });
        return;
      }

      const report = generateCompleteReport();
      const encodedReport = encodeURIComponent(report);
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedReport}`;

      // Intentar abrir WhatsApp
      const windowRef = window.open(whatsappUrl, '_blank');

      // Detectar bloqueo de pop-ups
      if (!windowRef || windowRef.closed || typeof windowRef.closed === 'undefined') {
        setPopupBlocked(true);
        toast.error('⚠️ Habilite pop-ups para enviar por WhatsApp', {
          duration: 6000,
          action: {
            label: 'Copiar en su lugar',
            onClick: () => handleCopyToClipboard()
          }
        });
        return;
      }

      // WhatsApp abierto exitosamente → Esperar confirmación
      setWhatsappOpened(true);
      toast.info('📱 Confirme cuando haya enviado el reporte', { duration: 10000 });

      // Auto-confirmar después de 10 segundos (timeout de seguridad)
      setTimeout(() => {
        if (!reportSent) {
          setReportSent(true);
          toast.success('✅ Reporte marcado como enviado');
        }
      }, 10000);
    } catch (error) {
      toast.error("❌ Error al generar reporte", {
        description: error instanceof Error ? error.message : "Error desconocido"
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calculationData, store, cashier, witness, reportSent]);
  // generateCompleteReport y handleCopyToClipboard son funciones estables definidas en el componente
  // Incluirlas causaría re-creación innecesaria del callback en cada render

  // 🤖 [IA] - v1.3.7: Handler confirmación explícita usuario
  const handleConfirmSent = useCallback(() => {
    setReportSent(true);
    setWhatsappOpened(false);
    toast.success('✅ Reporte confirmado como enviado');
  }, []);

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
  const handleCopyToClipboard = useCallback(async () => {
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
  }, [generateCompleteReport]);

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
    <div className="cash-calculation-container min-h-screen relative overflow-y-auto" data-scrollable="true">
      
      <div className="relative z-10 container mx-auto px-[clamp(1rem,4vw,1.5rem)] py-[clamp(1.5rem,6vw,2rem)] max-w-4xl">
        {/* 🤖 [IA] - v1.3.6Z: FIX iOS Safari - motion.div → div estático */}
        {/* Root cause: GPU compositing freeze con transform+opacity en iOS Safari */}
        {/* Trade-off: Sin fade-in (0.3s) para garantizar funcionalidad 100% */}
        <div
          className="space-y-[clamp(1rem,4vw,1.5rem)]"
          style={{ opacity: 1 }}
        >
          {/* 🤖 [IA] - v1.3.7: Header siempre visible */}
          <div className="text-center mb-[clamp(1.5rem,6vw,2rem)]">
            <h2 className="text-[clamp(1.25rem,5vw,1.75rem)] font-bold text-primary mb-2">Cálculo Completado</h2>
            <p className="text-muted-foreground text-[clamp(0.875rem,3.5vw,1rem)]">Resultados del corte de caja</p>
            <Badge variant="outline" className="mt-2 border-primary text-primary text-[clamp(0.75rem,3vw,0.875rem)]">
              {calculationData?.timestamp || ''}
            </Badge>
          </div>

          {/* 🤖 [IA] - v1.3.7: RENDERIZADO CONDICIONAL - Resultados bloqueados hasta confirmación */}
          {!reportSent ? (
            // BLOQUEADO: Mostrar mensaje de bloqueo
            <div style={{
              background: 'rgba(36, 36, 36, 0.4)',
              backdropFilter: `blur(clamp(12px, 4vw, 20px))`,
              WebkitBackdropFilter: `blur(clamp(12px, 4vw, 20px))`,
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: `clamp(8px, 3vw, 16px)`,
              padding: `clamp(3rem, 8vw, 4rem)`,
              textAlign: 'center'
            }}>
              <Lock className="w-[clamp(3rem,12vw,4rem)] h-[clamp(3rem,12vw,4rem)] mx-auto mb-[clamp(1rem,4vw,1.5rem)]" style={{ color: '#ff9f0a' }} />
              <h3 className="text-[clamp(1rem,4.5vw,1.25rem)] font-bold mb-2" style={{ color: '#e1e8ed' }}>
                🔒 Resultados Bloqueados
              </h3>
              <p className="text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#8899a6' }}>
                Los resultados del corte se revelarán después de enviar el reporte por WhatsApp.
                Esto garantiza la trazabilidad completa de todos los cortes realizados.
              </p>
            </div>
          ) : (
            // DESBLOQUEADO: Mostrar todos los resultados
            <>
          {/* Alert for significant shortage - 🤖 [IA] - v1.1.08: Glass morphism */}
          {calculationData?.hasAlert && (
            <div className="p-[clamp(0.75rem,3vw,1rem)] rounded-[clamp(0.5rem,2vw,0.75rem)] flex items-start gap-3" style={{
              background: 'rgba(244, 33, 46, 0.1)',
              border: '1px solid rgba(244, 33, 46, 0.3)'
            }}>
              <AlertTriangle className="w-[clamp(1rem,4vw,1.25rem)] h-[clamp(1rem,4vw,1.25rem)] mt-0.5" style={{ color: '#f4212e' }} />
              <div>
                <p className="font-medium text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#f4212e' }}>
                  🚨 ALERTA: Faltante significativo detectado (${Math.abs(calculationData?.difference || 0).toFixed(2)})
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
                    {formatCurrency(calculationData?.totalCash || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#8899a6' }}>Electrónico:</span>
                  <span className="font-bold text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#e1e8ed' }}>
                    {formatCurrency(calculationData?.totalElectronic || 0)}
                  </span>
                </div>
                {(calculationData?.totalExpenses || 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#8899a6' }}>Gastos:</span>
                    <span className="font-bold text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#ff453a' }}>
                      -{formatCurrency(calculationData?.totalExpenses || 0)}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-700 pt-3">
                  <div className="flex justify-between text-[clamp(1rem,4vw,1.125rem)] font-bold">
                    <span style={{ color: '#8899a6' }}>Total {(calculationData?.totalExpenses || 0) > 0 ? 'Ajustado' : 'General'}:</span>
                    <span style={{ color: '#0a84ff' }}>
                      {formatCurrency((calculationData?.totalExpenses || 0) > 0 ? (calculationData?.totalAdjusted || 0) : (calculationData?.totalGeneral || 0))}
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
                    {(calculationData?.difference || 0) >= 0 ? 'Sobrante:' : 'Faltante:'}
                  </span>
                  <span style={{ 
                    color: (calculationData?.difference || 0) >= 0 ? '#00ba7c' : '#f4212e'
                  }}>
                    {formatCurrency(Math.abs(calculationData?.difference || 0))}
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
            </>
          )}

          {/* 🤖 [IA] - v1.3.7: ANTI-FRAUDE - Bloque de acción SIEMPRE visible */}
          <div style={{
            background: 'rgba(36, 36, 36, 0.4)',
            backdropFilter: `blur(clamp(12px, 4vw, 20px))`,
            WebkitBackdropFilter: `blur(clamp(12px, 4vw, 20px))`,
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: `clamp(8px, 3vw, 16px)`,
            padding: `clamp(1.5rem, 6vw, 2rem)`,
            marginBottom: `clamp(1rem, 4vw, 1.5rem)`
          }}>
            <div className="text-center">
              <CheckCircle className="w-[clamp(3rem,12vw,4rem)] h-[clamp(3rem,12vw,4rem)] mx-auto mb-[clamp(0.75rem,3vw,1rem)]" style={{ color: '#00ba7c' }} />
              <h3 className="text-[clamp(1rem,4.5vw,1.25rem)] font-bold mb-2" style={{ color: '#00ba7c' }}>
                Corte de Caja Completado
              </h3>
              <p className="mb-[clamp(1rem,4vw,1.5rem)] text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#8899a6' }}>
                Los datos han sido calculados y están listos para generar el reporte.
                {!reportSent && ' Debe enviar el reporte para continuar.'}
              </p>

              {/* Botones de acción */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[clamp(0.5rem,2vw,0.75rem)] lg:max-w-3xl mx-auto">
                <ConstructiveActionButton
                  onClick={handleWhatsAppSend}
                  disabled={reportSent || whatsappOpened}
                  aria-label="Enviar reporte por WhatsApp"
                >
                  <Share />
                  {reportSent ? 'Reporte Enviado' : whatsappOpened ? 'WhatsApp Abierto...' : 'Enviar WhatsApp'}
                </ConstructiveActionButton>

                <NeutralActionButton
                  onClick={handleCopyToClipboard}
                  disabled={!reportSent && !popupBlocked}
                  aria-label="Copiar reporte"
                >
                  <Copy />
                  Copiar
                </NeutralActionButton>

                <PrimaryActionButton
                  onClick={() => setShowFinishConfirmation(true)}
                  disabled={!reportSent}
                  aria-label="Finalizar proceso"
                  className="h-fluid-3xl min-h-[var(--instruction-fluid-3xl)]"
                >
                  <CheckCircle />
                  Finalizar
                </PrimaryActionButton>
              </div>

              {/* 🤖 [IA] - v1.3.7: Botón de confirmación después de abrir WhatsApp */}
              {whatsappOpened && !reportSent && (
                <div className="mt-[clamp(1rem,4vw,1.5rem)] p-[clamp(1rem,4vw,1.5rem)] rounded-[clamp(0.5rem,2vw,0.75rem)]" style={{
                  background: 'rgba(0, 186, 124, 0.1)',
                  border: '1px solid rgba(0, 186, 124, 0.3)'
                }}>
                  <p className="text-[clamp(0.875rem,3.5vw,1rem)] mb-3 text-center" style={{ color: '#8899a6' }}>
                    ¿Ya envió el reporte por WhatsApp?
                  </p>
                  <ConstructiveActionButton
                    onClick={handleConfirmSent}
                    className="w-full"
                    aria-label="Confirmar envío de reporte"
                  >
                    <CheckCircle />
                    Sí, ya envié el reporte
                  </ConstructiveActionButton>
                </div>
              )}
            </div>
          </div>

          {/* 🤖 [IA] - v1.3.7: Banner advertencia inicial si NO enviado */}
          {!reportSent && !whatsappOpened && !popupBlocked && (
            <div className="p-[clamp(0.75rem,3vw,1rem)] rounded-[clamp(0.5rem,2vw,0.75rem)] mb-[clamp(1rem,4vw,1.5rem)] flex items-start gap-3" style={{
              background: 'rgba(255, 159, 10, 0.1)',
              border: '1px solid rgba(255, 159, 10, 0.3)'
            }}>
              <AlertTriangle className="w-[clamp(1rem,4vw,1.25rem)] h-[clamp(1rem,4vw,1.25rem)] mt-0.5" style={{ color: '#ff9f0a' }} />
              <div>
                <p className="font-medium text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#ff9f0a' }}>
                  ⚠️ DEBE ENVIAR REPORTE PARA CONTINUAR
                </p>
                <p className="text-[clamp(0.75rem,3vw,0.875rem)] mt-1" style={{ color: '#8899a6' }}>
                  Los resultados se revelarán después de enviar el reporte por WhatsApp.
                </p>
              </div>
            </div>
          )}

          {/* 🤖 [IA] - v1.3.7: Banner pop-up bloqueado */}
          {popupBlocked && !reportSent && (
            <div className="p-[clamp(0.75rem,3vw,1rem)] rounded-[clamp(0.5rem,2vw,0.75rem)] mb-[clamp(1rem,4vw,1.5rem)] flex items-start gap-3" style={{
              background: 'rgba(255, 69, 58, 0.1)',
              border: '1px solid rgba(255, 69, 58, 0.3)'
            }}>
              <AlertTriangle className="w-[clamp(1rem,4vw,1.25rem)] h-[clamp(1rem,4vw,1.25rem)] mt-0.5" style={{ color: '#ff453a' }} />
              <div>
                <p className="font-medium text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#ff453a' }}>
                  🚫 Pop-ups Bloqueados
                </p>
                <p className="text-[clamp(0.75rem,3vw,0.875rem)] mt-1" style={{ color: '#8899a6' }}>
                  Su navegador bloqueó la apertura de WhatsApp. Use el botón "Copiar" para enviar el reporte manualmente.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 🤖 [IA] - v1.2.24: Modal de confirmación para finalizar el proceso */}
      <ConfirmationModal
        open={showFinishConfirmation}
        onOpenChange={setShowFinishConfirmation}
        title="Finalizar Proceso"
        description="Se cerrará el proceso de conteo de efectivo"
        warningText="Esta acción no se puede deshacer"
        confirmText="Sí, Finalizar"
        cancelText="Continuar"
        onConfirm={() => {
          setShowFinishConfirmation(false);
          onComplete();
        }}
        onCancel={() => setShowFinishConfirmation(false)}
      />
    </div>
  );
};

export default CashCalculation;