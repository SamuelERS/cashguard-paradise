// 🤖 [IA] - v2.8.2: Módulo de generación de reportes WhatsApp
// Extraído de CashCalculation.tsx para reducir monolito (Auditoría "Cimientos de Cristal")
// Funciones puras sin dependencias de React state

import type { CashCount, ElectronicPayments, Store, Employee } from '@/types/cash';
import type { PhaseState, DeliveryCalculation } from '@/types/phases';
import type { DailyExpense } from '@/types/expenses';
import { EXPENSE_CATEGORY_EMOJI, EXPENSE_CATEGORY_LABEL } from '@/types/expenses';
import { formatCurrency } from '@/utils/calculations';
import { calculateChange50 } from '@/utils/calculations';
import {
  generateCriticalAlertsBlock,
  generateWarningAlertsBlock,
} from './alerts';

// 🤖 [IA] - v2.8.2: Separador optimizado 12 caracteres
const WHATSAPP_SEPARATOR = '━━━━━━━━━━━━';

/**
 * Datos de cálculo necesarios para generar el reporte
 */
export interface ReportCalculationData {
  totalCash: number;
  totalElectronic: number;
  salesCash: number;
  totalGeneral: number;
  totalExpenses: number;
  totalWithExpenses: number;
  difference: number;
  timestamp: string;
}

/**
 * Datos completos para generar el reporte WhatsApp
 */
export interface WhatsAppReportData {
  store: Store | null;
  cashier: Employee | null;
  witness: Employee | null;
  cashCount: CashCount;
  electronicPayments: ElectronicPayments;
  expenses: DailyExpense[];
  expectedSales: number;
  calculationData: ReportCalculationData;
  deliveryCalculation?: DeliveryCalculation;
  phaseState?: PhaseState;
  storeId: string;
  cashierId: string;
  witnessId: string;
}

/**
 * Genera el hash de integridad para el reporte
 */
export const generateDataHash = (data: WhatsAppReportData): string => {
  const hashData = {
    storeId: data.storeId,
    cashierId: data.cashierId,
    witnessId: data.witnessId,
    timestamp: data.calculationData.timestamp,
    totalCash: data.calculationData.totalCash,
    totalElectronic: data.calculationData.totalElectronic,
    expectedSales: data.expectedSales,
    phaseCompleted: data.phaseState?.currentPhase || 3
  };
  return btoa(JSON.stringify(hashData)).slice(-12);
};

/**
 * Genera el detalle de denominaciones contadas
 */
