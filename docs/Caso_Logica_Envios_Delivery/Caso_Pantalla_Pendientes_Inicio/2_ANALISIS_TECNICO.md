# 2. ANÁLISIS TÉCNICO - Vista Deliveries Pantalla Inicial

**Documento:** 2 de 5 | **Fecha:** 24 Oct 2025 | **Status:** ✅ COMPLETO

---

## 📊 Arquitectura Actual

### Componentes Existentes (100% Reutilizables)

```
src/components/deliveries/ ← YA IMPLEMENTADO
├── DeliveryManager.tsx          ✅ 524 líneas
├── DeliveryDashboard.tsx        ✅ Completo con filtros
├── DeliveryDetailsModal.tsx     ✅ Modal detalles individual
├── DeliveryAlertBadge.tsx       ✅ Badges alertas (>7, >15, >30 días)
└── DeliveryEducationModal.tsx   ✅ Modal educativo

src/hooks/
├── useDeliveries.ts             ✅ CRUD deliveries + localStorage
├── useDeliveryAlerts.ts         ✅ Sistema alertas automático
└── useDeliverySummary.ts        ✅ Cálculo resumen (total, count, etc.)

src/types/deliveries.ts          ✅ Interfaces completas TypeScript
```

**Estado Actual:** Módulo deliveries 100% funcional, solo usado en Evening Cut (Fase 3 resultados).

---

## 🔧 Cambios Requeridos

### Archivo 1: `src/types/operation-mode.ts` (⚠️ MODIFICAR)

**Agregar nuevo enum:**
```typescript
export enum OperationMode {
  CASH_COUNT = 'cash-count',     // ✅ Ya existe
  CASH_CUT = 'cash-cut',         // ✅ Ya existe
  DELIVERY_VIEW = 'delivery-view' // 🆕 AGREGAR
}

export const OPERATION_MODES = {
  // ... existentes (CASH_COUNT, CASH_CUT) ...
  
  // 🆕 NUEVO
  [OperationMode.DELIVERY_VIEW]: {
    title: 'Deliveries Pendientes',
    subtitle: 'COD',
    description: 'Consulta envíos pendientes de cobro',
    icon: 'Package', // Lucide icon name
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#10b981',
    route: '/deliveries-pending'
  }
};
```

### Archivo 2: `src/components/operation-selector/OperationSelector.tsx` (⚠️ MODIFICAR)

**Cambios:**

**1. Importar nuevo enum:**
```typescript
import { OperationMode, OPERATION_MODES } from '@/types/operation-mode';
import { Package } from 'lucide-react'; // 🆕 Agregar icon
```

