// 🤖 [IA] - Extraído de CashCalculation.tsx para cumplir Mandamiento #1 (<500 líneas/archivo)
// Funciones puras de generación de reporte nocturno (corte de caja)

import type { CashCount, ElectronicPayments } from '@/types/cash';
import type { PhaseState, DeliveryCalculation } from '@/types/phases';
import type { VerificationBehavior } from '@/types/verification';
import type { DailyExpense } from '@/types/expenses';
import type { DeliveryEntry } from '@/types/deliveries';
import { calculateCashTotal, calculateChange50, formatCurrency } from '@/utils/calculations';
import { EXPENSE_CATEGORY_EMOJI, EXPENSE_CATEGORY_LABEL } from '@/types/expenses';
import {
  WHATSAPP_SEPARATOR,
  generateDenominationDetails,
  generateCriticalAlertsBlock,
  generateWarningAlertsBlock,
} from '@/utils/reportHelpers';
import {
  calculateSicarAdjusted,
  formatDeliveriesForWhatsApp,
  formatSicarAdjustment,
} from '@/utils/sicarAdjustment';

// 🤖 [IA] - Interfaces movidas desde CashCalculation.tsx (usadas por report + component)
export interface CalculationData {
  totalCash: number;
  totalElectronic: number;
  salesCash: number;
  totalGeneral: number;
  totalExpenses: number;
  totalWithExpenses: number;
  totalAdjusted?: number;
  difference: number;
  changeResult: {
    change: Partial<CashCount>;
    total: number;
    possible: boolean;
  };
  hasAlert: boolean;
  timestamp: string;
}

export type DeliveryStep = {
  key: keyof CashCount;
  quantity: number;
  label: string;
  value: number;
};

/** Params for generateCompleteReport — all data needed from component state */
export interface EveningReportParams {
  calculationData: CalculationData;
  cashCount: CashCount;
  electronicPayments: ElectronicPayments;
  expectedSales: number;
  deliveryCalculation?: DeliveryCalculation;
  phaseState?: PhaseState;
  storeId: string;
  cashierId: string;
  witnessId: string;
  storeName?: string;
  cashierName?: string;
  witnessName?: string;
  expenses: DailyExpense[];
  pendingDeliveries: DeliveryEntry[];
}

// --- Helper: Validate phase completion ---
function validatePhaseCompletion(
  cashCount: CashCount,
  electronicPayments: ElectronicPayments,
  phaseState?: PhaseState,
  deliveryCalculation?: DeliveryCalculation,
): boolean {
  const phase1Fields = [
    cashCount.penny, cashCount.nickel, cashCount.dime, cashCount.quarter,
    cashCount.dollarCoin, cashCount.bill1, cashCount.bill5, cashCount.bill10,
    cashCount.bill20, cashCount.bill50, cashCount.bill100,
    electronicPayments.credomatic, electronicPayments.promerica,
  ];

  if (phase1Fields.some(field => field === undefined || field === null)) {
    throw new Error('❌ Conteo incompleto - Faltan campos por completar');
  }

  if (!phaseState?.shouldSkipPhase2 && deliveryCalculation) {
    const totalCash = calculateCashTotal(cashCount);
    const expectedInCash = 50;
    const expectedToDeliver = totalCash - expectedInCash;

    if (Math.abs(deliveryCalculation.amountToDeliver - expectedToDeliver) > 0.01) {
      throw new Error('❌ División incorrecta - Los montos no cuadran');
    }
  }

  return true;
}

// --- Helper: Generate data hash ---
function generateDataHash(params: EveningReportParams): string {
  const hashData = {
    storeId: params.storeId,
    cashierId: params.cashierId,
    witnessId: params.witnessId,
    timestamp: params.calculationData.timestamp,
    totalCash: params.calculationData.totalCash,
    totalElectronic: params.calculationData.totalElectronic,
    expectedSales: params.expectedSales,
    phaseCompleted: params.phaseState?.currentPhase || 3,
  };

  return btoa(JSON.stringify(hashData)).slice(-12);
}

