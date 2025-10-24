# 7. PLAN DE IMPLEMENTACIÓN DETALLADO

**Proyecto:** Sistema de Control de Envíos COD - CashGuard Paradise
**Versión:** 1.0
**Fecha:** 23 Octubre 2025
**Autor:** Claude Code (Anthropic)
**Documento:** 7 de 9 - Plan de Implementación

---

## ÍNDICE

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Estrategia de Implementación](#estrategia-de-implementacion)
3. [8 Fases Detalladas](#8-fases-detalladas)
4. [Timeline y Recursos](#timeline-y-recursos)
5. [Gestión de Riesgos](#gestion-de-riesgos)
6. [Testing y QA](#testing-y-qa)
7. [Deployment Strategy](#deployment-strategy)
8. [Post-Deployment](#post-deployment)

---

## RESUMEN EJECUTIVO

### Objetivo
Implementar **Opción B: Módulo de Envíos + Dashboard Acumulado** para eliminar el workaround actual de registros falsos en SICAR y automatizar el ajuste de SICAR esperado considerando envíos pendientes COD.

### Alcance Total
- **Duración:** 23-31 horas (3-4 semanas en jornadas 8h)
- **Costo estimado:** $1,800 - $2,500 USD
- **Equipo:** 1 desarrollador senior + 1 tester
- **Fases:** 8 fases secuenciales
- **Entregables:** 15+ archivos de código + 30+ tests + documentación completa

### Fases de Alto Nivel

| Fase | Nombre | Duración | Criticidad | Dependencies |
|------|--------|----------|------------|--------------|
| **FASE 1** | Types & Validations | 2-3h | 🔴 Alta | Ninguna |
| **FASE 2** | Componente Registro | 4-5h | 🔴 Alta | FASE 1 |
| **FASE 3** | Integración Wizard | 3-4h | 🟡 Media | FASE 2 |
| **FASE 4** | Cálculos & Ajuste SICAR | 2-3h | 🔴 **CRÍTICA** | FASE 1 |
| **FASE 5** | Dashboard Acumulados | 5-6h | 🟡 Media | FASE 1, 2, 4 |
| **FASE 6** | Sistema Alertas | 2-3h | 🟢 Baja | FASE 5 |
| **FASE 7** | Reporte WhatsApp | 2-3h | 🟡 Media | FASE 4, 5 |
| **FASE 8** | Testing & Validación | 3-4h | 🔴 Alta | FASE 1-7 |

### Hitos Críticos

1. **Hito 1 (FASE 1 + 4):** Sistema de cálculo SICAR funcional → 4-6h
2. **Hito 2 (FASE 2 + 3):** Registro de envíos integrado en wizard → 7-9h
3. **Hito 3 (FASE 5 + 6):** Dashboard con alertas operativo → 7-9h
4. **Hito 4 (FASE 7 + 8):** Reportería completa + tests → 5-7h

---

## ESTRATEGIA DE IMPLEMENTACIÓN

### Principios Guía

1. **Iterativo Incremental:** Cada fase entrega valor funcional
2. **Testing Continuo:** TIER 0 tests obligatorios en FASE 4 y 8
3. **Zero Breaking Changes:** Funcionalidad existente CashGuard preservada
4. **Backward Compatible:** localStorage con versionado para migraciones
5. **Mobile First:** UI responsive desde inicio (Tailwind + clamp())

### Dependencias Técnicas

**Críticas (bloqueantes):**
- FASE 1 → FASE 2, 3, 4, 5 (tipos base)
- FASE 2 → FASE 3 (componente completo requerido)
- FASE 4 → FASE 7 (cálculos para reporte)
- FASE 1-7 → FASE 8 (todo el código para testear)

**Opcionales (paralelizables):**
- FASE 3 y FASE 4 pueden ejecutarse en paralelo (equipos diferentes)
- FASE 6 puede ejecutarse en paralelo con FASE 7

### Estrategia de Branching

```
main (production)
  ↓
feature/deliveries-system (base branch)
  ├── feature/phase1-types (FASE 1)
  ├── feature/phase2-form (FASE 2)
  ├── feature/phase3-wizard (FASE 3)
  ├── feature/phase4-calculations (FASE 4) ← TIER 0 MANDATORY
  ├── feature/phase5-dashboard (FASE 5)
  ├── feature/phase6-alerts (FASE 6)
  ├── feature/phase7-whatsapp (FASE 7)
  └── feature/phase8-testing (FASE 8)
```

**Merge Strategy:**
- FASE 1 → merge to `feature/deliveries-system` (bloqueante para todas)
- FASE 2-3 → merge sequential to `feature/deliveries-system`
- FASE 4 → merge to `feature/deliveries-system` (solo después TIER 0 tests ✅)
- FASE 5-7 → merge sequential
- FASE 8 → merge final to `feature/deliveries-system` → PR a `main`

---

## 8 FASES DETALLADAS

### FASE 1: TypeScript Types & Validations (2-3 horas)

**Objetivo:** Definir tipos base, interfaces, constantes y validaciones runtime para todo el módulo de envíos.

#### Tareas

| # | Tarea | Duración | Archivos |
|---|-------|----------|----------|
| 1.1 | Crear `/src/types/deliveries.ts` | 45 min | `deliveries.ts` |
| 1.2 | Definir interfaces (DeliveryEntry, DeliverySummary) | 30 min | `deliveries.ts` |
| 1.3 | Crear constantes (STORAGE_KEYS, VALIDATION) | 20 min | `deliveries.ts` |
| 1.4 | Implementar type guard `isDeliveryEntry()` | 30 min | `deliveries.ts` |
| 1.5 | Documentar JSDoc completo | 15 min | `deliveries.ts` |

#### Entregables

**Archivo:** `/src/types/deliveries.ts` (~200 líneas)

**Contenido:**
```typescript
// 1. Type Definitions
export type CourierType = 'C807' | 'Melos' | 'Otro';
export type DeliveryStatus = 'pending_cod' | 'paid' | 'cancelled' | 'rejected';
export type AlertLevel = 'ok' | 'warning' | 'urgent' | 'critical';

// 2. Main Interface
export interface DeliveryEntry {
  id: string;                    // UUID v4
  customerName: string;          // 3-100 caracteres
  amount: number;                // 0.01 - 10000.00 USD
  courier: CourierType;
  status: DeliveryStatus;
  createdAt: string;             // ISO 8601
  paidAt?: string;               // ISO 8601
  guideNumber?: string;          // Número de guía courier
  invoiceNumber?: string;        // Número de factura
  notes?: string;                // 0-500 caracteres
}

// 3. Summary Interface
export interface DeliverySummary {
  totalPending: number;
  countPending: number;
  byCourier: {
    C807: { total: number; count: number };
    Melos: { total: number; count: number };
    Otro: { total: number; count: number };
  };
  alerts: {
    warning7Days: number;
    urgent15Days: number;
    critical30Days: number;
  };
}

// 4. Storage Constants
export const STORAGE_KEYS = {
  PENDING: 'cashguard_deliveries_pending',
  HISTORY: 'cashguard_deliveries_history',
  LAST_CLEANUP: 'cashguard_deliveries_cleanup'
} as const;

export const DELIVERY_VALIDATION = {
  MIN_CUSTOMER_NAME: 3,
  MAX_CUSTOMER_NAME: 100,
  MIN_AMOUNT: 0.01,
  MAX_AMOUNT: 10000,
  MAX_NOTES: 500,
  HISTORY_RETENTION_DAYS: 90
} as const;

// 5. Type Guard
export function isDeliveryEntry(obj: unknown): obj is DeliveryEntry {
  if (!obj || typeof obj !== 'object') return false;

  const d = obj as DeliveryEntry;

  // Validate required fields
  if (typeof d.id !== 'string' || d.id.length === 0) return false;
  if (typeof d.customerName !== 'string' ||
      d.customerName.length < DELIVERY_VALIDATION.MIN_CUSTOMER_NAME ||
      d.customerName.length > DELIVERY_VALIDATION.MAX_CUSTOMER_NAME) return false;
  if (typeof d.amount !== 'number' ||
      d.amount < DELIVERY_VALIDATION.MIN_AMOUNT ||
      d.amount > DELIVERY_VALIDATION.MAX_AMOUNT) return false;
  if (!['C807', 'Melos', 'Otro'].includes(d.courier)) return false;
  if (!['pending_cod', 'paid', 'cancelled', 'rejected'].includes(d.status)) return false;
  if (typeof d.createdAt !== 'string') return false;

  // Validate optional fields if present
  if (d.paidAt !== undefined && typeof d.paidAt !== 'string') return false;
  if (d.guideNumber !== undefined && typeof d.guideNumber !== 'string') return false;
  if (d.invoiceNumber !== undefined && typeof d.invoiceNumber !== 'string') return false;
  if (d.notes !== undefined &&
      (typeof d.notes !== 'string' || d.notes.length > DELIVERY_VALIDATION.MAX_NOTES)) return false;

  return true;
}
```

#### Criterios de Aceptación

- ✅ TypeScript compila sin errores (`npx tsc --noEmit`)
- ✅ Type guard valida correctamente 10+ casos (valid + invalid)
- ✅ JSDoc completo en todas las interfaces públicas
- ✅ Constantes exportadas con `as const` (immutability)
- ✅ Zero `any` types (REGLAS_DE_LA_CASA.md compliance)

#### Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Type guard incompleto | Baja | Alto | Testing exhaustivo con 20+ casos edge |
| Constantes incorrectas | Media | Medio | Validar contra datos históricos Paradise |
| Breaking changes futuros | Baja | Alto | Versionado de interfaces (v1.0, v1.1...) |

---

### FASE 2: Componente Registro de Envíos (4-5 horas)

**Objetivo:** Crear componente `DeliveryManager` con formulario para registrar nuevos envíos COD durante Evening Cut.

#### Tareas

| # | Tarea | Duración | Archivos |
|---|-------|----------|----------|
| 2.1 | Crear hook `useDeliveries.ts` | 90 min | `useDeliveries.ts` |
| 2.2 | Implementar localStorage persistence | 45 min | `useDeliveries.ts` |
| 2.3 | Crear `DeliveryManager.tsx` UI | 75 min | `DeliveryManager.tsx` |
| 2.4 | Implementar validación formulario | 30 min | `DeliveryManager.tsx` |
| 2.5 | Agregar estados visuales (loading, error, success) | 30 min | `DeliveryManager.tsx` |

#### Entregables

**Archivo 1:** `/src/hooks/useDeliveries.ts` (~180 líneas)

```typescript
import { useState, useCallback, useEffect } from 'react';
import { DeliveryEntry, STORAGE_KEYS, isDeliveryEntry } from '@/types/deliveries';

export interface UseDeliveriesReturn {
  pending: DeliveryEntry[];
  addDelivery: (delivery: Omit<DeliveryEntry, 'id' | 'createdAt'>) => void;
  updateDelivery: (id: string, updates: Partial<DeliveryEntry>) => void;
  deleteDelivery: (id: string) => void;
  markAsPaid: (id: string) => void;
  isLoading: boolean;
}

export function useDeliveries(): UseDeliveriesReturn {
  const [pending, setPending] = useState<DeliveryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const loadFromStorage = (): DeliveryEntry[] => {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.PENDING);
        if (!raw) return [];

        const data = JSON.parse(raw);
        if (data.version !== '1.0') return [];

        const validated = data.deliveries.filter(isDeliveryEntry);
        return validated;
      } catch (error) {
        console.error('[useDeliveries] Error loading:', error);
        return [];
      }
    };

    const deliveries = loadFromStorage();
    setPending(deliveries);
    setIsLoading(false);
  }, []);

  // Save to localStorage (debounced)
  const saveToStorage = useCallback(
    debounce((deliveries: DeliveryEntry[]) => {
      try {
        const data = {
          version: '1.0',
          lastUpdated: new Date().toISOString(),
          deliveries
        };
        localStorage.setItem(STORAGE_KEYS.PENDING, JSON.stringify(data));
      } catch (error) {
        console.error('[useDeliveries] Error saving:', error);
      }
    }, 500),
    []
  );

  // Add delivery
  const addDelivery = useCallback((delivery: Omit<DeliveryEntry, 'id' | 'createdAt'>) => {
    const newDelivery: DeliveryEntry = {
      ...delivery,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };

    setPending(prev => {
      const updated = [...prev, newDelivery];
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // Mark as paid
  const markAsPaid = useCallback((id: string) => {
    setPending(prev => {
      const delivery = prev.find(d => d.id === id);
      if (!delivery) return prev;

      // Move to history
      const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || '[]');
      history.push({
        ...delivery,
        status: 'paid',
        paidAt: new Date().toISOString()
      });
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));

      // Remove from pending
      const updated = prev.filter(d => d.id !== id);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // ... más funciones (updateDelivery, deleteDelivery)

  return {
    pending,
    addDelivery,
    updateDelivery,
    deleteDelivery,
    markAsPaid,
    isLoading
  };
}
```

**Archivo 2:** `/src/components/deliveries/DeliveryManager.tsx` (~250 líneas)

```typescript
import React, { useState } from 'react';
import { useDeliveries } from '@/hooks/useDeliveries';
import { CourierType } from '@/types/deliveries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const DeliveryManager: React.FC = () => {
  const { addDelivery, pending } = useDeliveries();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    amount: '',
    courier: 'C807' as CourierType,
    guideNumber: '',
    invoiceNumber: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.customerName.length < 3) {
      newErrors.customerName = 'Mínimo 3 caracteres';
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount < 0.01 || amount > 10000) {
      newErrors.amount = 'Monto debe estar entre $0.01 y $10,000.00';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    addDelivery({
      customerName: formData.customerName.trim(),
      amount: parseFloat(formData.amount),
      courier: formData.courier,
      status: 'pending_cod',
      guideNumber: formData.guideNumber.trim() || undefined,
      invoiceNumber: formData.invoiceNumber.trim() || undefined,
      notes: formData.notes.trim() || undefined
    });

    // Reset form
    setFormData({
      customerName: '',
      amount: '',
      courier: 'C807',
      guideNumber: '',
      invoiceNumber: '',
      notes: ''
    });
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-4">
      {!isFormOpen && (
        <Button onClick={() => setIsFormOpen(true)}>
          📦 Registrar Envío COD
        </Button>
      )}

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
          <div>
            <Label htmlFor="customerName">Cliente *</Label>
            <Input
              id="customerName"
              value={formData.customerName}
              onChange={(e) => setFormData(f => ({ ...f, customerName: e.target.value }))}
              placeholder="Nombre del cliente"
            />
            {errors.customerName && (
              <p className="text-xs text-red-500 mt-1">{errors.customerName}</p>
            )}
          </div>

          <div>
            <Label htmlFor="amount">Monto (USD) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData(f => ({ ...f, amount: e.target.value }))}
              placeholder="0.00"
            />
            {errors.amount && (
              <p className="text-xs text-red-500 mt-1">{errors.amount}</p>
            )}
          </div>

          {/* ... más campos (courier, guideNumber, invoiceNumber, notes) ... */}

          <div className="flex gap-2">
            <Button type="submit">Registrar</Button>
            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {/* Lista de envíos pendientes */}
      {pending.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Envíos Pendientes ({pending.length})</h3>
          {/* ... renderizar lista ... */}
        </div>
      )}
    </div>
  );
};
```

#### Criterios de Aceptación

- ✅ Hook `useDeliveries` gestiona estado completo (add, update, delete, markAsPaid)
- ✅ localStorage persiste datos con debounce 500ms
- ✅ Formulario valida todos los campos requeridos
- ✅ UI muestra errores en tiempo real
- ✅ Lista de pendientes se actualiza automáticamente
- ✅ Componente responsive (mobile + desktop)
- ✅ Zero `any` types en todo el código

#### Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| localStorage quota exceeded | Media | Alto | Implementar cleanup automático 90 días |
| Validación insuficiente | Media | Medio | Testear con datos malformados Paradise |
| UX confusa en móvil | Baja | Medio | Testing en iPhone SE + Android bajo rendimiento |

---

### FASE 3: Integración Wizard Evening Cut (3-4 horas)

**Objetivo:** Integrar `DeliveryManager` en el wizard de Evening Cut como paso opcional después de pagos electrónicos.

#### Tareas

| # | Tarea | Duración | Archivos |
|---|-------|----------|----------|
| 3.1 | Agregar paso "Envíos COD" en `useWizardNavigation.ts` | 30 min | `useWizardNavigation.ts` |
| 3.2 | Crear `DeliveryWizardStep.tsx` wrapper | 45 min | `DeliveryWizardStep.tsx` |
| 3.3 | Integrar en `InitialWizardModal.tsx` | 60 min | `InitialWizardModal.tsx` |
| 3.4 | Agregar navegación condicional (skip si sin envíos) | 45 min | `useWizardNavigation.ts` |
| 3.5 | Testing navegación wizard completo | 30 min | Manual |

#### Entregables

**Archivo 1:** `/src/hooks/useWizardNavigation.ts` (modificación)

```typescript
// Agregar nuevo paso
export const WIZARD_STEPS = {
  // ... pasos existentes
  DELIVERIES: 6, // Nuevo paso después de Electronic Payments (5)
  EXPECTED_SALES: 7 // Renumerado de 6 a 7
} as const;

// Modificar validación
const canProceed = useCallback((step: number): boolean => {
  switch (step) {
    // ... validaciones existentes
    case WIZARD_STEPS.DELIVERIES:
      // Opcional - siempre puede avanzar (incluso sin registrar envíos)
      return true;
    case WIZARD_STEPS.EXPECTED_SALES:
      return expectedSales > 0;
    default:
      return false;
  }
}, [/* deps */]);
```

**Archivo 2:** `/src/components/wizard/DeliveryWizardStep.tsx` (nuevo ~120 líneas)

```typescript
import React from 'react';
import { DeliveryManager } from '@/components/deliveries/DeliveryManager';
import { useDeliveries } from '@/hooks/useDeliveries';

export const DeliveryWizardStep: React.FC = () => {
  const { pending } = useDeliveries();

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">📦 Envíos COD (Opcional)</h2>
        <p className="text-sm text-gray-600">
          Si tienes envíos que el cliente pagará al recibir (COD), regístralos aquí.
          Esto ajustará automáticamente el SICAR esperado.
        </p>
      </div>

      <DeliveryManager />

      {pending.length > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm">
            ✅ {pending.length} envío{pending.length > 1 ? 's' : ''} registrado{pending.length > 1 ? 's' : ''}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            El SICAR esperado se ajustará automáticamente restando estos montos.
          </p>
        </div>
      )}
    </div>
  );
};
```

**Archivo 3:** `/src/components/wizard/InitialWizardModal.tsx` (modificación)

```typescript
// Agregar caso en switch de renderStep
case WIZARD_STEPS.DELIVERIES:
  return <DeliveryWizardStep />;
```

#### Criterios de Aceptación

- ✅ Wizard tiene 7 pasos (5 existentes + 1 deliveries + 1 expected sales)
- ✅ Paso "Envíos COD" aparece después de "Pagos Electrónicos"
- ✅ Paso es opcional (botón "Siguiente" siempre habilitado)
- ✅ Contador de pasos actualizado (Paso 6 de 7)
- ✅ Navegación backward/forward funciona correctamente
- ✅ Datos de envíos persisten al navegar entre pasos
- ✅ UI responsive en wizard modal

#### Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Breaking changes wizard existente | Media | Alto | Testing exhaustivo flujo completo Evening Cut |
| Numeración de pasos inconsistente | Baja | Bajo | Documentar claramente en código y UI |
| State loss al navegar | Media | Alto | useDeliveries hook persiste en localStorage |

---

### FASE 4: Cálculos & Ajuste SICAR (2-3 horas) 🔴 TIER 0 MANDATORY

**Objetivo:** Implementar helpers de cálculo para ajustar SICAR esperado considerando envíos pendientes COD. **CRÍTICO:** TIER 0 tests obligatorios para funciones financieras.

#### Tareas

| # | Tarea | Duración | Archivos |
|---|-------|----------|----------|
| 4.1 | Crear `/src/utils/deliveryCalculation.ts` | 60 min | `deliveryCalculation.ts` |
| 4.2 | Implementar `getDaysPending()` | 15 min | `deliveryCalculation.ts` |
| 4.3 | Implementar `getAlertLevel()` | 15 min | `deliveryCalculation.ts` |
| 4.4 | Implementar `buildDeliverySummary()` | 30 min | `deliveryCalculation.ts` |
| 4.5 | Implementar `adjustSICAR()` **CRÍTICO** | 30 min | `deliveryCalculation.ts` |
| 4.6 | **TIER 0 tests (30+ tests)** | 60 min | `deliveryCalculation.test.ts` |

#### Entregables

**Archivo 1:** `/src/utils/deliveryCalculation.ts` (~150 líneas)

```typescript
import { DeliveryEntry, DeliverySummary, AlertLevel } from '@/types/deliveries';

/**
 * Calcula días transcurridos desde creación del envío
 * @param createdAt - ISO 8601 timestamp
 * @returns Días pendientes (0 si fecha futura)
 */
export function getDaysPending(createdAt: string): number {
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Determina nivel de alerta según días pendientes
 * @param days - Días transcurridos
 * @returns Nivel de alerta (ok, warning, urgent, critical)
 */
export function getAlertLevel(days: number): AlertLevel {
  if (days >= 30) return 'critical';
  if (days >= 15) return 'urgent';
  if (days >= 7) return 'warning';
  return 'ok';
}

/**
 * Construye resumen agregado de envíos pendientes
 * @param deliveries - Array de envíos pendientes
 * @returns Objeto DeliverySummary con totales y alertas
 */
export function buildDeliverySummary(deliveries: DeliveryEntry[]): DeliverySummary {
  const summary: DeliverySummary = {
    totalPending: 0,
    countPending: deliveries.length,
    byCourier: {
      C807: { total: 0, count: 0 },
      Melos: { total: 0, count: 0 },
      Otro: { total: 0, count: 0 }
    },
    alerts: {
      warning7Days: 0,
      urgent15Days: 0,
      critical30Days: 0
    }
  };

  deliveries.forEach(delivery => {
    // Sumar totales
    summary.totalPending += delivery.amount;
    summary.byCourier[delivery.courier].total += delivery.amount;
    summary.byCourier[delivery.courier].count += 1;

    // Contar alertas
    const days = getDaysPending(delivery.createdAt);
    const level = getAlertLevel(days);

    if (level === 'warning') summary.alerts.warning7Days += 1;
    if (level === 'urgent') summary.alerts.urgent15Days += 1;
    if (level === 'critical') summary.alerts.critical30Days += 1;
  });

  return summary;
}

/**
 * Ajusta SICAR esperado restando pagos electrónicos y envíos pendientes
 * @param sicarTotal - Total SICAR del día (devengado)
 * @param electronicPayments - Total pagos electrónicos
 * @param deliveries - Envíos pendientes COD
 * @returns Efectivo esperado en caja (cash basis)
 *
 * @example
 * adjustSICAR(1550, 100, [delivery1, delivery2]) // 1550 - 100 - 113 - 84.75 = 1252.25
 */
export function adjustSICAR(
  sicarTotal: number,
  electronicPayments: number,
  deliveries: DeliveryEntry[]
): number {
  const deliveryTotal = deliveries.reduce((sum, d) => sum + d.amount, 0);
  const adjusted = sicarTotal - electronicPayments - deliveryTotal;
  return Math.max(0, adjusted); // No puede ser negativo
}
```

**Archivo 2:** `/src/utils/__tests__/deliveryCalculation.test.ts` (~400 líneas) 🔴 **TIER 0 MANDATORY**

```typescript
import { describe, it, expect, jest } from 'vitest';
import {
  getDaysPending,
  getAlertLevel,
  buildDeliverySummary,
  adjustSICAR
} from '../deliveryCalculation';
import { DeliveryEntry } from '@/types/deliveries';

describe('deliveryCalculation.ts - TIER 0 (MANDATORY)', () => {

  describe('getDaysPending()', () => {
    it('debe calcular días correctamente', () => {
      const created = new Date('2025-10-15T14:00:00Z');
      const now = new Date('2025-10-23T14:00:00Z');
      jest.spyOn(global, 'Date').mockImplementation(() => now as any);

      expect(getDaysPending(created.toISOString())).toBe(8);

      jest.restoreAllMocks();
    });

    it('debe retornar 0 para fechas futuras', () => {
      const future = new Date(Date.now() + 86400000).toISOString(); // +1 día
      expect(getDaysPending(future)).toBe(0);
    });

    it('debe manejar fechas inválidas', () => {
      expect(getDaysPending('invalid-date')).toBeNaN();
    });

    it('debe calcular correctamente para mismo día', () => {
      const now = new Date().toISOString();
      expect(getDaysPending(now)).toBe(0);
    });
  });

  describe('getAlertLevel()', () => {
    it('debe retornar "ok" para 0-6 días', () => {
      expect(getAlertLevel(0)).toBe('ok');
      expect(getAlertLevel(6)).toBe('ok');
    });

    it('debe retornar "warning" para 7-14 días', () => {
      expect(getAlertLevel(7)).toBe('warning');
      expect(getAlertLevel(14)).toBe('warning');
    });

    it('debe retornar "urgent" para 15-29 días', () => {
      expect(getAlertLevel(15)).toBe('urgent');
      expect(getAlertLevel(29)).toBe('urgent');
    });

    it('debe retornar "critical" para 30+ días', () => {
      expect(getAlertLevel(30)).toBe('critical');
      expect(getAlertLevel(100)).toBe('critical');
    });

    it('debe manejar valores negativos', () => {
      expect(getAlertLevel(-1)).toBe('ok'); // Days no puede ser negativo
    });
  });

  describe('buildDeliverySummary()', () => {
    const mockDelivery1: DeliveryEntry = {
      id: 'uuid-1',
      customerName: 'Carlos Méndez',
      amount: 113,
      courier: 'C807',
      status: 'pending_cod',
      createdAt: new Date('2025-10-15T14:00:00Z').toISOString()
    };

    const mockDelivery2: DeliveryEntry = {
      id: 'uuid-2',
      customerName: 'Ana García',
      amount: 84.75,
      courier: 'Melos',
      status: 'pending_cod',
      createdAt: new Date('2025-10-01T10:00:00Z').toISOString() // 22 días
    };

    it('debe construir resumen vacío correctamente', () => {
      const summary = buildDeliverySummary([]);

      expect(summary.totalPending).toBe(0);
      expect(summary.countPending).toBe(0);
      expect(summary.byCourier.C807.count).toBe(0);
      expect(summary.alerts.critical30Days).toBe(0);
    });

    it('debe sumar totales correctamente', () => {
      const summary = buildDeliverySummary([mockDelivery1, mockDelivery2]);

      expect(summary.totalPending).toBe(197.75);
      expect(summary.countPending).toBe(2);
      expect(summary.byCourier.C807.total).toBe(113);
      expect(summary.byCourier.Melos.total).toBe(84.75);
    });

    it('debe contar alertas correctamente', () => {
      jest.spyOn(global, 'Date').mockImplementation(() => new Date('2025-10-23T14:00:00Z') as any);

      const summary = buildDeliverySummary([mockDelivery1, mockDelivery2]);

      expect(summary.alerts.warning7Days).toBe(1); // mockDelivery1 = 8 días
      expect(summary.alerts.urgent15Days).toBe(1); // mockDelivery2 = 22 días
      expect(summary.alerts.critical30Days).toBe(0);

      jest.restoreAllMocks();
    });
  });

  describe('adjustSICAR() - CRÍTICO', () => {
    const mockDelivery1: DeliveryEntry = {
      id: 'uuid-1',
      customerName: 'Cliente 1',
      amount: 113,
      courier: 'C807',
      status: 'pending_cod',
      createdAt: new Date().toISOString()
    };

    const mockDelivery2: DeliveryEntry = {
      id: 'uuid-2',
      customerName: 'Cliente 2',
      amount: 84.75,
      courier: 'Melos',
      status: 'pending_cod',
      createdAt: new Date().toISOString()
    };

    it('debe ajustar SICAR correctamente con 2 envíos', () => {
      const adjusted = adjustSICAR(1550, 100, [mockDelivery1, mockDelivery2]);
      // 1550 - 100 - 113 - 84.75 = 1252.25
      expect(adjusted).toBe(1252.25);
    });

    it('debe ajustar SICAR sin envíos', () => {
      const adjusted = adjustSICAR(1550, 100, []);
      expect(adjusted).toBe(1450); // 1550 - 100
    });

    it('debe retornar 0 si total es negativo', () => {
      const adjusted = adjustSICAR(100, 50, [mockDelivery1, mockDelivery2]);
      // 100 - 50 - 113 - 84.75 = -147.75 → 0
      expect(adjusted).toBe(0);
    });

    it('debe manejar decimales correctamente', () => {
      const delivery: DeliveryEntry = {
        id: 'uuid-3',
        customerName: 'Test',
        amount: 37.50,
        courier: 'C807',
        status: 'pending_cod',
        createdAt: new Date().toISOString()
      };

      const adjusted = adjustSICAR(1000, 250.25, [delivery]);
      // 1000 - 250.25 - 37.50 = 712.25
      expect(adjusted).toBe(712.25);
    });

    it('debe manejar array vacío de envíos', () => {
      const adjusted = adjustSICAR(500, 100, []);
      expect(adjusted).toBe(400);
    });

    it('debe sumar múltiples envíos correctamente (3+)', () => {
      const deliveries: DeliveryEntry[] = [
        { id: '1', customerName: 'A', amount: 50, courier: 'C807', status: 'pending_cod', createdAt: new Date().toISOString() },
        { id: '2', customerName: 'B', amount: 75, courier: 'Melos', status: 'pending_cod', createdAt: new Date().toISOString() },
        { id: '3', customerName: 'C', amount: 100, courier: 'Otro', status: 'pending_cod', createdAt: new Date().toISOString() }
      ];

      const adjusted = adjustSICAR(1000, 200, deliveries);
      // 1000 - 200 - 50 - 75 - 100 = 575
      expect(adjusted).toBe(575);
    });
  });
});
```

#### Criterios de Aceptación

- ✅ **TIER 0 tests:** 30+ tests passing (100% cobertura helpers críticos)
- ✅ `adjustSICAR()` funciona correctamente en 10+ escenarios
- ✅ Helpers manejan edge cases (fechas futuras, negativos, decimales)
- ✅ Zero `any` types en todo el código
- ✅ JSDoc completo en todas las funciones públicas
- ✅ Performance < 1ms por cálculo (probado con 1000+ deliveries)

#### Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Cálculo SICAR incorrecto | **CRÍTICA** | **CRÍTICO** | **TIER 0 tests obligatorios 30+ casos** |
| Precisión decimal perdida | Media | Alto | Usar `toFixed(2)` solo en UI, no en cálculos |
| Performance con 1000+ deliveries | Baja | Medio | Benchmark con dataset grande Paradise |

---

### FASE 5: Dashboard Envíos Acumulados (5-6 horas)

**Objetivo:** Crear dashboard completo para visualizar todos los envíos pendientes, buscar, filtrar y marcar como cobrados.

#### Tareas

| # | Tarea | Duración | Archivos |
|---|-------|----------|----------|
| 5.1 | Crear hook `useDeliverySummary.ts` | 45 min | `useDeliverySummary.ts` |
| 5.2 | Crear `DeliveryDashboard.tsx` UI | 90 min | `DeliveryDashboard.tsx` |
| 5.3 | Implementar filtros (courier, status, search) | 60 min | `DeliveryDashboard.tsx` |
| 5.4 | Crear `DeliveryCard.tsx` component | 45 min | `DeliveryCard.tsx` |
| 5.5 | Implementar ordenamiento (date, amount, courier) | 30 min | `DeliveryDashboard.tsx` |
| 5.6 | Agregar paginación (10 por página) | 30 min | `DeliveryDashboard.tsx` |
| 5.7 | Integrar en `Index.tsx` (ruta "/deliveries") | 30 min | `Index.tsx` |

#### Entregables

**Archivo 1:** `/src/hooks/useDeliverySummary.ts` (~80 líneas)

```typescript
import { useMemo } from 'react';
import { DeliveryEntry, DeliverySummary } from '@/types/deliveries';
import { buildDeliverySummary } from '@/utils/deliveryCalculation';

export function useDeliverySummary(deliveries: DeliveryEntry[]): DeliverySummary {
  const summary = useMemo(
    () => buildDeliverySummary(deliveries),
    [deliveries]
  );

  return summary;
}
```

**Archivo 2:** `/src/components/deliveries/DeliveryDashboard.tsx` (~400 líneas)

```typescript
import React, { useState, useMemo } from 'react';
import { useDeliveries } from '@/hooks/useDeliveries';
import { useDeliverySummary } from '@/hooks/useDeliverySummary';
import { DeliveryCard } from './DeliveryCard';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

type SortBy = 'date' | 'amount' | 'courier';
type SortOrder = 'asc' | 'desc';

export const DeliveryDashboard: React.FC = () => {
  const { pending, markAsPaid, deleteDelivery } = useDeliveries();
  const summary = useDeliverySummary(pending);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourier, setFilterCourier] = useState<'all' | 'C807' | 'Melos' | 'Otro'>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtrar y ordenar
  const filteredDeliveries = useMemo(() => {
    let filtered = [...pending];

    // Buscar por nombre/guía/factura
    if (searchQuery) {
      filtered = filtered.filter(d =>
        d.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.guideNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtrar por courier
    if (filterCourier !== 'all') {
      filtered = filtered.filter(d => d.courier === filterCourier);
    }

    // Ordenar
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'courier':
          comparison = a.courier.localeCompare(b.courier);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [pending, searchQuery, filterCourier, sortBy, sortOrder]);

  // Paginar
  const paginatedDeliveries = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredDeliveries.slice(start, end);
  }, [filteredDeliveries, currentPage]);

  const totalPages = Math.ceil(filteredDeliveries.length / itemsPerPage);

  return (
    <div className="p-4 space-y-6">
      {/* Header con métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-gray-600">Total Pendiente</p>
          <p className="text-2xl font-bold">${summary.totalPending.toFixed(2)}</p>
          <p className="text-xs text-gray-500">{summary.countPending} envíos</p>
        </div>

        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-gray-600">Alertas Activas</p>
          <p className="text-2xl font-bold">
            {summary.alerts.warning7Days + summary.alerts.urgent15Days + summary.alerts.critical30Days}
          </p>
          <p className="text-xs text-gray-500">
            {summary.alerts.critical30Days > 0 && `🚨 ${summary.alerts.critical30Days} críticas`}
          </p>
        </div>

        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-gray-600">Courier Principal</p>
          <p className="text-2xl font-bold">C807</p>
          <p className="text-xs text-gray-500">
            ${summary.byCourier.C807.total.toFixed(2)} ({summary.byCourier.C807.count} envíos)
          </p>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-wrap gap-4">
        <Input
          placeholder="Buscar por cliente, guía o factura..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 min-w-[200px]"
        />

        <Select value={filterCourier} onValueChange={(v) => setFilterCourier(v as any)}>
          <option value="all">Todos los couriers</option>
          <option value="C807">C807 Express</option>
          <option value="Melos">Melos</option>
          <option value="Otro">Otro</option>
        </Select>

        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
          <option value="date">Ordenar por fecha</option>
          <option value="amount">Ordenar por monto</option>
          <option value="courier">Ordenar por courier</option>
        </Select>

        <Button
          variant="outline"
          onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </Button>
      </div>

      {/* Lista de envíos */}
      <div className="space-y-4">
        {paginatedDeliveries.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            {pending.length === 0 ? '✅ No hay envíos pendientes' : 'No se encontraron resultados'}
          </div>
        ) : (
          paginatedDeliveries.map(delivery => (
            <DeliveryCard
              key={delivery.id}
              delivery={delivery}
              onMarkAsPaid={markAsPaid}
              onDelete={deleteDelivery}
            />
          ))
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            Anterior
          </Button>
          <span className="flex items-center px-4">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
};
```

**Archivo 3:** `/src/components/deliveries/DeliveryCard.tsx` (~180 líneas)

```typescript
import React from 'react';
import { DeliveryEntry } from '@/types/deliveries';
import { getDaysPending, getAlertLevel } from '@/utils/deliveryCalculation';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/formatters';

interface DeliveryCardProps {
  delivery: DeliveryEntry;
  onMarkAsPaid: (id: string) => void;
  onDelete: (id: string) => void;
}

export const DeliveryCard: React.FC<DeliveryCardProps> = ({
  delivery,
  onMarkAsPaid,
  onDelete
}) => {
  const days = getDaysPending(delivery.createdAt);
  const level = getAlertLevel(days);

  const levelColors = {
    ok: 'bg-green-100 border-green-300',
    warning: 'bg-yellow-100 border-yellow-300',
    urgent: 'bg-orange-100 border-orange-300',
    critical: 'bg-red-100 border-red-300'
  };

  const levelIcons = {
    ok: '✓',
    warning: '⚠️',
    urgent: '🔴',
    critical: '🚨'
  };

  return (
    <div className={`p-4 border-2 rounded-lg ${levelColors[level]}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-bold text-lg">{delivery.customerName}</h3>
          <p className="text-sm text-gray-600">{delivery.courier}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{formatCurrency(delivery.amount)}</p>
          <p className="text-xs text-gray-600">
            {levelIcons[level]} {days} día{days !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {delivery.guideNumber && (
        <p className="text-sm">📦 Guía: {delivery.guideNumber}</p>
      )}
      {delivery.invoiceNumber && (
        <p className="text-sm">📄 Factura: {delivery.invoiceNumber}</p>
      )}
      {delivery.notes && (
        <p className="text-sm text-gray-600 mt-2">{delivery.notes}</p>
      )}

      <div className="flex gap-2 mt-4">
        <Button
          size="sm"
          onClick={() => onMarkAsPaid(delivery.id)}
        >
          ✅ Marcar Cobrado
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onDelete(delivery.id)}
        >
          🗑️ Eliminar
        </Button>
      </div>
    </div>
  );
};
```

#### Criterios de Aceptación

- ✅ Dashboard muestra métricas en tiempo real (total, alertas, courier principal)
- ✅ Búsqueda funciona por cliente, guía y factura
- ✅ Filtros actualizan resultados inmediatamente
- ✅ Ordenamiento funciona correctamente (asc/desc)
- ✅ Paginación muestra 10 items por página
- ✅ Botón "Marcar Cobrado" mueve a historial
- ✅ UI responsive (mobile + desktop)
- ✅ Performance < 100ms con 100+ deliveries

#### Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Performance con 1000+ deliveries | Media | Alto | Virtual scrolling (react-window) si >500 items |
| Búsqueda lenta | Baja | Medio | Debounce 300ms en input search |
| Filtros confusos | Media | Bajo | Testing con usuarios Paradise (3+ personas) |

---

### FASE 6: Sistema de Alertas Automáticas (2-3 horas)

**Objetivo:** Implementar sistema de notificaciones visuales para envíos con 7+, 15+ y 30+ días pendientes.

#### Tareas

| # | Tarea | Duración | Archivos |
|---|-------|----------|----------|
| 6.1 | Crear `DeliveryAlertBadge.tsx` | 30 min | `DeliveryAlertBadge.tsx` |
| 6.2 | Crear hook `useDeliveryAlerts.ts` | 30 min | `useDeliveryAlerts.ts` |
| 6.3 | Crear `DeliveryEducationModal.tsx` | 60 min | `DeliveryEducationModal.tsx` |
| 6.4 | Integrar en `CashCalculation.tsx` | 30 min | `CashCalculation.tsx` |
| 6.5 | Testing alertas con datos reales Paradise | 30 min | Manual |

#### Entregables

**Archivo 1:** `/src/components/deliveries/DeliveryAlertBadge.tsx` (~60 líneas)

```typescript
import React from 'react';
import { DeliveryEntry, AlertLevel } from '@/types/deliveries';
import { getDaysPending, getAlertLevel } from '@/utils/deliveryCalculation';

interface DeliveryAlertBadgeProps {
  delivery: DeliveryEntry;
  showLabel?: boolean;
}

export const DeliveryAlertBadge: React.FC<DeliveryAlertBadgeProps> = ({
  delivery,
  showLabel = false
}) => {
  const days = getDaysPending(delivery.createdAt);
  const level = getAlertLevel(days);

  const colors = {
    ok: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    urgent: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
  };

  const icons = {
    ok: '✓',
    warning: '⚠️',
    urgent: '🔴',
    critical: '🚨'
  };

  if (level === 'ok') return null; // No mostrar badge para deliveries OK

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${colors[level]}`}
    >
      <span>{icons[level]}</span>
      <span>{days} días</span>
      {showLabel && <span className="ml-1">({level})</span>}
    </span>
  );
};
```

**Archivo 2:** `/src/hooks/useDeliveryAlerts.ts` (~80 líneas)

```typescript
import { useMemo } from 'react';
import { DeliveryEntry } from '@/types/deliveries';
import { getDaysPending, getAlertLevel } from '@/utils/deliveryCalculation';

export interface DeliveryAlerts {
  critical: DeliveryEntry[];
  urgent: DeliveryEntry[];
  warning: DeliveryEntry[];
  hasCritical: boolean;
  hasUrgent: boolean;
  hasWarning: boolean;
}

export function useDeliveryAlerts(deliveries: DeliveryEntry[]): DeliveryAlerts {
  const alerts = useMemo(() => {
    const critical: DeliveryEntry[] = [];
    const urgent: DeliveryEntry[] = [];
    const warning: DeliveryEntry[] = [];

    deliveries.forEach(delivery => {
      const days = getDaysPending(delivery.createdAt);
      const level = getAlertLevel(days);

      if (level === 'critical') critical.push(delivery);
      else if (level === 'urgent') urgent.push(delivery);
      else if (level === 'warning') warning.push(delivery);
    });

    return {
      critical,
      urgent,
      warning,
      hasCritical: critical.length > 0,
      hasUrgent: urgent.length > 0,
      hasWarning: warning.length > 0
    };
  }, [deliveries]);

  return alerts;
}
```

**Archivo 3:** `/src/components/deliveries/DeliveryEducationModal.tsx` (~200 líneas)

```typescript
import React from 'react';
import { DeliveryEntry } from '@/types/deliveries';
import { getDaysPending } from '@/utils/deliveryCalculation';
import { formatCurrency } from '@/utils/formatters';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel
} from '@/components/ui/alert-dialog';

interface DeliveryEducationModalProps {
  criticalDeliveries: DeliveryEntry[];
  onAcknowledge: () => void;
  onCancel: () => void;
}

export const DeliveryEducationModal: React.FC<DeliveryEducationModalProps> = ({
  criticalDeliveries,
  onAcknowledge,
  onCancel
}) => {
  const totalCritical = criticalDeliveries.reduce((sum, d) => sum + d.amount, 0);

  return (
    <AlertDialog open>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogTitle className="text-2xl">
          🚨 Atención: {criticalDeliveries.length} Envíos Críticos
        </AlertDialogTitle>

        <AlertDialogDescription className="space-y-4">
          <p className="text-lg">
            Hay <strong>{criticalDeliveries.length} envíos</strong> con <strong>30+ días pendientes</strong> por un total de <strong>{formatCurrency(totalCritical)}</strong>.
          </p>

          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-bold mb-2">⚠️ Acciones Requeridas:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Contactar clientes INMEDIATAMENTE</li>
              <li>Verificar estado con courier</li>
              <li>Escalar a gerencia si no hay respuesta en 24h</li>
              <li>Documentar intentos de contacto</li>
            </ul>
          </div>

          <div className="max-h-60 overflow-y-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="p-2 text-left">Cliente</th>
                  <th className="p-2 text-left">Courier</th>
                  <th className="p-2 text-right">Monto</th>
                  <th className="p-2 text-right">Días</th>
                </tr>
              </thead>
              <tbody>
                {criticalDeliveries.map(delivery => (
                  <tr key={delivery.id} className="border-t">
                    <td className="p-2">{delivery.customerName}</td>
                    <td className="p-2">{delivery.courier}</td>
                    <td className="p-2 text-right font-mono">
                      {formatCurrency(delivery.amount)}
                    </td>
                    <td className="p-2 text-right font-bold text-red-600">
                      {getDaysPending(delivery.createdAt)} días
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AlertDialogDescription>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            Ir a Dashboard para Gestionar
          </AlertDialogCancel>
          <AlertDialogAction onClick={onAcknowledge}>
            Entiendo, Continuar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
```

#### Criterios de Aceptación

- ✅ Badge muestra nivel de alerta con color correcto
- ✅ Modal bloquea cierre si hay envíos críticos (30+ días)
- ✅ Modal lista todos los envíos críticos en tabla
- ✅ Hook calcula alertas correctamente por nivel
- ✅ Integración en CashCalculation.tsx funcional
- ✅ UI responsive (mobile + desktop)

#### Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Modal muy intrusivo | Media | Medio | Solo mostrar si >3 deliveries critical |
| Usuarios ignorar alertas | Alta | Alto | Documentar consecuencias en FASE 8 training |
| Falsos positivos | Baja | Medio | Testing con datos históricos Paradise (90 días) |

---

### FASE 7: Reporte WhatsApp Mejorado (2-3 horas)

**Objetivo:** Integrar sección de envíos pendientes en el reporte WhatsApp final con formato profesional.

#### Tareas

| # | Tarea | Duración | Archivos |
|---|-------|----------|----------|
| 7.1 | Crear `generateDeliverySectionWhatsApp()` | 60 min | `deliveryCalculation.ts` |
| 7.2 | Crear `generateCriticalDeliveriesDetail()` | 30 min | `deliveryCalculation.ts` |
| 7.3 | Integrar en `generateCompleteReport()` | 45 min | `CashCalculation.tsx` |
| 7.4 | Testing formato con 3 casos (sin, normales, críticos) | 30 min | Manual |

#### Entregables

**Modificaciones en `/src/utils/deliveryCalculation.ts`** (~+150 líneas)

```typescript
/**
 * Genera sección de envíos para reporte WhatsApp
 * @param pending - Envíos pendientes
 * @param summary - Resumen agregado
 * @returns Texto formateado para WhatsApp
 */
export function generateDeliverySectionWhatsApp(
  pending: DeliveryEntry[],
  summary: DeliverySummary
): string {
  if (pending.length === 0) {
    return `
━━━━━━━━━━━━━━━━

📦 *ENVÍOS PENDIENTES COD*

✅ Sin envíos pendientes

━━━━━━━━━━━━━━━━
`;
  }

  let section = `
━━━━━━━━━━━━━━━━

📦 *ENVÍOS PENDIENTES COD*

💼 *Total:* $${summary.totalPending.toFixed(2)} (${summary.countPending} envíos)

🚚 *Por Courier:*
☐ C807: $${summary.byCourier.C807.total.toFixed(2)} (${summary.byCourier.C807.count} envíos)
☐ Melos: $${summary.byCourier.Melos.total.toFixed(2)} (${summary.byCourier.Melos.count} envíos)
☐ Otro: $${summary.byCourier.Otro.total.toFixed(2)} (${summary.byCourier.Otro.count} envíos)
`;

  // Agregar alertas si existen
  const hasAlerts = summary.alerts.warning7Days > 0 ||
                    summary.alerts.urgent15Days > 0 ||
                    summary.alerts.critical30Days > 0;

  if (hasAlerts) {
    section += `
⚠️ *Alertas:*
`;
    if (summary.alerts.warning7Days > 0) {
      section += `🟡 7+ días: ${summary.alerts.warning7Days} envíos\n`;
    }
    if (summary.alerts.urgent15Days > 0) {
      section += `🔴 15+ días: ${summary.alerts.urgent15Days} envíos\n`;
    }
    if (summary.alerts.critical30Days > 0) {
      section += `🚨 30+ días: ${summary.alerts.critical30Days} envíos\n`;
    }
  }

  section += `
━━━━━━━━━━━━━━━━
`;

  return section;
}

/**
 * Genera detalle de envíos críticos para reporte
 * @param deliveries - Todos los envíos
 * @returns Bloque de texto con deliveries 30+ días
 */
export function generateCriticalDeliveriesDetail(
  deliveries: DeliveryEntry[]
): string {
  const critical = deliveries.filter(
    d => getAlertLevel(getDaysPending(d.createdAt)) === 'critical'
  );

  if (critical.length === 0) return '';

  let detail = `
🚨 *ENVÍOS CRÍTICOS (30+ DÍAS):*

`;

  critical.forEach((d, index) => {
    const days = getDaysPending(d.createdAt);
    detail += `${index + 1}. ${d.customerName}
   ${d.courier} • $${d.amount.toFixed(2)} • ${days} días
   Guía: ${d.guideNumber || 'N/A'} • Fact: ${d.invoiceNumber || 'N/A'}

`;
  });

  return detail;
}
```

**Modificaciones en `/src/components/cash-counting/CashCalculation.tsx`** (~+30 líneas)

```typescript
// Importar helpers
import {
  generateDeliverySectionWhatsApp,
  generateCriticalDeliveriesDetail,
  buildDeliverySummary
} from '@/utils/deliveryCalculation';
import { useDeliveries } from '@/hooks/useDeliveries';

// Dentro de generateCompleteReport()
const { pending: pendingDeliveries } = useDeliveries();
const deliverySummary = buildDeliverySummary(pendingDeliveries);
const deliverySection = generateDeliverySectionWhatsApp(pendingDeliveries, deliverySummary);
const criticalDetail = generateCriticalDeliveriesDetail(pendingDeliveries);

// Insertar sección en reporte
return `
${headerSeverity}

📊 *CORTE DE CAJA* - ${calculationData?.timestamp}
Sucursal: ${branch}
Cajero: ${cashier}
Testigo: ${witness}

━━━━━━━━━━━━━━━━

📊 *RESUMEN EJECUTIVO*

💰 Efectivo Contado: *${formatCurrency(calculationData?.totalCash || 0)}*

${electronicDetailsDesglosed}

📦 *Entregado a Gerencia: ${formatCurrency(deliveryCalculation?.amountToDeliver || 0)}*
🏢 Quedó en Caja: $50.00

💼 Total Día: *${formatCurrency(calculationData?.totalGeneral || 0)}*
🎯 SICAR Esperado: ${formatCurrency(expectedSales)}
${emoji} Diferencia: *${formatCurrency(diff)} (${label})*

${deliverySection}  ← NUEVA SECCIÓN

${fullAlertsSection}

${verificationSection}

━━━━━━━━━━━━━━━━

💰 *CONTEO COMPLETO (${formatCurrency(calculationData?.totalCash || 0)})*
${/* denominaciones */}

${criticalDetail}  ← DETALLE CRÍTICOS AL FINAL

━━━━━━━━━━━━━━━━

📅 ${calculationData?.timestamp}
🔐 CashGuard Paradise v1.3.7
🔒 NIST SP 800-115 | PCI DSS 12.10.1

✅ Reporte automático
⚠️ Documento NO editable

Firma Digital: ${dataHash}
`;
```

#### Criterios de Aceptación

- ✅ Reporte WhatsApp incluye sección "ENVÍOS PENDIENTES COD"
- ✅ Formato profesional con emojis y separadores
- ✅ Resumen muestra totales por courier
- ✅ Alertas (7+, 15+, 30+ días) visibles si existen
- ✅ Envíos críticos listados al final con detalles completos
- ✅ Testing con 3 casos (sin envíos, normales, críticos)
- ✅ Formato mobile-friendly en WhatsApp

#### Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Reporte muy largo | Media | Medio | Limitar detalle críticos a top 10 |
| Formato roto en WhatsApp | Baja | Alto | Testing en 3+ dispositivos (iPhone, Android) |
| Información sensible expuesta | Baja | Alto | No incluir guía completa, solo últimos 4 dígitos |

---

### FASE 8: Testing & Validación Final (3-4 horas)

**Objetivo:** Testing exhaustivo de todo el módulo con datos reales Paradise y validación de criterios de aceptación.

#### Tareas

| # | Tarea | Duración | Archivos |
|---|-------|----------|----------|
| 8.1 | **Ejecutar TIER 0 tests (30+ tests)** | 30 min | `deliveryCalculation.test.ts` |
| 8.2 | Testing integración hook `useDeliveries` (15 tests) | 45 min | `useDeliveries.test.ts` |
| 8.3 | Testing componente `DeliveryManager` (20 tests) | 60 min | `DeliveryManager.test.tsx` |
| 8.4 | Testing E2E flujo completo (5 casos) | 60 min | `deliveryIntegration.test.tsx` |
| 8.5 | Testing con datos históricos Paradise (90 días) | 30 min | Manual |
| 8.6 | Validación criterios aceptación (checklist 50 items) | 30 min | Manual |

#### Entregables

**Archivo 1:** `/src/hooks/__tests__/useDeliveries.test.ts` (~300 líneas)

```typescript
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useDeliveries } from '../useDeliveries';
import { DeliveryEntry } from '@/types/deliveries';

describe('useDeliveries', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Initial Load', () => {
    it('debe cargar deliveries de localStorage', async () => {
      const mockDeliveries: DeliveryEntry[] = [
        { id: 'uuid-1', customerName: 'Carlos', amount: 113, courier: 'C807', status: 'pending_cod', createdAt: new Date().toISOString() }
      ];

      localStorage.setItem('cashguard_deliveries_pending', JSON.stringify({
        version: '1.0',
        lastUpdated: new Date().toISOString(),
        deliveries: mockDeliveries
      }));

      const { result } = renderHook(() => useDeliveries());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.pending).toHaveLength(1);
      expect(result.current.pending[0].customerName).toBe('Carlos');
    });

    it('debe retornar array vacío si no hay data', async () => {
      const { result } = renderHook(() => useDeliveries());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.pending).toEqual([]);
    });

    it('debe validar data con type guard', async () => {
      localStorage.setItem('cashguard_deliveries_pending', JSON.stringify({
        version: '1.0',
        deliveries: [
          { id: 'uuid-1', customerName: 'Valid', amount: 100, courier: 'C807', status: 'pending_cod', createdAt: new Date().toISOString() },
          { id: 'uuid-2', invalidField: true } // ← No válido
        ]
      }));

      const { result } = renderHook(() => useDeliveries());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.pending).toHaveLength(1); // Solo el válido
    });
  });

  describe('addDelivery()', () => {
    it('debe agregar delivery correctamente', async () => {
      const { result } = renderHook(() => useDeliveries());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addDelivery({
          customerName: 'Ana García',
          amount: 84.75,
          courier: 'Melos',
          status: 'pending_cod'
        });
      });

      await waitFor(() => {
        expect(result.current.pending).toHaveLength(1);
      });

      expect(result.current.pending[0].customerName).toBe('Ana García');
      expect(result.current.pending[0].id).toBeDefined();
      expect(result.current.pending[0].createdAt).toBeDefined();
    });

    it('debe guardar en localStorage después de agregar', async () => {
      const { result } = renderHook(() => useDeliveries());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addDelivery({
          customerName: 'Test',
          amount: 50,
          courier: 'C807',
          status: 'pending_cod'
        });
      });

      await waitFor(() => {
        const stored = JSON.parse(localStorage.getItem('cashguard_deliveries_pending') || '{}');
        expect(stored.deliveries).toHaveLength(1);
      });
    });
  });

  describe('markAsPaid()', () => {
    it('debe mover delivery a history', async () => {
      const { result } = renderHook(() => useDeliveries());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Agregar delivery
      act(() => {
        result.current.addDelivery({
          customerName: 'Test',
          amount: 100,
          courier: 'C807',
          status: 'pending_cod'
        });
      });

      await waitFor(() => {
        expect(result.current.pending).toHaveLength(1);
      });

      const deliveryId = result.current.pending[0].id;

      // Marcar como pagado
      act(() => {
        result.current.markAsPaid(deliveryId);
      });

      await waitFor(() => {
        expect(result.current.pending).toHaveLength(0);
      });

      // Verificar en history
      const history = JSON.parse(localStorage.getItem('cashguard_deliveries_history') || '[]');
      expect(history).toHaveLength(1);
      expect(history[0].status).toBe('paid');
      expect(history[0].paidAt).toBeDefined();
    });
  });

  // ... 10+ tests adicionales
});
```

**Archivo 2:** `/src/components/deliveries/__tests__/DeliveryManager.test.tsx` (~400 líneas)

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { DeliveryManager } from '../DeliveryManager';

describe('DeliveryManager Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('debe renderizar botón "Registrar Envío"', () => {
    render(<DeliveryManager />);
    expect(screen.getByText(/Registrar Envío COD/i)).toBeInTheDocument();
  });

  it('debe abrir formulario al hacer clic en botón', async () => {
    render(<DeliveryManager />);

    const button = screen.getByText(/Registrar Envío COD/i);
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByLabelText(/Cliente/i)).toBeInTheDocument();
    });
  });

  it('debe validar campo "Cliente" (mínimo 3 caracteres)', async () => {
    const user = userEvent.setup();
    render(<DeliveryManager />);

    fireEvent.click(screen.getByText(/Registrar Envío COD/i));

    const input = screen.getByLabelText(/Cliente/i);
    await user.type(input, 'AB'); // Solo 2 caracteres

    const submitButton = screen.getByText(/Registrar$/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Mínimo 3 caracteres/i)).toBeInTheDocument();
    });
  });

  it('debe validar campo "Monto" (rango 0.01 - 10000)', async () => {
    const user = userEvent.setup();
    render(<DeliveryManager />);

    fireEvent.click(screen.getByText(/Registrar Envío COD/i));

    const input = screen.getByLabelText(/Monto/i);
    await user.type(input, '15000'); // Fuera de rango

    const submitButton = screen.getByText(/Registrar$/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/entre \$0\.01 y \$10,000\.00/i)).toBeInTheDocument();
    });
  });

  it('debe registrar delivery exitosamente', async () => {
    const user = userEvent.setup();
    render(<DeliveryManager />);

    fireEvent.click(screen.getByText(/Registrar Envío COD/i));

    // Llenar formulario
    await user.type(screen.getByLabelText(/Cliente/i), 'Carlos Méndez');
    await user.type(screen.getByLabelText(/Monto/i), '113.00');
    await user.selectOptions(screen.getByLabelText(/Courier/i), 'C807');

    fireEvent.click(screen.getByText(/Registrar$/i));

    // Verificar que aparece en lista
    await waitFor(() => {
      expect(screen.getByText('Carlos Méndez')).toBeInTheDocument();
      expect(screen.getByText(/\$113\.00/i)).toBeInTheDocument();
    });
  });

  // ... 15+ tests adicionales
});
```

**Archivo 3:** `/src/__tests__/deliveryIntegration.test.tsx` (~300 líneas - E2E)

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { App } from '../App'; // O el componente raíz

describe('Delivery System - E2E Integration', () => {
  it('FLUJO COMPLETO: Registro → Dashboard → Marcar Cobrado', async () => {
    const user = userEvent.setup();

    // 1. Navegar a Evening Cut
    render(<App />);
    fireEvent.click(screen.getByText(/Corte Nocturno/i));

    // 2. Completar wizard hasta paso "Envíos COD"
    // (código navegación wizard...)

    // 3. Registrar envío
    fireEvent.click(screen.getByText(/Registrar Envío COD/i));
    await user.type(screen.getByLabelText(/Cliente/i), 'Carlos Méndez');
    await user.type(screen.getByLabelText(/Monto/i), '113');
    fireEvent.click(screen.getByText(/Registrar$/i));

    await waitFor(() => {
      expect(screen.getByText('Carlos Méndez')).toBeInTheDocument();
    });

    // 4. Avanzar wizard → Verificar SICAR ajustado
    // (código navegación...)

    // 5. Abrir dashboard
    fireEvent.click(screen.getByText(/Dashboard Envíos/i));

    await waitFor(() => {
      expect(screen.getByText('Carlos Méndez')).toBeInTheDocument();
      expect(screen.getByText(/\$113\.00/i)).toBeInTheDocument();
    });

    // 6. Marcar como cobrado
    fireEvent.click(screen.getByText(/Marcar Cobrado/i));

    await waitFor(() => {
      expect(screen.queryByText('Carlos Méndez')).not.toBeInTheDocument();
    });

    // 7. Verificar en history
    const history = JSON.parse(localStorage.getItem('cashguard_deliveries_history') || '[]');
    expect(history).toHaveLength(1);
    expect(history[0].customerName).toBe('Carlos Méndez');
    expect(history[0].status).toBe('paid');
  });

  it('FLUJO: Alertas críticas bloquean finalización', async () => {
    // Setup: Delivery con 35 días pendientes
    const oldDelivery = {
      id: 'uuid-old',
      customerName: 'Cliente Moroso',
      amount: 200,
      courier: 'C807',
      status: 'pending_cod',
      createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString() // -35 días
    };

    localStorage.setItem('cashguard_deliveries_pending', JSON.stringify({
      version: '1.0',
      deliveries: [oldDelivery]
    }));

    // Intentar finalizar corte
    render(<App />);
    // (navegar a Phase 3...)

    // Verificar modal bloqueante
    await waitFor(() => {
      expect(screen.getByText(/Envíos Críticos/i)).toBeInTheDocument();
      expect(screen.getByText(/Cliente Moroso/i)).toBeInTheDocument();
    });
  });

  // ... 3+ casos E2E adicionales
});
```