**2. Agregar tercera tarjeta (duplicar estructura existente):**
```typescript
const deliveryView = OPERATION_MODES[OperationMode.DELIVERY_VIEW];

// Después de las 2 cards existentes (línea ~337):

{/* Card de Deliveries Pendientes (NUEVA) */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.3 }}
  whileHover={{ scale: 1.02 }}
  onClick={() => onSelectMode(OperationMode.DELIVERY_VIEW)}
  className="cursor-pointer group"
  style={{
    background: 'rgba(36, 36, 36, 0.4)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '16px',
    padding: `clamp(20px, ${32 * viewportScale}px, 32px)`,
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
  }}
>
  {/* Ícono y badge */}
  <div className="flex items-start justify-between mb-6">
    <Package 
      style={{
        width: `clamp(48px, 12vw, 64px)`,
        height: `clamp(48px, 12vw, 64px)`,
        background: deliveryView.gradient,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}
    />
    <span 
      className="rounded-full font-semibold"
      style={{
        padding: `${Math.round(4 * viewportScale)}px ${Math.round(12 * viewportScale)}px`,
        fontSize: `clamp(0.625rem, 2.5vw, 0.75rem)`,
        background: 'rgba(16, 185, 129, 0.2)',
        border: '1px solid rgba(16, 185, 129, 0.4)',
        color: '#10b981'
      }}
    >
      {deliveryView.subtitle}
    </span>
  </div>

  {/* Título y descripción */}
  <h3 className="font-bold mb-3" style={{
    fontSize: `clamp(1.25rem, 5vw, 1.5rem)`,
    color: '#e1e8ed'
  }}>
    {deliveryView.title}
  </h3>
  <p className="mb-6" style={{
    fontSize: `clamp(0.75rem, 3vw, 0.875rem)`,
    color: '#8899a6'
  }}>
    {deliveryView.description}
  </p>

  {/* Características (bullets) */}
  <div className="mb-6" style={{ display: 'flex', flexDirection: 'column', gap: `clamp(6px, 1.5vw, 8px)` }}>
    <div className="flex items-center" style={{ gap: `clamp(6px, 1.5vw, 8px)` }}>
      <div className="rounded-full" style={{
        width: `clamp(5px, 1.5vw, 6px)`,
        height: `clamp(5px, 1.5vw, 6px)`,
        background: '#10b981'
      }} />
      <span style={{
        fontSize: `clamp(0.75rem, 3vw, 0.875rem)`,
        color: '#8899a6'
      }}>
        Vista completa de envíos activos
      </span>
    </div>
    <div className="flex items-center" style={{ gap: `clamp(6px, 1.5vw, 8px)` }}>
      <div className="rounded-full" style={{
        width: `clamp(5px, 1.5vw, 6px)`,
        height: `clamp(5px, 1.5vw, 6px)`,
        background: '#10b981'
      }} />
      <span style={{
        fontSize: `clamp(0.75rem, 3vw, 0.875rem)`,
        color: '#8899a6'
      }}>
        Actualizar estados (pagado/cancelado)
      </span>
    </div>
    <div className="flex items-center" style={{ gap: `clamp(6px, 1.5vw, 8px)` }}>
      <div className="rounded-full" style={{
        width: `clamp(5px, 1.5vw, 6px)`,
        height: `clamp(5px, 1.5vw, 6px)`,
        background: '#10b981'
      }} />
      <span style={{
        fontSize: `clamp(0.75rem, 3vw, 0.875rem)`,
        color: '#8899a6'
      }}>
        Alertas automáticas de antigüedad
      </span>
    </div>
  </div>

  {/* Botón de acción */}
  <div className="flex items-center justify-between">
    <span className="font-medium" style={{
      fontSize: `clamp(0.75rem, 3vw, 0.875rem)`,
      color: '#10b981'
    }}>
      Comenzar
    </span>
    <ArrowRight 
      className="w-5 h-5 group-hover:translate-x-1 transition-transform"
      style={{ color: '#10b981' }}
    />
  </div>
</motion.div>
```

**3. Actualizar grid layout:**
```typescript
// Cambiar de grid-cols-2 a grid-cols-3 en desktop
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
  {/* 3 cards ahora */}
</div>
```

### Archivo 3: `src/components/deliveries/DeliveryDashboardWrapper.tsx` (🆕 CREAR)

**Propósito:** Wrapper que valida PIN antes de mostrar dashboard

```typescript
/**
 * Wrapper con validación PIN opcional para DeliveryDashboard
 * 
 * Props:
 * - requirePin: boolean (true = solicita PIN, false = acceso directo)
 */

import { useState } from 'motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DeliveryDashboard } from './DeliveryDashboard';
import { PinModal } from '../ui/pin-modal'; // Asumiendo existe o crear simple
import { Button } from '../ui/button';

interface DeliveryDashboardWrapperProps {
  requirePin?: boolean;
}

export function DeliveryDashboardWrapper({
  requirePin = true
}: DeliveryDashboardWrapperProps) {
  const navigate = useNavigate();
  const [isPinValidated, setIsPinValidated] = useState(!requirePin);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const handlePinSuccess = () => {
    setIsPinValidated(true);
    setFailedAttempts(0);
  };

  const handlePinError = () => {
    setFailedAttempts(prev => prev + 1);
    
    if (failedAttempts >= 2) { // 3 intentos total
      setIsLocked(true);
      setTimeout(() => {
        setIsLocked(false);
        setFailedAttempts(0);
      }, 5 * 60 * 1000); // 5 minutos
    }
  };

  const handleGoBack = () => {
    navigate('/'); // Volver a OperationSelector
  };

  // Si PIN no validado → mostrar modal
  if (!isPinValidated) {
    return (
      <PinModal
        isOpen={true}
        onSuccess={handlePinSuccess}
        onError={handlePinError}
        isLocked={isLocked}
        attempts={failedAttempts}
        maxAttempts={3}
        onCancel={handleGoBack}
      />
    );
  }

  // PIN validado → mostrar dashboard con breadcrumb
  return (
    <div className="min-h-screen relative">
      {/* Breadcrumb */}
      <div className="p-4">
        <Button 
          variant="ghost" 
          onClick={handleGoBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Operaciones
        </Button>
      </div>

      {/* Dashboard completo */}
      <DeliveryDashboard />
    </div>
  );
}
```

### Archivo 4: `src/App.tsx` (⚠️ MODIFICAR)

**Agregar ruta nueva:**