// --- Helper: Delivery checklist section ---
function generateDeliveryChecklistSection(
  phaseState?: PhaseState,
  deliveryCalculation?: DeliveryCalculation,
): string {
  if (phaseState?.shouldSkipPhase2) return '';
  if (!deliveryCalculation?.deliverySteps || deliveryCalculation.deliverySteps.length === 0) return '';

  const amountToDeliver = deliveryCalculation.amountToDeliver || 0;
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
`;
}

// --- Helper: Remaining cash checklist section ---
function generateRemainingChecklistSection(
  cashCount: CashCount,
  calculationData: CalculationData,
  phaseState?: PhaseState,
  deliveryCalculation?: DeliveryCalculation,
): string {
  let remainingCash: CashCount;
  let remainingAmount = 50;

  if (!phaseState?.shouldSkipPhase2 && deliveryCalculation?.denominationsToKeep) {
    remainingCash = deliveryCalculation.denominationsToKeep;
    remainingAmount = deliveryCalculation.amountRemaining ?? 50;
  } else if (phaseState?.shouldSkipPhase2) {
    remainingCash = cashCount;
    remainingAmount = calculationData.totalCash;
  } else {
    const changeResult = calculateChange50(cashCount);
    if (!changeResult.possible || !changeResult.change) return '';
    remainingCash = changeResult.change as CashCount;
    remainingAmount = 50;
  }

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
    { key: 'penny', label: '1¢', value: 0.01 },
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
  if (bills.length > 0) checklistContent += `${bills.join('\n')}`;
  if (coins.length > 0) {
    if (bills.length > 0) checklistContent += '\n';
    checklistContent += `${coins.join('\n')}`;
  }

  if (!checklistContent) return '';

  return `${WHATSAPP_SEPARATOR}

🏢 *LO QUE QUEDÓ EN CAJA (${formatCurrency(remainingAmount)})*

${checklistContent}

`;
}

// --- Helper: Verification section ---
function generateVerificationSection(
  deliveryCalculation?: DeliveryCalculation,
): string {
  if (!deliveryCalculation?.verificationBehavior) return '';

  const behavior = deliveryCalculation.verificationBehavior;
  const totalDenoms = deliveryCalculation.verificationSteps.length;
  const firstAttemptSuccesses = behavior.firstAttemptSuccesses;

  const warningCountActual = behavior.denominationsWithIssues.filter(d =>
    d.severity === 'warning_retry' || d.severity === 'warning_override'
  ).length;

  const criticalCountActual = behavior.denominationsWithIssues.filter(d =>
    d.severity === 'critical_severe' || d.severity === 'critical_inconsistent'
  ).length;

  return `
${WHATSAPP_SEPARATOR}

🔍 *VERIFICACIÓN CIEGA*

✅ Perfectas: ${firstAttemptSuccesses}/${totalDenoms}
⚠️ Corregidas: ${warningCountActual}/${totalDenoms}
🔴 Críticas: ${criticalCountActual}/${totalDenoms}
`;
}

// --- Helper: Expenses section for WhatsApp ---
export function generateExpensesSection(expenses: DailyExpense[]): string {
  if (!expenses || expenses.length === 0) return '';

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
}

// --- Main: Generate complete WhatsApp report ---
export function generateCompleteReport(params: EveningReportParams): string {
  const {
    calculationData, cashCount, electronicPayments, expectedSales,
    deliveryCalculation, phaseState, storeId, cashierId, witnessId,
    storeName, cashierName, witnessName, expenses, pendingDeliveries,
  } = params;

  validatePhaseCompletion(cashCount, electronicPayments, phaseState, deliveryCalculation);

  const denominationDetails = generateDenominationDetails(cashCount);
  const dataHash = generateDataHash(params);

  // Pagos electrónicos desglosados
  const totalElectronic = calculationData.totalElectronic;
  const electronicDetailsDesglosed = `💳 Pagos Electrónicos: *${formatCurrency(totalElectronic)}*
   ☐ Credomatic: ${formatCurrency(electronicPayments.credomatic)}
   ☐ Promerica: ${formatCurrency(electronicPayments.promerica)}
   ☐ Transferencia: ${formatCurrency(electronicPayments.bankTransfer)}
   ☐ PayPal: ${formatCurrency(electronicPayments.paypal)}`;

  // Bloques de alertas
  const criticalAlertsBlock = deliveryCalculation?.verificationBehavior
    ? generateCriticalAlertsBlock(deliveryCalculation.verificationBehavior) : '';
  const warningAlertsBlock = deliveryCalculation?.verificationBehavior
    ? generateWarningAlertsBlock(deliveryCalculation.verificationBehavior) : '';

  // Header dinámico según severidad
  const criticalCount = deliveryCalculation?.verificationBehavior?.denominationsWithIssues.filter(d =>
    d.severity === 'critical_severe' || d.severity === 'critical_inconsistent'
  ).length || 0;
  const warningCount = deliveryCalculation?.verificationBehavior?.denominationsWithIssues.filter(d =>
    d.severity === 'warning_retry' || d.severity === 'warning_override'
  ).length || 0;
  const headerSeverity = criticalCount > 0
    ? '🚨 *REPORTE CRÍTICO - ACCIÓN INMEDIATA*'
    : warningCount > 0
    ? '⚠️ *REPORTE ADVERTENCIAS*'
    : '✅ *REPORTE NORMAL*';

  // Sección de alertas
  const fullAlertsSection = (criticalAlertsBlock || warningAlertsBlock)
    ? `
${WHATSAPP_SEPARATOR}

⚠️ *ALERTAS DETECTADAS*

${criticalAlertsBlock}${criticalAlertsBlock && warningAlertsBlock ? '\n\n' : ''}${warningAlertsBlock}
` : '';

  // SICAR adjustment
  const sicarAdjustment = calculateSicarAdjusted(expectedSales, pendingDeliveries);
  const deliveriesSectionWhatsApp = formatDeliveriesForWhatsApp(sicarAdjustment, WHATSAPP_SEPARATOR);
  const sicarAdjustmentText = formatSicarAdjustment(sicarAdjustment);

  // Checklists
  const deliveryChecklistSection = generateDeliveryChecklistSection(phaseState, deliveryCalculation);
  const remainingChecklistSection = generateRemainingChecklistSection(cashCount, calculationData, phaseState, deliveryCalculation);

  // Verification section
  const verificationSection = generateVerificationSection(deliveryCalculation);

  // Expenses section
  const expensesSection = generateExpensesSection(expenses);

  return `${headerSeverity}


📊 *CORTE DE CAJA*
${calculationData.timestamp}

Sucursal: ${storeName}
Cajero: ${cashierName}
Testigo: ${witnessName}

${WHATSAPP_SEPARATOR}

📊 *RESUMEN EJECUTIVO*

${WHATSAPP_SEPARATOR}
💰 EFECTIVO FÍSICO
${WHATSAPP_SEPARATOR}
Contado total:       *${formatCurrency(calculationData.totalCash)}*
Menos fondo:         -$50.00
                     ────────
Ventas efectivo:     *${formatCurrency(calculationData.salesCash)}*
${WHATSAPP_SEPARATOR}

${WHATSAPP_SEPARATOR}
💳 ELECTRÓNICO
${WHATSAPP_SEPARATOR}
${electronicDetailsDesglosed}
                     ────────
Total:               *${formatCurrency(calculationData.totalElectronic)}*
${WHATSAPP_SEPARATOR}

${WHATSAPP_SEPARATOR}
📦 DIVISIÓN EFECTIVO
${WHATSAPP_SEPARATOR}
Entregado:           *${formatCurrency(deliveryCalculation?.amountToDeliver || 0)}*
Quedó (fondo):       *${phaseState?.shouldSkipPhase2 ? formatCurrency(calculationData.totalCash) : formatCurrency(deliveryCalculation?.amountRemaining ?? 50)}*
                     ────────
Suma:                *${formatCurrency(calculationData.totalCash)}* ✓
${WHATSAPP_SEPARATOR}

${WHATSAPP_SEPARATOR}
💼 VENTAS
${WHATSAPP_SEPARATOR}
Efectivo:            ${formatCurrency(calculationData.salesCash)}
Electrónico:         ${formatCurrency(calculationData.totalElectronic)}
                     ────────
Total:               *${formatCurrency(calculationData.totalGeneral)}*
${WHATSAPP_SEPARATOR}
${(calculationData.totalExpenses || 0) > 0 ? `
${WHATSAPP_SEPARATOR}
💸 GASTOS
${WHATSAPP_SEPARATOR}
Operativos:          +${formatCurrency(calculationData.totalExpenses)}
                     ────────
Ventas + Gastos:     *${formatCurrency(calculationData.totalWithExpenses)}*
${WHATSAPP_SEPARATOR}
` : ''}
${WHATSAPP_SEPARATOR}
🎯 SICAR
${WHATSAPP_SEPARATOR}
Calculado:           ${formatCurrency((calculationData.totalExpenses || 0) > 0 ? calculationData.totalWithExpenses : calculationData.totalGeneral)}
${sicarAdjustment.pendingDeliveriesCount > 0 ? `
${sicarAdjustmentText}
` : `Esperado:            ${formatCurrency(expectedSales)}`}
                     ────────
${(calculationData.difference || 0) >= 0 ? '📈' : '📉'} *Diferencia:*        *${formatCurrency(Math.abs(calculationData.difference))}*
                     *(${(calculationData.difference || 0) >= 0 ? 'SOBRANTE' : 'FALTANTE'})*
${WHATSAPP_SEPARATOR}
${deliveriesSectionWhatsApp}${deliveryChecklistSection}${remainingChecklistSection}${expensesSection}${fullAlertsSection}${verificationSection}
${WHATSAPP_SEPARATOR}

💰 *CONTEO COMPLETO (${formatCurrency(calculationData.totalCash)})*

${denominationDetails}

${WHATSAPP_SEPARATOR}

📅 ${calculationData.timestamp}
🔐 CashGuard Paradise v3.4.1
🔒 NIST SP 800-115 | PCI DSS 12.10.1

✅ Reporte automático
⚠️ Documento NO editable

Firma Digital: ${dataHash}`;
}

// --- Printable report (HTML wrapper for printing) ---
export function generatePrintableHTML(report: string, storeName?: string): string {
  return `<html>
    <head>
      <title>Corte de Caja - ${storeName}</title>
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
  </html>`;
}