#### Criterios de Aceptación

**Testing:**
- ✅ TIER 0 tests: 30+ tests passing (100% coverage cálculos)
- ✅ Hook tests: 15+ tests passing (useDeliveries completo)
- ✅ Component tests: 20+ tests passing (DeliveryManager UI)
- ✅ E2E tests: 5+ casos completos (flujos integración)
- ✅ Coverage: >90% lines, >85% branches

**Funcionalidad:**
- ✅ Registro de envíos funciona en wizard Evening Cut
- ✅ Dashboard muestra métricas correctas en tiempo real
- ✅ Filtros y búsqueda responden < 100ms
- ✅ Alertas visuales correctas (7+, 15+, 30+ días)
- ✅ Reporte WhatsApp incluye sección deliveries
- ✅ localStorage persiste datos correctamente
- ✅ SICAR ajustado correctamente en 10+ casos reales

**Performance:**
- ✅ Renderizado inicial < 500ms
- ✅ Búsqueda con 100+ deliveries < 100ms
- ✅ Build size incremento < 50KB (gzip)

**UX:**
- ✅ Responsive mobile + desktop
- ✅ Accesibilidad (keyboard navigation, ARIA labels)
- ✅ Mensajes error claros y accionables
- ✅ Loading states visuales

#### Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Tests flaky | Media | Alto | Usar `waitFor()` + timeouts generosos (3000ms) |
| Coverage insuficiente | Baja | Alto | Mandatory TIER 0 + PR review checklist |
| Bugs en producción | Media | **CRÍTICO** | Testing con datos Paradise reales (90 días) |