```typescript
import { DeliveryDashboardWrapper } from './components/deliveries/DeliveryDashboardWrapper';

// Dentro del router/switch:
case OperationMode.DELIVERY_VIEW:
  return <DeliveryDashboardWrapper requirePin={true} />;
```

---

## 📦 Badge Contador Dinámico (Opcional - Mejora UX)

### Hook Personalizado: `useDeliveryCount`

```typescript
// src/hooks/useDeliveryCount.ts (🆕 CREAR - OPCIONAL)

import { useMemo } from 'react';
import { useDeliveries } from './useDeliveries';

export function useDeliveryCount() {
  const { pending } = useDeliveries();

  const summary = useMemo(() => {
    const count = pending.length;
    const total = pending.reduce((sum, d) => sum + d.amount, 0);
    
    return {
      count,
      total,
      formatted: `${count} ${count === 1 ? 'delivery' : 'deliveries'} | $${total.toFixed(2)}`
    };
  }, [pending]);

  return summary;
}
```

### Uso en OperationSelector:

```typescript
import { useDeliveryCount } from '@/hooks/useDeliveryCount';

// Dentro del componente:
const deliveryCount = useDeliveryCount();

// Agregar badge dinámico en la tarjeta:
<div className="mt-4 p-2 rounded-lg" style={{
  background: 'rgba(16, 185, 129, 0.1)',
  border: '1px solid rgba(16, 185, 129, 0.2)'
}}>
  <p className="text-sm font-medium" style={{ color: '#10b981' }}>
    {deliveryCount.formatted}
  </p>
</div>
```

---

## 🔐 Sistema PIN (Componente Reutilizable)

### Crear: `src/components/ui/pin-modal.tsx` (🆕 SI NO EXISTE)

```typescript
/**
 * Modal validación PIN genérico
 * Reutilizable para múltiples casos
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { Input } from './input';
import { Lock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// PIN supervisor en hash SHA-256 (ejemplo: "1234" → hash)
const SUPERVISOR_PIN_HASH = 'a883dafc480d466ee04e0d6da986bd78eb1fdd2178d04693723da3a8f95d42f4';

interface PinModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onError: () => void;
  onCancel: () => void;
  isLocked: boolean;
  attempts: number;
  maxAttempts: number;
}

export function PinModal({
  isOpen,
  onSuccess,
  onError,
  onCancel,
  isLocked,
  attempts,
  maxAttempts
}: PinModalProps) {
  const [pin, setPin] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLocked) {
      toast.error('Acceso bloqueado temporalmente');
      return;
    }

    // Hash del PIN ingresado
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (hashHex === SUPERVISOR_PIN_HASH) {
      toast.success('✅ PIN correcto');
      onSuccess();
    } else {
      toast.error(`❌ PIN incorrecto. Intento ${attempts + 1}/${maxAttempts}`);
      setPin('');
      onError();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            PIN Supervisor Requerido
          </DialogTitle>
        </DialogHeader>

        {isLocked ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <p className="text-red-500 font-semibold">Acceso bloqueado</p>
            <p className="text-sm text-muted-foreground mt-2">
              Reintente en 5 minutos
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Ingrese PIN (4-6 dígitos)"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                maxLength={6}
                autoFocus
              />
              {attempts > 0 && (
                <p className="text-sm text-red-500 mt-2">
                  Intentos restantes: {maxAttempts - attempts}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={pin.length < 4} className="flex-1">
                Validar
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

---

## 🧪 Componentes de Testing

### Test Mock Data

```typescript
// src/__tests__/fixtures/delivery-fixtures.ts (🆕 CREAR)

import type { DeliveryEntry } from '@/types/deliveries';

export const mockDeliveryPending: DeliveryEntry = {
  id: 'mock-delivery-1',
  customerName: 'Carlos Gómez',
  amount: 113.00,
  courier: 'C807',
  guideNumber: 'APA-1832-202510230001',
  invoiceNumber: '12347',
  status: 'pending_cod',
  createdAt: '2025-10-21T10:30:00-06:00',
  notes: 'Acuario 50L Santa Ana'
};

export const mockDeliveryPendingOld: DeliveryEntry = {
  ...mockDeliveryPending,
  id: 'mock-delivery-2',
  customerName: 'Ana Martínez',
  amount: 250.00,
  courier: 'Melos',
  createdAt: '2025-09-15T14:00:00-06:00', // 39 días atrás
  guideNumber: 'M-5678'
};

