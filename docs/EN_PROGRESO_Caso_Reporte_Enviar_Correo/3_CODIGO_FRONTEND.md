# Código Frontend TypeScript - Integración Email Sender

**Versión:** v1.0
**Fecha:** 10 Oct 2025
**Autor:** Sistema IA (Claude Code)
**Caso:** Reporte Enviar Correo Automático

---

## 📋 Contenido

Este documento contiene el código completo del frontend TypeScript para integrar el sistema de envío automático de correos. Incluye 3 archivos nuevos + 1 modificación a componente existente.

**Archivos incluidos:**
1. [`emailReports.ts`](#1-emailreportsts) - Helper de envío API (45 líneas)
2. [`htmlReportGenerator.ts`](#2-htmlreportgeneratorts) - Generador HTML email (180 líneas)
3. [`email.ts`](#3-emailts) - TypeScript interfaces (40 líneas)
4. [`CashCalculation.tsx` (modificación)](#4-cashcalculationtsx-modificación) - Integración componente (+30 líneas)

**Total código frontend:** ~295 líneas

---

## 🏗️ Arquitectura Frontend

### Flujo de Integración

```
CashCalculation.tsx
    ↓ (click botón "Enviar Email")
    ↓ (llamar sendEmailReport())
emailReports.ts
    ↓ (llamar htmlReportGenerator())
    ↓ (construir payload EmailReportPayload)
    ↓ (POST a backend PHP)
htmlReportGenerator.ts
    ↓ (generar HTML + Plain Text)
    ↓ (retornar EmailReportContent)
Backend PHP
    ↓ (enviar vía SMTP)
    ↓
📧 Email enviado
```

### Componentes de Integración

- **emailReports.ts**: Helper único para enviar reportes (con retry logic frontend)
- **htmlReportGenerator.ts**: Transforma datos de calculadora a formato email (HTML + texto plano)
- **email.ts**: Interfaces TypeScript para type safety
- **CashCalculation.tsx**: Componente existente modificado para agregar botón + handler
- **LocalStorage Queue**: Fallback para envío offline (retries automáticos al reconectar)

---

## 1. emailReports.ts

**Ubicación:** `/src/utils/emailReports.ts`
**Descripción:** Helper principal para enviar reportes por email con retry logic, queue fallback offline y error handling robusto.

### Código Completo

```typescript
/**
 * CashGuard Paradise - Email Reports Sender
 *
 * Helper para envío automático de reportes por correo electrónico.
 * Arquitectura: TypeScript + Fetch API + Retry Logic + Offline Queue
 *
 * @version 1.0
 * @author Sistema IA (Claude Code)
 * @date 10 Oct 2025
 */

import { EmailReportPayload, EmailSendResponse } from '@/types/email';
import { generateEmailReportContent } from './htmlReportGenerator';
import type { CalculationData, DeliveryCalculation } from '@/types';
// 🔧 FIX Issue #8: determineSeverity() implementation agregada (ver líneas 206-228)

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const EMAIL_API_ENDPOINT = import.meta.env.VITE_EMAIL_API_ENDPOINT;
const EMAIL_API_KEY = import.meta.env.VITE_EMAIL_API_KEY;
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // 1s, 2s, 4s (exponential backoff)
const QUEUE_STORAGE_KEY = 'cashguard_email_queue';

// ============================================================================
// INTERFAZ PRINCIPAL
// ============================================================================

/**
 * Envía un reporte por correo electrónico de forma automática.
 *
 * @param calculationData - Datos del cálculo de caja (Phase 1)
 * @param deliveryCalculation - Datos de entrega (Phase 2)
 * @param branchName - Nombre de la sucursal
 * @param cashierName - Nombre del cajero
 * @param witnessName - Nombre del testigo
 * @param expectedSales - Venta esperada SICAR (opcional)
 * @returns Promise con respuesta del servidor
 *
 * @example
 * try {
 *   const response = await sendEmailReport(
 *     calculationData,
 *     deliveryCalculation,
 *     'Los Héroes',
 *     'Adonay Torres',
 *     'Tito Gomez',
 *     753.34
 *   );
 *   console.log('✅ Email enviado:', response.recipients);
 * } catch (error) {
 *   console.error('❌ Error enviando email:', error);
 * }
 */
export async function sendEmailReport(
  calculationData: CalculationData,
  deliveryCalculation: DeliveryCalculation | null,
  branchName: string,
  cashierName: string,
  witnessName: string,
  expectedSales?: number
): Promise<EmailSendResponse> {
  // 1. Validar configuración
  if (!EMAIL_API_ENDPOINT || !EMAIL_API_KEY) {
    throw new Error(
      'Email API no configurado. Verifica VITE_EMAIL_API_ENDPOINT y VITE_EMAIL_API_KEY en .env'
    );
  }

  // 2. Generar contenido HTML + Plain Text
  const emailContent = generateEmailReportContent(
    calculationData,
    deliveryCalculation,
    branchName,
    cashierName,
    witnessName,
    expectedSales
  );

  // 3. Determinar severidad del reporte
  const severity = determineSeverity(calculationData, deliveryCalculation);

  // 4. Construir payload
  const payload: EmailReportPayload = {
    apiKey: EMAIL_API_KEY,
    timestamp: new Date().toISOString(),
    branchName,
    cashierName,
    witnessName,
    severity,
    reportHtml: emailContent.html,
    reportPlainText: emailContent.plainText,
  };

  // 5. Intentar envío con retry logic
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(EMAIL_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // ✅ Éxito: Limpiar queue si existe
        removeFromQueue(payload);
        return data as EmailSendResponse;
      }

      // ❌ Error del servidor
      throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Si no es el último intento, esperar antes de reintentar
      if (attempt < MAX_RETRIES - 1) {
        await sleep(RETRY_DELAYS[attempt]);
      }
    }
  }

  // 6. Todos los intentos fallaron → Guardar en queue offline
  addToQueue(payload);

  throw new Error(
    `Fallo después de ${MAX_RETRIES} intentos. Email guardado en cola offline. Último error: ${lastError?.message}`
  );
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * 🔧 FIX Issue #8: determineSeverity() - Implementación completa agregada
 *
 * Determina la severidad del reporte basado en anomalías de verificación ciega.
 *
 * Lógica de clasificación:
 * 1. CRÍTICO: Si hay ≥1 inconsistencias críticas (3 intentos diferentes)
 * 2. ADVERTENCIAS: Si hay ≥1 éxitos en segundo intento (patron warning)
 * 3. NORMAL: Si todas las denominaciones fueron correctas en primer intento
 *
 * @param calculationData - Datos del cálculo de caja (Phase 1)
 * @param deliveryCalculation - Datos de entrega con verificationBehavior (Phase 2)
 * @returns Severidad: 'CRÍTICO' | 'ADVERTENCIAS' | 'NORMAL'
 *
 * @example
 * // Caso CRÍTICO (3 intentos diferentes)
 * determineSeverity(calcData, { verificationBehavior: { criticalInconsistencies: 2, ... } })
 * // → 'CRÍTICO'
 *
 * // Caso ADVERTENCIAS (2do intento correcto)
 * determineSeverity(calcData, { verificationBehavior: { criticalInconsistencies: 0, secondAttemptSuccesses: 1, ... } })
 * // → 'ADVERTENCIAS'
 *
 * // Caso NORMAL (todo correcto primer intento)
 * determineSeverity(calcData, { verificationBehavior: { criticalInconsistencies: 0, secondAttemptSuccesses: 0, ... } })
 * // → 'NORMAL'
 */
function determineSeverity(
  calculationData: CalculationData,
  deliveryCalculation: DeliveryCalculation | null
): 'CRÍTICO' | 'ADVERTENCIAS' | 'NORMAL' {
  // Si Phase 2 no ejecutado (≤$50), siempre NORMAL
  if (!deliveryCalculation || !deliveryCalculation.verificationBehavior) {
    return 'NORMAL';
  }

  const behavior = deliveryCalculation.verificationBehavior;

  // PRIORIDAD 1: Verificar alertas críticas (3 intentos diferentes)
  const criticalInconsistencies = behavior.criticalInconsistencies || 0;

  if (criticalInconsistencies > 0) {
    return 'CRÍTICO';
  }

  // PRIORIDAD 2: Verificar alertas de segundo intento (warning patterns)
  const secondAttemptSuccesses = behavior.secondAttemptSuccesses || 0;

  if (secondAttemptSuccesses > 0) {
    return 'ADVERTENCIAS';
  }

  // PRIORIDAD 3: Sin anomalías detectadas
  return 'NORMAL';
}

/**
 * Espera N milisegundos (para retry delays).
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// OFFLINE QUEUE (LocalStorage)
// ============================================================================

/**
 * Agrega un payload a la cola offline para reintento posterior.
 */
function addToQueue(payload: EmailReportPayload): void {
  try {
    const queue = getQueue();
    queue.push({
      payload,
      timestamp: Date.now(),
      attempts: 0,
    });
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    console.log('📥 Email agregado a cola offline:', payload.branchName);
  } catch (error) {
    console.error('❌ Error guardando en cola offline:', error);
  }
}

/**
 * Remueve un payload de la cola offline después de envío exitoso.
 */
function removeFromQueue(payload: EmailReportPayload): void {
  try {
    const queue = getQueue();
    const filtered = queue.filter(
      (item) =>
        item.payload.timestamp !== payload.timestamp ||
        item.payload.branchName !== payload.branchName
    );
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('❌ Error removiendo de cola offline:', error);
  }
}

/**
 * Obtiene la cola offline actual.
 */
function getQueue(): Array<{
  payload: EmailReportPayload;
  timestamp: number;
  attempts: number;
}> {
  try {
    const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('❌ Error leyendo cola offline:', error);
    return [];
  }
}

/**
 * Procesa la cola offline (llamar al reconectar).
 *
 * @returns Número de emails enviados exitosamente desde la cola
 *
 * @example
 * // En App.tsx al detectar reconexión
 * window.addEventListener('online', async () => {
 *   const sent = await processOfflineQueue();
 *   if (sent > 0) {
 *     toast.success(`📧 ${sent} reportes enviados desde cola offline`);
 *   }
 * });
 */
export async function processOfflineQueue(): Promise<number> {
  const queue = getQueue();
  let sentCount = 0;

  for (const item of queue) {
    try {
      const response = await fetch(EMAIL_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item.payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        removeFromQueue(item.payload);
        sentCount++;
        console.log('✅ Email de cola enviado:', item.payload.branchName);
      }
    } catch (error) {
      console.error('❌ Error procesando cola offline:', error);
    }
  }

  return sentCount;
}
```

### Instrucciones de Integración

1. **Crear archivo** en proyecto:
   - Ruta: `/src/utils/emailReports.ts`
   - Copiar código completo

2. **Configurar variables .env**:
   ```env
   # Backend PHP endpoint
   VITE_EMAIL_API_ENDPOINT=https://tudominio.com/api/send-email.php

   # API Key (mismo valor que config.php backend)
   VITE_EMAIL_API_KEY=550e8400-e29b-41d4-a716-446655440000
   ```

3. **Validar imports**:
   - Verificar que `@/types/email` existe (crear en siguiente archivo)
   - Verificar que `@/types` tiene `CalculationData` y `DeliveryCalculation`

---

## 2. htmlReportGenerator.ts

**Ubicación:** `/src/utils/htmlReportGenerator.ts`
**Descripción:** Generador de contenido HTML y texto plano para emails, transformando datos de calculadora a formato legible.

### Código Completo

```typescript
/**
 * CashGuard Paradise - HTML Email Report Generator
 *
 * Genera contenido HTML y texto plano para emails de reportes.
 * Transforma datos de calculadora a formato legible para clientes de correo.
 *
 * @version 1.0
 * @author Sistema IA (Claude Code)
 * @date 10 Oct 2025
 */

import type { CalculationData, DeliveryCalculation, CashCount } from '@/types';
import { EmailReportContent } from '@/types/email';
import { formatCurrency } from './calculations'; // 🔧 FIX Issue #5: Path correcto

// ============================================================================
// INTERFAZ PRINCIPAL
// ============================================================================

/**
 * Genera contenido HTML y texto plano para email de reporte.
 *
 * @param calculationData - Datos del cálculo de caja (Phase 1)
 * @param deliveryCalculation - Datos de entrega (Phase 2, null si omitido)
 * @param branchName - Nombre de la sucursal
 * @param cashierName - Nombre del cajero
 * @param witnessName - Nombre del testigo
 * @param expectedSales - Venta esperada SICAR (opcional)
 * @returns Objeto con HTML y Plain Text versions
 */
export function generateEmailReportContent(
  calculationData: CalculationData,
  deliveryCalculation: DeliveryCalculation | null,
  branchName: string,
  cashierName: string,
  witnessName: string,
  expectedSales?: number
): EmailReportContent {
  // Generar ambas versiones
  const html = generateHtmlReport(
    calculationData,
    deliveryCalculation,
    branchName,
    cashierName,
    witnessName,
    expectedSales
  );

  const plainText = generatePlainTextReport(
    calculationData,
    deliveryCalculation,
    branchName,
    cashierName,
    witnessName,
    expectedSales
  );

  return { html, plainText };
}

// ============================================================================
// HTML REPORT
// ============================================================================

function generateHtmlReport(
  calculationData: CalculationData,
  deliveryCalculation: DeliveryCalculation | null,
  branchName: string,
  cashierName: string,
  witnessName: string,
  expectedSales?: number
): string {
  // Cálculos derivados
  const totalCash = calculationData.totalCash || 0;
  const totalElectronic = calculationData.totalElectronic || 0;
  const totalGeneral = calculationData.totalGeneral || 0;

  const amountToDeliver = deliveryCalculation?.amountToDeliver || 0;
  const remaining = deliveryCalculation ? 50 : totalCash;

  const diff = expectedSales ? totalGeneral - expectedSales : 0;
  const diffLabel = diff > 0 ? 'SOBRANTE' : diff < 0 ? 'FALTANTE' : 'EXACTO';
  const diffColor = diff > 0 ? '#34c759' : diff < 0 ? '#ff3b30' : '#666';

  // Sección resumen ejecutivo
  const resumenEjecutivo = `
    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h2 style="color: #0a84ff; margin-top: 0;">📊 Resumen Ejecutivo</h2>

      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
            <strong>💰 Efectivo Contado:</strong>
          </td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; text-align: right;">
            <strong style="font-size: 18px; color: #0a84ff;">${formatCurrency(totalCash)}</strong>
          </td>
        </tr>

        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
            <strong>💳 Pagos Electrónicos:</strong>
          </td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; text-align: right;">
            ${formatCurrency(totalElectronic)}
          </td>
        </tr>

        ${
          deliveryCalculation
            ? `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
            <strong>📦 Entregado a Gerencia:</strong>
          </td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; text-align: right;">
            ${formatCurrency(amountToDeliver)}
          </td>
        </tr>
        `
            : ''
        }

        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
            <strong>🏢 Quedó en Caja:</strong>
          </td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; text-align: right;">
            ${formatCurrency(remaining)}
          </td>
        </tr>

        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
            <strong>💼 Total Día:</strong>
          </td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; text-align: right;">
            <strong style="font-size: 18px;">${formatCurrency(totalGeneral)}</strong>
          </td>
        </tr>

        ${
          expectedSales
            ? `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
            <strong>🎯 SICAR Esperado:</strong>
          </td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; text-align: right;">
            ${formatCurrency(expectedSales)}
          </td>
        </tr>

        <tr>
          <td style="padding: 10px 0;">
            <strong style="color: ${diffColor};">📉 Diferencia:</strong>
          </td>
          <td style="padding: 10px 0; text-align: right;">
            <strong style="font-size: 18px; color: ${diffColor};">
              ${formatCurrency(Math.abs(diff))} (${diffLabel})
            </strong>
          </td>
        </tr>
        `
            : ''
        }
      </table>
    </div>
  `;

  // Sección anomalías de verificación (si existe)
  let anomaliasSection = '';
  if (deliveryCalculation?.verificationBehavior) {
    const behavior = deliveryCalculation.verificationBehavior;
    const criticalCount = behavior.criticalInconsistencies || 0;
    const warningCount = behavior.secondAttemptSuccesses || 0;

    if (criticalCount > 0 || warningCount > 0) {
      anomaliasSection = `
        <div style="background-color: #fff3cd; border-left: 4px solid #ff9500; padding: 20px; margin: 20px 0;">
          <h2 style="color: #ff9500; margin-top: 0;">⚠️ Anomalías de Verificación Ciega</h2>

          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
                📊 Total Intentos:
              </td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e0e0e0; text-align: right;">
                <strong>${behavior.totalAttempts || 0}</strong>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
                ✅ Éxitos Primer Intento:
              </td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e0e0e0; text-align: right;">
                ${behavior.firstAttemptSuccesses || 0}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
                ⚠️ Éxitos Segundo Intento:
              </td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e0e0e0; text-align: right;">
                <strong style="color: #ff9500;">${warningCount}</strong>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                🔴 Inconsistencias Críticas:
              </td>
              <td style="padding: 8px 0; text-align: right;">
                <strong style="color: #ff3b30;">${criticalCount}</strong>
              </td>
            </tr>
          </table>

          ${
            criticalCount > 0
              ? `
          <p style="margin-top: 15px; padding: 10px; background-color: #ffe5e5; border-radius: 4px; color: #c9302c;">
            <strong>⚠️ ACCIÓN REQUERIDA:</strong> Revisar videos de vigilancia para timestamps críticos.
          </p>
          `
              : ''
          }
        </div>
      `;
    }
  }

  // HTML completo
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; max-width: 600px; margin: 0 auto;">
      ${resumenEjecutivo}
      ${anomaliasSection}

      <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0; text-align: center; color: #999; font-size: 12px;">
        <p>🔒 Reporte generado por CashGuard Paradise</p>
        <p>⚠️ Documento confidencial - No compartir fuera de la organización</p>
      </div>
    </div>
  `;
}

// ============================================================================
// PLAIN TEXT REPORT
// ============================================================================

function generatePlainTextReport(
  calculationData: CalculationData,
  deliveryCalculation: DeliveryCalculation | null,
  branchName: string,
  cashierName: string,
  witnessName: string,
  expectedSales?: number
): string {
  const totalCash = calculationData.totalCash || 0;
  const totalElectronic = calculationData.totalElectronic || 0;
  const totalGeneral = calculationData.totalGeneral || 0;

  const amountToDeliver = deliveryCalculation?.amountToDeliver || 0;
  const remaining = deliveryCalculation ? 50 : totalCash;

  const diff = expectedSales ? totalGeneral - expectedSales : 0;
  const diffLabel = diff > 0 ? 'SOBRANTE' : diff < 0 ? 'FALTANTE' : 'EXACTO';

  let report = `
CASHGUARD PARADISE - REPORTE DE CORTE DE CAJA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 Fecha/Hora: ${calculationData.timestamp}
🏪 Sucursal: ${branchName}
👤 Cajero: ${cashierName}
👁️ Testigo: ${witnessName}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 RESUMEN EJECUTIVO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 Efectivo Contado:        ${formatCurrency(totalCash)}
💳 Pagos Electrónicos:      ${formatCurrency(totalElectronic)}
${deliveryCalculation ? `📦 Entregado a Gerencia:    ${formatCurrency(amountToDeliver)}` : ''}
🏢 Quedó en Caja:           ${formatCurrency(remaining)}

💼 Total Día:               ${formatCurrency(totalGeneral)}
${expectedSales ? `🎯 SICAR Esperado:          ${formatCurrency(expectedSales)}` : ''}
${expectedSales ? `📉 Diferencia:              ${formatCurrency(Math.abs(diff))} (${diffLabel})` : ''}
`;

  // Agregar anomalías si existen
  if (deliveryCalculation?.verificationBehavior) {
    const behavior = deliveryCalculation.verificationBehavior;
    const criticalCount = behavior.criticalInconsistencies || 0;
    const warningCount = behavior.secondAttemptSuccesses || 0;

    if (criticalCount > 0 || warningCount > 0) {
      report += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ ANOMALÍAS DE VERIFICACIÓN CIEGA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Total Intentos:           ${behavior.totalAttempts || 0}
✅ Éxitos Primer Intento:    ${behavior.firstAttemptSuccesses || 0}
⚠️ Éxitos Segundo Intento:   ${warningCount}
🔴 Inconsistencias Críticas: ${criticalCount}

${criticalCount > 0 ? '⚠️ ACCIÓN REQUERIDA: Revisar videos de vigilancia para timestamps críticos.' : ''}
`;
    }
  }

  report += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔒 Reporte generado por CashGuard Paradise
⚠️ Documento confidencial - No compartir fuera de la organización
`;

  return report.trim();
}
```

### Instrucciones de Integración

1. **Crear archivo** en proyecto:
   - Ruta: `/src/utils/htmlReportGenerator.ts`
   - Copiar código completo

2. **Validar imports**:
   - Verificar que `@/types` tiene `CalculationData`, `DeliveryCalculation`, `CashCount`
   - Verificar que `./formatters` exporta `formatCurrency` function

3. **Testing recomendado**:
   - Crear unit test con datos mock
   - Validar HTML rendering en navegador (copiar output a archivo .html)
   - Validar plain text legibilidad

---

## 3. email.ts

**Ubicación:** `/src/types/email.ts`
**Descripción:** Interfaces TypeScript para type safety del sistema de emails.

### Código Completo

```typescript
/**
 * CashGuard Paradise - Email System Type Definitions
 *
 * Interfaces TypeScript para sistema de envío de correos.
 *
 * @version 1.0
 * @author Sistema IA (Claude Code)
 * @date 10 Oct 2025
 */

// ============================================================================
// REQUEST PAYLOAD
// ============================================================================

/**
 * Payload enviado al backend PHP para envío de email.
 */
export interface EmailReportPayload {
  /**
   * API Key para autenticación (UUID v4)
   * Debe coincidir con el valor en backend config.php
   */
  apiKey: string;

  /**
   * Timestamp ISO 8601 del momento de generación del reporte
   * @example "2025-10-10T14:30:00Z"
   */
  timestamp: string;

  /**
   * Nombre de la sucursal
   * @example "Los Héroes"
   */
  branchName: string;

  /**
   * Nombre del cajero que realizó el corte
   * @example "Adonay Torres"
   */
  cashierName: string;

  /**
   * Nombre del testigo que validó el corte
   * @example "Tito Gomez"
   */
  witnessName: string;

  /**
   * Severidad del reporte basado en anomalías detectadas
   */
  severity: 'CRÍTICO' | 'ADVERTENCIAS' | 'NORMAL';

  /**
   * Contenido del reporte en formato HTML
   * Incluye estilos inline para compatibilidad con clientes de correo
   */
  reportHtml: string;

  /**
   * Contenido del reporte en texto plano (fallback)
   * Para clientes de correo que no soporten HTML
   */
  reportPlainText: string;
}

// ============================================================================
// RESPONSE
// ============================================================================

/**
 * Respuesta del backend PHP después de envío exitoso.
 */
export interface EmailSendResponse {
  /**
   * Indica si el envío fue exitoso
   */
  success: boolean;

  /**
   * Mensaje descriptivo del resultado
   */
  message: string;

  /**
   * Número de intentos requeridos para envío exitoso (1-3)
   */
  attempts?: number;

  /**
   * Lista de destinatarios que recibieron el email
   */
  recipients?: string[];

  /**
   * Código de error (solo presente si success = false)
   */
  error?: string;

  /**
   * Detalle del último error (solo presente si success = false)
   */
  lastError?: string;
}

// ============================================================================
// EMAIL CONTENT
// ============================================================================

/**
 * Contenido generado del reporte en ambos formatos.
 */
export interface EmailReportContent {
  /**
   * Versión HTML del reporte con estilos inline
   */
  html: string;

  /**
   * Versión texto plano del reporte (fallback)
   */
  plainText: string;
}

// ============================================================================
// OFFLINE QUEUE
// ============================================================================

/**
 * Item de la cola offline en LocalStorage.
 */
export interface QueuedEmailItem {
  /**
   * Payload original que falló al enviar
   */
  payload: EmailReportPayload;

  /**
   * Timestamp Unix del momento en que se agregó a la cola
   */
  timestamp: number;

  /**
   * Número de intentos de reenvío realizados
   */
  attempts: number;
}
```

### Instrucciones de Integración

1. **Crear archivo** en proyecto:
   - Ruta: `/src/types/email.ts`
   - Copiar código completo

2. **Validar estructura `types/`**:
   - Si no existe directorio `/src/types/`, crearlo
   - Si existe `index.ts` en `/src/types/`, agregar export:
     ```typescript
     export * from './email';
     ```

3. **Validar con TypeScript**:
   ```bash
   npx tsc --noEmit
   ```
   Resultado esperado: 0 errors

---

## 4. CashCalculation.tsx (Modificación)

**Ubicación:** `/src/components/CashCalculation.tsx`
**Descripción:** Modificación del componente existente para agregar botón "Enviar Email" + handler de envío automático.

### Cambios a Realizar

**NOTA:** Este componente ya existe en el proyecto. Los siguientes cambios deben **agregarse** al código existente, NO reemplazar el archivo completo.

#### Paso 1: Agregar Imports (2 líneas)

**Ubicación:** Inicio del archivo CashCalculation.tsx, después de imports existentes (~línea 20)

```typescript
// 🤖 [IA] - v1.0: Email Sender Integration
import { Mail } from 'lucide-react'; // 🔧 FIX Issue #4: Ícono mail agregado
import { sendEmailReport, processOfflineQueue } from '@/utils/emailReports';
import { useToast } from '@/hooks/use-toast';
```

#### Paso 2: Agregar State Hook

**Ubicación:** Dentro del componente, después de los states existentes

```typescript
// 🤖 [IA] - v1.0: Email Sender State
const [isSendingEmail, setIsSendingEmail] = useState(false);
const { toast } = useToast();
```

#### Paso 3: Agregar Handler Function

**Ubicación:** Antes del return del componente, junto a otros handlers

```typescript
// 🤖 [IA] - v1.0: Email Sender Handler
const handleSendEmail = async () => {
  if (!calculationData) {
    toast({
      title: '❌ Error',
      description: 'No hay datos de cálculo para enviar',
      variant: 'destructive',
    });
    return;
  }

  setIsSendingEmail(true);

  try {
    const response = await sendEmailReport(
      calculationData,
      deliveryCalculation,
      branchData.name,
      employeeData.cashier,
      employeeData.witness,
      branchData.expectedSales
    );

    toast({
      title: '✅ Email Enviado',
      description: `Reporte enviado a ${response.recipients?.length || 0} destinatarios`,
      variant: 'default',
    });

    console.log('📧 Email enviado exitosamente:', response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

    toast({
      title: '⚠️ Email en Cola',
      description: errorMessage,
      variant: 'default',
    });

    console.warn('⚠️ Email agregado a cola offline:', error);
  } finally {
    setIsSendingEmail(false);
  }
};
```

#### Paso 4: Agregar Botón en UI (20 líneas)

**Ubicación EXACTA:** 🔧 FIX Issue #4 - Líneas ~1080-1100 de CashCalculation.tsx
- **DESPUÉS de:** Botones "Compartir en WhatsApp", "Copiar", "Compartir" (sección de acciones reportSent)
- **ANTES de:** Botón "Finalizar" (PrimaryActionButton)
- **Contexto:** Dentro del bloque condicional `{reportSent && (...)}` donde resultados están desbloqueados

```typescript
{/* 🤖 [IA] - v1.0: Botón Email Sender */}
{/* 🔧 FIX Issue #4: Integración anti-fraude v1.3.7 - disabled hasta WhatsApp confirmado */}
<Button
  onClick={handleSendEmail}
  disabled={isSendingEmail || !reportSent} // ← CRÍTICO: Solo habilitado DESPUÉS de confirmar WhatsApp
  className="gap-2"
  variant="default"
>
  {isSendingEmail ? (
    <>
      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      Enviando...
    </>
  ) : (
    <>
      <Mail className="h-4 w-4" />
      Enviar Email
    </>
  )}
</Button>
```

**⚠️ VALIDACIÓN CRÍTICA:**
- ✅ Botón DEBE estar dentro del bloque `{reportSent && (...)}`
- ✅ `disabled={!reportSent}` DEBE estar presente (anti-fraude v1.3.7)
- ✅ Ícono `<Mail />` debe importarse (ver Paso 1)
- ❌ NO colocar antes de confirmación WhatsApp (riesgo bypassing anti-fraude)

#### Paso 5: Agregar useEffect para Queue Offline (Opcional)

**Ubicación:** Después de otros useEffects del componente

```typescript
// 🤖 [IA] - v1.0: Procesar cola offline al montar componente
useEffect(() => {
  const processQueue = async () => {
    const sentCount = await processOfflineQueue();
    if (sentCount > 0) {
      toast({
        title: '📧 Cola Procesada',
        description: `${sentCount} reportes enviados desde cola offline`,
        variant: 'default',
      });
    }
  };

  // Intentar procesar cola si hay conexión
  if (navigator.onLine) {
    processQueue();
  }

  // Listener para reconexión
  const handleOnline = () => {
    processQueue();
  };

  window.addEventListener('online', handleOnline);
  return () => window.removeEventListener('online', handleOnline);
}, [toast]);
```

### Resumen de Cambios CashCalculation.tsx

| Sección | Líneas Agregadas | Descripción |
|---------|------------------|-------------|
| Imports | +2 | sendEmailReport, processOfflineQueue, useToast |
| State Hooks | +2 | isSendingEmail, toast |
| Handler Function | +37 | handleSendEmail con try/catch y toasts |
| UI Button | +20 | Botón "Enviar Email" con spinner loading |
| useEffect Queue | +20 | Procesamiento cola offline al montar + listener online |
| **TOTAL** | **~81 líneas** | Integración completa email sender |

---

## ✅ Checklist de Validación Frontend

Después de integrar los 4 archivos, validar:

- [ ] `emailReports.ts` creado en `/src/utils/` sin errores TypeScript
- [ ] `htmlReportGenerator.ts` creado en `/src/utils/` sin errores TypeScript
- [ ] `email.ts` creado en `/src/types/` sin errores TypeScript
- [ ] `CashCalculation.tsx` modificado con 5 pasos aplicados correctamente
- [ ] Variables `.env` configuradas (VITE_EMAIL_API_ENDPOINT, VITE_EMAIL_API_KEY)
- [ ] Build exitoso sin warnings: `npm run build`
- [ ] TypeScript validado: `npx tsc --noEmit`
- [ ] ESLint sin errores: `npm run lint`
- [ ] Imports resueltos correctamente (sin errores de módulos no encontrados)
- [ ] Botón "Enviar Email" visible en pantalla de reporte final
- [ ] Toast notifications funcionan al hacer click en botón

---

## 🐛 Troubleshooting Frontend

### Error: "Cannot find module '@/utils/emailReports'"

**Síntoma:** Build falla con import no resuelto

**Causa:** Archivo no creado o path alias incorrecto

**Solución:**
1. Verificar archivo existe en `/src/utils/emailReports.ts`
2. Verificar `tsconfig.json` tiene path alias configurado:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

### Error: "formatCurrency is not a function"

**Síntoma:** Runtime error al generar HTML report

**Causa:** Función `formatCurrency` no existe en `/src/utils/formatters.ts`

**Solución:**
1. Si `formatters.ts` NO existe, crear con función básica:
   ```typescript
   export function formatCurrency(amount: number): string {
     return new Intl.NumberFormat('en-US', {
       style: 'currency',
       currency: 'USD',
     }).format(amount);
   }
   ```
2. Si existe pero no exporta `formatCurrency`, agregar export

### Error: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Síntoma:** Fetch request bloqueado en DevTools Network

**Causa:** Backend no configurado correctamente o dominio frontend incorrecto

**Solución:**
1. Verificar `.htaccess` backend tiene dominio correcto
2. Verificar `Access-Control-Allow-Origin` incluye dominio de Netlify
3. Testing local: Usar `http://localhost:5173` en CORS temporalmente

### Error: "Email guardado en cola offline" (siempre)

**Síntoma:** Todos los envíos fallan y van a cola

**Causa:** Backend endpoint incorrecto, API Key inválido, o CORS bloqueado

**Solución:**
1. Verificar `.env` → `VITE_EMAIL_API_ENDPOINT` apunta a URL correcta
2. Verificar `.env` → `VITE_EMAIL_API_KEY` coincide con backend config.php
3. Abrir DevTools → Network → Ver response del POST (200 vs 401 vs 500)
4. Verificar backend funcionando: `curl -X POST https://tudominio.com/api/send-email.php`

---

## 📞 Testing Recomendado

### Test 1: Email Sender Unit Test

**Objetivo:** Validar generación HTML + Plain Text

**Steps:**
1. Crear archivo de test: `/src/utils/__tests__/htmlReportGenerator.test.ts`
2. Mock data: `CalculationData` + `DeliveryCalculation`
3. Llamar `generateEmailReportContent()`
4. Assert: HTML contiene "Resumen Ejecutivo", plain text contiene "CASHGUARD PARADISE"

### Test 2: Integration Test con Backend

**Objetivo:** Validar envío completo E2E

**Steps:**
1. Build frontend: `npm run build`
2. Deploy a Netlify preview
3. Configurar `.env` con API endpoint real
4. Completar flujo de caja hasta pantalla final
5. Click botón "Enviar Email"
6. Verificar toast success: "Email enviado a X destinatarios"
7. Verificar email recibido en inbox gerencia/auditoría

### Test 3: Offline Queue

**Objetivo:** Validar fallback cuando backend down

**Steps:**
1. Detener backend (o cambiar URL a inválida temporalmente)
2. Click botón "Enviar Email"
3. Verificar toast warning: "Email en cola offline"
4. Verificar LocalStorage contiene item en `cashguard_email_queue`
5. Restaurar backend (URL correcta)
6. Refrescar página
7. Verificar toast success: "X reportes enviados desde cola offline"
8. Verificar email recibido

---

## 📝 Próximos Pasos

Después de integrar el frontend:

1. ✅ Testing local (http://localhost:5173)
2. ✅ Build production: `npm run build`
3. ✅ Deploy a Netlify (branch preview o main)
4. ✅ Configurar `.env` production con valores reales
5. ✅ Validar con `TESTING_GUIDE.md` (Phases 2-5)

---

**Fin del documento `CODIGO_FRONTEND.md`**