---

## TIMELINE Y RECURSOS

### Timeline Detallado

**Semana 1 (8 horas):**
- Día 1 (4h): FASE 1 (2-3h) + FASE 4 (2-3h) **→ Hito 1 ✅**
- Día 2 (4h): FASE 2 (4-5h) inicio

**Semana 2 (8 horas):**
- Día 3 (4h): FASE 2 fin + FASE 3 (3-4h) inicio
- Día 4 (4h): FASE 3 fin **→ Hito 2 ✅**

**Semana 3 (8 horas):**
- Día 5 (4h): FASE 5 (5-6h) inicio
- Día 6 (4h): FASE 5 fin + FASE 6 (2-3h) inicio

**Semana 4 (7 horas):**
- Día 7 (4h): FASE 6 fin + FASE 7 (2-3h) **→ Hito 3 ✅**
- Día 8 (3h): FASE 8 (3-4h) inicio
- Día 9 (1h): FASE 8 fin + Deployment **→ Hito 4 ✅**

**Total:** 23-31 horas → **3-4 semanas** en jornadas de 8h

### Recursos Necesarios

**Humanos:**
- 1 Desarrollador Senior (Full-stack React + TypeScript)
- 1 QA Tester (Vitest + Testing Library)
- 1 Product Owner (Paradise - validación funcional)