export const mockDeliveriesList: DeliveryEntry[] = [
  mockDeliveryPending,
  mockDeliveryPendingOld,
  {
    ...mockDeliveryPending,
    id: 'mock-delivery-3',
    customerName: 'José López',
    amount: 87.50,
    courier: 'C807',
    createdAt: '2025-10-18T16:45:00-06:00'
  }
];
```

---

## 📊 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    APP.TSX (Router)                         │
└──────┬──────────────────────────────────────────────────────┘
       │
       ├──> OperationMode.CASH_COUNT → <MorningVerification />
       ├──> OperationMode.CASH_CUT → <CashCounter />
       └──> OperationMode.DELIVERY_VIEW → <DeliveryDashboardWrapper /> 🆕
                                                    │
                  ┌─────────────────────────────────┴──────────────────────┐
                  │                                                        │
                  ▼                                                        ▼
        [requirePin=true?]                                      [requirePin=false]
                  │                                                        │
         ┌────────┴─────────┐                                            │
         │   <PinModal />   │                                            │
         │  - Valida PIN    │                                            │
         │  - 3 intentos    │                                            │
         │  - Bloqueo 5min  │                                            │
         └────────┬─────────┘                                            │
                  │                                                        │
           [PIN correcto]                                                 │
                  │                                                        │
                  └────────────────────────────┬───────────────────────────┘
                                               │
                                               ▼
                                  ┌────────────────────────────┐
                                  │  <DeliveryDashboard />      │
                                  │  (ya existe - reutilizado)  │
                                  └────────────────────────────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    │                          │                          │
                    ▼                          ▼                          ▼
         ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
         │ useDeliveries    │    │ useDeliveryAlerts│    │ useDeliverySummary│
         │ - pending[]      │    │ - getAlert()     │    │ - total, count   │
         │ - markAsPaid()   │    │ - warning/urgent │    │ - byCourier      │
         │ - cancelDelivery()│    │ - critical       │    │                  │
         └──────────────────┘    └──────────────────┘    └──────────────────┘
                    │
                    ▼
         ┌──────────────────┐
         │  localStorage     │
         │  - deliveries_    │
         │    pending        │
         └──────────────────┘
```

---

## 📁 Estructura Final Archivos

```
src/
├── components/
│   ├── operation-selector/
│   │   └── OperationSelector.tsx        ⚠️ MODIFICAR
│   ├── deliveries/
│   │   ├── DeliveryManager.tsx          ✅ Ya existe
│   │   ├── DeliveryDashboard.tsx        ✅ Ya existe
│   │   ├── DeliveryDashboardWrapper.tsx 🆕 CREAR
│   │   ├── DeliveryDetailsModal.tsx     ✅ Ya existe
│   │   └── DeliveryAlertBadge.tsx       ✅ Ya existe
│   └── ui/
│       └── pin-modal.tsx                 🆕 CREAR (si no existe)
├── hooks/
│   ├── useDeliveries.ts                 ✅ Ya existe
│   ├── useDeliveryAlerts.ts             ✅ Ya existe
│   ├── useDeliverySummary.ts            ✅ Ya existe
│   └── useDeliveryCount.ts              🆕 CREAR (opcional badge)
├── types/
│   ├── deliveries.ts                    ✅ Ya existe
│   └── operation-mode.ts                ⚠️ MODIFICAR
├── App.tsx                               ⚠️ MODIFICAR
└── __tests__/
    └── fixtures/
        └── delivery-fixtures.ts          🆕 CREAR
```

**Resumen:**
- 🆕 **Crear:** 3-4 archivos nuevos (300-400 líneas total)
- ⚠️ **Modificar:** 3 archivos existentes (~100 líneas agregadas)
- ✅ **Reutilizar:** 8+ componentes/hooks sin cambios

---

## 🚀 Estimación Técnica

| Tarea | Archivos | Líneas Código | Tiempo |
|-------|----------|---------------|--------|
| Modificar operation-mode.ts | 1 | +20 | 15min |
| Modificar OperationSelector.tsx | 1 | +80 | 60min |
| Crear DeliveryDashboardWrapper.tsx | 1 | ~100 | 45min |
| Crear pin-modal.tsx | 1 | ~120 | 45min |
| Modificar App.tsx (routing) | 1 | +5 | 10min |
| Crear useDeliveryCount.ts (opcional) | 1 | ~30 | 20min |
| Tests fixtures | 1 | ~60 | 15min |
| **TOTAL** | **7 archivos** | **~415 líneas** | **3-4h** |

---

**Última actualización:** 24 Oct 2025  
**Próximo documento:** [3_PLAN_IMPLEMENTACION.md](./3_PLAN_IMPLEMENTACION.md)