export const generateDenominationDetails = (cashCount: CashCount): string => {
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

/**
 * Genera la sección de checklist de entrega (LO QUE RECIBES)
 */
export const generateDeliveryChecklistSection = (
  deliveryCalculation: DeliveryCalculation | undefined,
  phaseState: PhaseState | undefined
): string => {
  if (phaseState?.shouldSkipPhase2) return '';
  if (!deliveryCalculation?.deliverySteps || deliveryCalculation.deliverySteps.length === 0) return '';

  const amountToDeliver = deliveryCalculation.amountToDeliver || 0;
  const billKeys = ['bill100', 'bill50', 'bill20', 'bill10', 'bill5', 'bill1'];
  const coinKeys = ['dollarCoin', 'quarter', 'dime', 'nickel', 'penny'];

  const bills = deliveryCalculation.deliverySteps
    .filter(step => billKeys.includes(step.key))
    .map(step => `☐ ${step.label} × ${step.quantity} = ${formatCurrency(step.value * step.quantity)}`);

  const coins = deliveryCalculation.deliverySteps
    .filter(step => coinKeys.includes(step.key))
    .map(step => `☐ ${step.label} × ${step.quantity} = ${formatCurrency(step.value * step.quantity)}`);

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
};

/**
 * Genera la sección de checklist de lo que quedó en caja
 */
export const generateRemainingChecklistSection = (
  cashCount: CashCount,
  deliveryCalculation: DeliveryCalculation | undefined,
  phaseState: PhaseState | undefined,
  totalCash: number
): string => {
  let remainingCash: CashCount;
  let remainingAmount = 50;

  if (!phaseState?.shouldSkipPhase2 && deliveryCalculation?.denominationsToKeep) {
    remainingCash = deliveryCalculation.denominationsToKeep;
    remainingAmount = deliveryCalculation.amountRemaining ?? 50;
  } else if (phaseState?.shouldSkipPhase2) {
    remainingCash = cashCount;
    remainingAmount = totalCash;
  } else {
    const changeResult = calculateChange50(cashCount);
    if (!changeResult.possible || !changeResult.change) return '';
    remainingCash = changeResult.change as CashCount;
    remainingAmount = 50;
  }

  return formatRemainingChecklist(remainingCash, remainingAmount);
};

/**
 * Formatea el checklist de denominaciones restantes
 * Separado para mantener funciones < 50 líneas
 */
const formatRemainingChecklist = (remainingCash: CashCount, remainingAmount: number): string => {
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

  const formatLine = (d: { key: string; label: string; value: number }) => {
    const quantity = remainingCash[d.key as keyof CashCount];
    return `☐ ${d.label} × ${quantity} = ${formatCurrency(quantity * d.value)}`;
  };

  const bills = denominations
    .filter(d => billKeys.includes(d.key) && remainingCash[d.key as keyof CashCount] > 0)
    .map(formatLine);

  const coins = denominations
    .filter(d => coinKeys.includes(d.key) && remainingCash[d.key as keyof CashCount] > 0)
    .map(formatLine);

  let checklistContent = '';
  if (bills.length > 0) checklistContent += bills.join('\n');
  if (coins.length > 0) {
    if (bills.length > 0) checklistContent += '\n';
    checklistContent += coins.join('\n');
  }
  if (!checklistContent) return '';

  return `${WHATSAPP_SEPARATOR}

🏢 *LO QUE QUEDÓ EN CAJA (${formatCurrency(remainingAmount)})*

${checklistContent}

`;
};

/**
 * Genera la sección de gastos del día
 */
export const generateExpensesSection = (expenses: DailyExpense[]): string => {
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
};

/**
 * Genera el header dinámico según severidad de alertas
 */
const generateHeaderSeverity = (deliveryCalculation: DeliveryCalculation | undefined): string => {
  const criticalCount = deliveryCalculation?.verificationBehavior?.denominationsWithIssues.filter(d =>
    d.severity === 'critical_severe' || d.severity === 'critical_inconsistent'
  ).length || 0;

  const warningCount = deliveryCalculation?.verificationBehavior?.denominationsWithIssues.filter(d =>
    d.severity === 'warning_retry' || d.severity === 'warning_override'
  ).length || 0;

  if (criticalCount > 0) return "🚨 *REPORTE CRÍTICO - ACCIÓN INMEDIATA*";
  if (warningCount > 0) return "⚠️ *REPORTE ADVERTENCIAS*";
  return "✅ *REPORTE NORMAL*";
};

/**
 * Genera la sección de verificación ciega
 */
const generateVerificationSection = (deliveryCalculation: DeliveryCalculation | undefined): string => {
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
};

/**
 * Genera el reporte completo de WhatsApp
 * Función principal que orquesta todas las secciones
 */
export const generateCompleteReport = (data: WhatsAppReportData): string => {
  const {
    store, cashier, witness, cashCount, electronicPayments,
    expenses, expectedSales, calculationData, deliveryCalculation, phaseState
  } = data;

  const denominationDetails = generateDenominationDetails(cashCount);
  const dataHash = generateDataHash(data);
  const headerSeverity = generateHeaderSeverity(deliveryCalculation);

  // Pagos electrónicos desglosados
  const electronicDetailsDesglosed = `💳 Pagos Electrónicos: *${formatCurrency(calculationData.totalElectronic)}*
   ☐ Credomatic: ${formatCurrency(electronicPayments.credomatic)}
   ☐ Promerica: ${formatCurrency(electronicPayments.promerica)}
   ☐ Transferencia: ${formatCurrency(electronicPayments.bankTransfer)}
   ☐ PayPal: ${formatCurrency(electronicPayments.paypal)}`;

  // Bloques de alertas
  const criticalAlertsBlock = deliveryCalculation?.verificationBehavior ?
    generateCriticalAlertsBlock(deliveryCalculation.verificationBehavior) : '';
  const warningAlertsBlock = deliveryCalculation?.verificationBehavior ?
    generateWarningAlertsBlock(deliveryCalculation.verificationBehavior) : '';

  // Sección de alertas
  const fullAlertsSection = (criticalAlertsBlock || warningAlertsBlock) ?
    `
${WHATSAPP_SEPARATOR}

⚠️ *ALERTAS DETECTADAS*

${criticalAlertsBlock}${criticalAlertsBlock && warningAlertsBlock ? '\n\n' : ''}${warningAlertsBlock}
` : '';

  // Secciones de checklist
  const deliveryChecklistSection = generateDeliveryChecklistSection(deliveryCalculation, phaseState);
  const remainingChecklistSection = generateRemainingChecklistSection(
    cashCount, deliveryCalculation, phaseState, calculationData.totalCash
  );

  // Secciones adicionales
  const expensesSection = generateExpensesSection(expenses);
  const verificationSection = generateVerificationSection(deliveryCalculation);

  // Valores para el cuerpo del reporte
  const remainingAmount = phaseState?.shouldSkipPhase2
    ? formatCurrency(calculationData.totalCash)
    : formatCurrency(deliveryCalculation?.amountRemaining ?? 50);

  const differenceEmoji = calculationData.difference >= 0 ? '📈' : '📉';
  const differenceLabel = calculationData.difference >= 0 ? 'SOBRANTE' : 'FALTANTE';

  return buildReportBody({
    headerSeverity,
    timestamp: calculationData.timestamp,
    storeName: store?.name || '',
    cashierName: cashier?.name || '',
    witnessName: witness?.name || '',
    totalCash: calculationData.totalCash,
    salesCash: calculationData.salesCash,
    electronicDetailsDesglosed,
    totalElectronic: calculationData.totalElectronic,
    amountToDeliver: deliveryCalculation?.amountToDeliver || 0,
    remainingAmount,
    totalGeneral: calculationData.totalGeneral,
    totalExpenses: calculationData.totalExpenses,
    totalWithExpenses: calculationData.totalWithExpenses,
    expectedSales,
    difference: calculationData.difference,
    differenceEmoji,
    differenceLabel,
    deliveryChecklistSection,
    remainingChecklistSection,
    expensesSection,
    fullAlertsSection,
    verificationSection,
    denominationDetails,
    dataHash
  });
};

/**
 * Construye el cuerpo del reporte con todos los parámetros
 * Separado para mantener generateCompleteReport legible
 */
interface ReportBodyParams {
  headerSeverity: string;
  timestamp: string;
  storeName: string;
  cashierName: string;
  witnessName: string;
  totalCash: number;
  salesCash: number;
  electronicDetailsDesglosed: string;
  totalElectronic: number;
  amountToDeliver: number;
  remainingAmount: string;
  totalGeneral: number;
  totalExpenses: number;
  totalWithExpenses: number;
  expectedSales: number;
  difference: number;
  differenceEmoji: string;
  differenceLabel: string;
  deliveryChecklistSection: string;
  remainingChecklistSection: string;
  expensesSection: string;
  fullAlertsSection: string;
  verificationSection: string;
  denominationDetails: string;
  dataHash: string;
}

const buildReportBody = (p: ReportBodyParams): string => {
  const expensesBlock = p.totalExpenses > 0 ? `
${WHATSAPP_SEPARATOR}
💸 GASTOS
${WHATSAPP_SEPARATOR}
Operativos:          +${formatCurrency(p.totalExpenses)}
                     ────────
Ventas + Gastos:     *${formatCurrency(p.totalWithExpenses)}*
${WHATSAPP_SEPARATOR}
` : '';

  const calculatedTotal = p.totalExpenses > 0 ? p.totalWithExpenses : p.totalGeneral;

  return `${p.headerSeverity}


📊 *CORTE DE CAJA*
${p.timestamp}

Sucursal: ${p.storeName}
Cajero: ${p.cashierName}
Testigo: ${p.witnessName}

${WHATSAPP_SEPARATOR}

📊 *RESUMEN EJECUTIVO*

${WHATSAPP_SEPARATOR}
💰 EFECTIVO FÍSICO
${WHATSAPP_SEPARATOR}
Contado total:       *${formatCurrency(p.totalCash)}*
Menos fondo:         -$50.00
                     ────────
Ventas efectivo:     *${formatCurrency(p.salesCash)}*
${WHATSAPP_SEPARATOR}

${WHATSAPP_SEPARATOR}
💳 ELECTRÓNICO
${WHATSAPP_SEPARATOR}
${p.electronicDetailsDesglosed}
                     ────────
Total:               *${formatCurrency(p.totalElectronic)}*
${WHATSAPP_SEPARATOR}

${WHATSAPP_SEPARATOR}
📦 DIVISIÓN EFECTIVO
${WHATSAPP_SEPARATOR}
Entregado:           *${formatCurrency(p.amountToDeliver)}*
Quedó (fondo):       *${p.remainingAmount}*
                     ────────
Suma:                *${formatCurrency(p.totalCash)}* ✓
${WHATSAPP_SEPARATOR}

${WHATSAPP_SEPARATOR}
💼 VENTAS
${WHATSAPP_SEPARATOR}
Efectivo:            ${formatCurrency(p.salesCash)}
Electrónico:         ${formatCurrency(p.totalElectronic)}
                     ────────
Total:               *${formatCurrency(p.totalGeneral)}*
${WHATSAPP_SEPARATOR}
${expensesBlock}${WHATSAPP_SEPARATOR}
🎯 SICAR
${WHATSAPP_SEPARATOR}
Calculado:           ${formatCurrency(calculatedTotal)}
Esperado:            ${formatCurrency(p.expectedSales)}
                     ────────
${p.differenceEmoji} *Diferencia:*        *${formatCurrency(Math.abs(p.difference))}*
                     *(${p.differenceLabel})*
${WHATSAPP_SEPARATOR}
${p.deliveryChecklistSection}${p.remainingChecklistSection}${p.expensesSection}${p.fullAlertsSection}${p.verificationSection}
${WHATSAPP_SEPARATOR}

💰 *CONTEO COMPLETO (${formatCurrency(p.totalCash)})*

${p.denominationDetails}

${WHATSAPP_SEPARATOR}

📅 ${p.timestamp}
🔐 CashGuard Paradise v2.8.2
🔒 NIST SP 800-115 | PCI DSS 12.10.1

✅ Reporte automático
⚠️ Documento NO editable

Firma Digital: ${p.dataHash}`;
};