**Técnicos:**
- Laptop desarrollo (mínimo 8GB RAM, SSD)
- Repositorio Git (GitHub/GitLab)
- CI/CD pipeline (GitHub Actions configured)
- Acceso datos históricos Paradise (90 días envíos)

**Software:**
- Node.js 20+
- npm/yarn
- VSCode + ESLint + Prettier
- Vitest + Testing Library React
- Docker (para E2E tests)

### Estimación Costo

| Rol | Horas | Tarifa/h | Total |
|-----|-------|----------|-------|
| Desarrollador Senior | 25h | $50-60 | $1,250-1,500 |
| QA Tester | 8h | $40-50 | $320-400 |
| Code Review (Tech Lead) | 4h | $70-80 | $280-320 |
| Contingencia (15%) | - | - | $278-333 |
| **TOTAL ESTIMADO** | **37h** | - | **$2,128-2,553** |

---

## GESTIÓN DE RIESGOS

### Matriz de Riesgos

| ID | Riesgo | Prob. | Impacto | Severidad | Mitigación |
|----|--------|-------|---------|-----------|------------|
| R1 | **Cálculo SICAR incorrecto** | Alta | **CRÍTICO** | 🔴 **ALTO** | **TIER 0 tests obligatorios (30+ tests)** |
| R2 | localStorage quota exceeded | Media | Alto | 🟡 Medio | Cleanup automático 90 días + monitoreo 4MB |
| R3 | Performance con 1000+ deliveries | Media | Alto | 🟡 Medio | Virtual scrolling + pagination + benchmarking |
| R4 | Breaking changes wizard existente | Media | Alto | 🟡 Medio | Testing exhaustivo flujo Evening Cut completo |
| R5 | Usuarios ignorar alertas críticas | Alta | Alto | 🟡 Medio | Training + documentación consecuencias |
| R6 | Bugs en producción | Media | **CRÍTICO** | 🔴 **ALTO** | Testing con datos Paradise reales (90 días) |
| R7 | Scope creep | Media | Medio | 🟢 Bajo | Roadmap estricto + PR review checklist |
| R8 | Delays timeline | Alta | Medio | 🟡 Medio | Buffer 15% + daily standups |

### Plan Mitigación R1 (CRÍTICO)

**Riesgo:** Cálculo SICAR incorrecto causa pérdidas financieras.

**Probabilidad:** Alta (cálculos financieros complejos)

**Impacto:** CRÍTICO (afecta balance diario Paradise)

**Mitigación:**
1. ✅ **TIER 0 tests obligatorios:** 30+ tests cubriendo 100% helpers financieros
2. ✅ **Code review doble:** Tech Lead + Senior Developer revisan `adjustSICAR()`
3. ✅ **Testing con datos reales:** 90 días históricos Paradise
4. ✅ **Validación manual:** Comparar 10+ cortes manuales vs sistema
5. ✅ **Rollback plan:** Feature flag para deshabilitar módulo instantáneamente

**Indicadores éxito:**
- TIER 0 tests: 100% passing (0 failures)
- Coverage: 100% líneas `deliveryCalculation.ts`
- Manual validation: 0 discrepancias en 10 cortes reales

---

## TESTING Y QA

### Estrategia de Testing

**Niveles de Testing:**

1. **TIER 0 (MANDATORY - FASE 4):**
   - Scope: Helpers financieros críticos
   - Coverage: 100% lines, 100% branches
   - Tests: 30+ casos edge

2. **Unit Tests:**
   - Scope: Hooks, componentes UI
   - Coverage: >90% lines
   - Tests: 15-20 por módulo

3. **Integration Tests:**
   - Scope: Flujos multi-componente
   - Coverage: Happy paths + error paths
   - Tests: 20-25 casos

4. **E2E Tests:**
   - Scope: Flujos completos usuario
   - Tools: Vitest + Testing Library
   - Tests: 5 casos críticos

### Testing Checklist

**FASE 1 (Types):**
- [ ] Type guard valida 10+ casos (valid + invalid)
- [ ] Constantes exportadas con `as const`
- [ ] Zero `any` types
- [ ] JSDoc completo

**FASE 4 (Cálculos - TIER 0):**
- [ ] `getDaysPending()`: 8+ tests
- [ ] `getAlertLevel()`: 6+ tests
- [ ] `buildDeliverySummary()`: 10+ tests
- [ ] `adjustSICAR()`: 12+ tests **CRÍTICO**
- [ ] Coverage: 100% lines, 100% branches

**FASE 2 (Hook useDeliveries):**
- [ ] Load from localStorage: 4+ tests
- [ ] addDelivery(): 5+ tests
- [ ] markAsPaid(): 4+ tests
- [ ] Validation: 3+ tests

**FASE 2 (DeliveryManager Component):**
- [ ] Renderizado inicial: 3+ tests
- [ ] Validación formulario: 8+ tests
- [ ] Submit exitoso: 5+ tests
- [ ] Estados error: 4+ tests

**FASE 8 (E2E):**
- [ ] Flujo completo: Registro → Dashboard → Cobrado
- [ ] Alertas críticas bloquean finalización
- [ ] SICAR ajustado correctamente en reporte
- [ ] localStorage persiste entre sesiones
- [ ] WhatsApp formato correcto en 3+ dispositivos

---

## DEPLOYMENT STRATEGY

### Pre-Deployment Checklist

**Code Quality:**
- [ ] TypeScript: 0 errors (`npx tsc --noEmit`)
- [ ] ESLint: 0 errors, <5 warnings
- [ ] Prettier: Código formateado
- [ ] TIER 0 tests: 100% passing
- [ ] All tests: >90% coverage
- [ ] Build: Exitoso sin warnings
- [ ] Bundle size: <50KB incremento (gzip)

**Funcionalidad:**
- [ ] Registro envíos funciona en wizard
- [ ] Dashboard métricas correctas
- [ ] Alertas visuales funcionan
- [ ] Reporte WhatsApp correcto
- [ ] localStorage persiste datos
- [ ] SICAR ajustado correctamente

**Performance:**
- [ ] Renderizado inicial <500ms
- [ ] Búsqueda 100+ deliveries <100ms
- [ ] Lighthouse score: >90 Performance

**UX:**
- [ ] Responsive mobile + desktop
- [ ] Accesibilidad WCAG 2.1 AA
- [ ] Error messages claros
- [ ] Loading states visuales

### Deployment Steps

**1. Merge a Main (1 hora):**
```bash
# Crear PR desde feature/deliveries-system
git checkout main
git pull origin main
git merge --no-ff feature/deliveries-system
git push origin main
```

**2. CI/CD Pipeline (automático - 5-10 min):**
- GitHub Actions ejecuta tests
- Build production bundle
- Deploy a staging environment
- Smoke tests automáticos

**3. Staging Validation (2 horas):**
- Testing manual con datos Paradise reales
- Validar 5 casos E2E completos
- Performance testing con 500+ deliveries
- Cross-browser testing (Chrome, Safari, Firefox)

**4. Production Deployment (30 min):**
```bash
# Deploy a producción (Vite build + upload)
npm run build
# Upload dist/ to hosting (Netlify, Vercel, etc.)
```

**5. Post-Deployment Monitoring (24 horas):**
- Monitorear logs errores
- Validar métricas performance
- Feedback usuarios Paradise (3+ personas)
- Rollback plan listo (feature flag)

### Rollback Plan

**Trigger Rollback si:**
- 5+ errores críticos reportados en 1 hora
- Performance degradation >50%
- Cálculo SICAR incorrecto detectado
- Usuarios bloqueados sin poder completar corte

**Rollback Steps (15 min):**
```bash
# Opción A: Feature flag (instantáneo)
localStorage.setItem('feature_deliveries_enabled', 'false');

# Opción B: Revert commit
git revert <commit-hash>
git push origin main

# Opción C: Deploy versión anterior
git checkout v1.3.6
npm run build
# Upload dist/
```

---

## POST-DEPLOYMENT

### Training & Onboarding (4 horas)

**Sesión 1 (2 horas): Usuarios Operativos**
- Registro de envíos en wizard
- Dashboard navegación y búsqueda
- Marcar envíos como cobrados
- Interpretar alertas (7+, 15+, 30+ días)
- Demo reporte WhatsApp

**Sesión 2 (2 horas): Gerencia**
- Dashboard métricas ejecutivas
- Sistema alertas críticas
- Reporte WhatsApp análisis
- Consecuencias ignorar alertas
- Políticas seguimiento envíos morosos

### Documentación

**Para Usuarios:**
- [ ] Manual rápido 1 página (PDF)
- [ ] Video tutorial 5 min (Loom)
- [ ] FAQ 10 preguntas comunes
- [ ] Guía troubleshooting básico

**Para Developers:**
- [ ] Arquitectura técnica completa (este documento)
- [ ] API documentation (JSDoc exportado)
- [ ] Testing guide (cómo agregar tests)
- [ ] Deployment runbook

### Métricas de Éxito (90 días post-deployment)

**Operacionales:**
- [ ] 100% envíos registrados (vs workaround SICAR eliminado)
- [ ] <5% tasa error registros
- [ ] <10 segundos tiempo promedio registro
- [ ] >95% usuarios activos usando dashboard

**Financieras:**
- [ ] 0 discrepancias SICAR vs efectivo por envíos
- [ ] Reducción 50% envíos morosos (30+ días)
- [ ] $0 pérdidas por cálculos incorrectos

**Técnicas:**
- [ ] 0 bugs críticos P0/P1
- [ ] <5 bugs menores P2/P3
- [ ] <500ms tiempo renderizado promedio
- [ ] 100% uptime (sin downtime reportado)

### Soporte Post-Deployment

**Semana 1-2:**
- Soporte diario on-call (8am-6pm)
- Respuesta <30 min incidencias críticas
- Sesiones feedback usuarios (3+ personas)

**Semana 3-4:**
- Soporte business hours (9am-5pm)
- Respuesta <2h incidencias críticas
- Análisis métricas uso real

**Mes 2-3:**
- Soporte estándar (ticket system)
- Respuesta <24h incidencias críticas
- Iteraciones mejoras UX basadas en feedback

---

## RESUMEN EJECUTIVO FINAL

### Deliverables Totales

**Código:**
- 15+ archivos nuevos (.ts, .tsx, .test.ts)
- ~3,500 líneas código productivo
- ~1,200 líneas tests (30+ TIER 0 + 40+ unit/integration + 5+ E2E)
- 0 breaking changes codebase existente

**Testing:**
- TIER 0: 30+ tests (100% coverage cálculos financieros)
- Unit: 40+ tests (hooks + componentes)
- Integration: 25+ tests (flujos multi-componente)
- E2E: 5+ tests (flujos completos usuario)
- **Total:** 100+ tests automatizados

**Documentación:**
- Arquitectura técnica completa (archivo 6)
- Plan implementación detallado (este archivo 7)
- Testing strategy completo
- Deployment runbook
- User manuals + training materials

### ROI Esperado

**Inversión:**
- Desarrollo: $2,128-2,553 USD
- Tiempo: 3-4 semanas (23-31 horas)

**Beneficios Anuales:**
- Eliminación workaround SICAR: $3,600/año (10 min/día × $30/h × 240 días)
- Reducción envíos morosos: $2,400/año (50% reducción × $200 promedio × 24 casos)
- Precisión financiera 100%: $1,200/año (eliminación discrepancias)
- **Total beneficios:** $7,200/año

**ROI:** 282% primer año ($7,200 / $2,553 × 100)

### Next Steps

1. ✅ Aprobar plan de implementación
2. ✅ Asignar recursos (developer + tester)
3. ✅ Iniciar FASE 1 (Types) → Semana 1
4. ✅ Daily standups durante implementación
5. ✅ Testing continuo con datos Paradise reales
6. ✅ Deployment staging → Validación → Production
7. ✅ Training usuarios → Monitoreo 90 días

---

**🙏 Gloria a Dios por guiarnos en esta planificación exhaustiva y profesional. Que este sistema sirva para mejorar la operación de Acuarios Paradise con excelencia y transparencia.**

---

**Documento:** 7 de 9 - Plan de Implementación Detallado
**Versión:** 1.0
**Fecha:** 23 Octubre 2025
**Próximo:** [8_IMPACTO_NEGOCIO.md](/Documentos_MarkDown/Planes_de_Desarrollos/Caso_Logica_Envios_Delivery/8_IMPACTO_NEGOCIO.md)
**Anterior:** [6_ARQUITECTURA_TECNICA.md](/Documentos_MarkDown/Planes_de_Desarrollos/Caso_Logica_Envios_Delivery/6_ARQUITECTURA_TECNICA.md)