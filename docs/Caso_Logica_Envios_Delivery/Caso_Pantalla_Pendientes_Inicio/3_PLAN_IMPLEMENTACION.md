# 3. PLAN DE IMPLEMENTACIÓN - Vista Deliveries Pantalla Inicial

**Documento:** 3 de 5 | **Fecha:** 24 Oct 2025 | **Status:** ✅ COMPLETO

---

## 📋 Resumen Ejecutivo

### Objetivo
Implementar acceso directo a deliveries pendientes desde pantalla inicial en **3-4 horas desarrollo**.

### Fases
| Fase | Nombre | Duración | Criticidad |
|------|--------|----------|------------|
| **FASE 1** | Preparación + Enums | 30min | 🟢 Baja |
| **FASE 2** | UI Tercera Tarjeta | 90min | 🟡 Media |
| **FASE 3** | PIN + Wrapper Component | 60min | 🔴 Alta |
| **FASE 4** | Testing + QA | 60min | 🔴 Alta |

**Total:** 3-4 horas (~$240-320 USD @ $80/h)

---

## 🎯 FASE 1: Preparación y Constantes (30min)

### Objetivo
Crear branch, actualizar enums, preparar ambiente desarrollo.

### Tareas

| # | Tarea | Duración | Archivos Afectados |
|---|-------|----------|-------------------|
| 1.1 | Crear feature branch | 5min | Git |
| 1.2 | Actualizar operation-mode.ts | 15min | `src/types/operation-mode.ts` |
| 1.3 | Verificar imports deliveries | 5min | Varios |
| 1.4 | Preparar mock data testing | 5min | `src/__tests__/fixtures/` |

### Implementación Detallada

#### 1.1 Crear Feature Branch
```bash
# Desde main branch
git checkout main
git pull origin main

# Crear nueva branch
git checkout -b feature/delivery-view-home

# Verificar branch activo
git branch
# * feature/delivery-view-home
```

#### 1.2 Actualizar `operation-mode.ts`

**Archivo:** `src/types/operation-mode.ts`

**Cambios:**
```typescript
// Agregar nuevo enum value
export enum OperationMode {
  CASH_COUNT = 'cash-count',
  CASH_CUT = 'cash-cut',
  DELIVERY_VIEW = 'delivery-view' // 🆕 AGREGAR
}

// Agregar configuración nuevo modo
export const OPERATION_MODES = {
  [OperationMode.CASH_COUNT]: {
    // ... existente ...
  },
  [OperationMode.CASH_CUT]: {
    // ... existente ...
  },
  // 🆕 NUEVO
  [OperationMode.DELIVERY_VIEW]: {
    title: 'Deliveries Pendientes',
    subtitle: 'COD',
    description: 'Consulta envíos pendientes de cobro',
    icon: 'Package',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#10b981',
    route: '/deliveries-pending'
  }
};
```

#### 1.3 Crear Mock Data

**Archivo:** `src/__tests__/fixtures/delivery-fixtures.ts` (nuevo)

```typescript
import type { DeliveryEntry } from '@/types/deliveries';

export const mockDeliveryPending: DeliveryEntry = {
  id: 'test-delivery-1',
  customerName: 'Carlos Gómez',
  amount: 113.00,
  courier: 'C807',
  guideNumber: 'APA-1832-TEST',
  status: 'pending_cod',
  createdAt: '2025-10-21T10:30:00-06:00'
};

export const mockDeliveriesList: DeliveryEntry[] = [
  mockDeliveryPending,
  {
    ...mockDeliveryPending,
    id: 'test-delivery-2',
    customerName: 'Ana Martínez',
    amount: 250.00,
    courier: 'Melos'
  }
];
```

### Criterios de Aceptación FASE 1
- [ ] Branch creado y activo
- [ ] TypeScript compila sin errores (`npx tsc --noEmit`)
- [ ] Nuevos enums exportados correctamente
- [ ] Mock data preparado para tests

---

## 🎨 FASE 2: UI Tercera Tarjeta (90min)

### Objetivo
Implementar tercera tarjeta "Deliveries Pendientes" en `OperationSelector` con diseño consistente.

### Tareas

| # | Tarea | Duración | Archivos |
|---|-------|----------|----------|
| 2.1 | Importar Package icon + constantes | 5min | `OperationSelector.tsx` |
| 2.2 | Implementar estructura tarjeta | 30min | `OperationSelector.tsx` |
| 2.3 | Aplicar glass morphism + responsive | 20min | `OperationSelector.tsx` |
| 2.4 | Agregar badge contador opcional | 15min | `OperationSelector.tsx` |
| 2.5 | Actualizar grid layout | 10min | `OperationSelector.tsx` |
| 2.6 | Testing visual manual | 10min | Browser |

### Implementación Detallada

#### 2.1 Imports Necesarios

**Archivo:** `src/components/operation-selector/OperationSelector.tsx`

```typescript
// Agregar imports
import { Package, ArrowRight } from 'lucide-react'; // Package ya está importado ArrowRight
import { OperationMode, OPERATION_MODES } from '@/types/operation-mode';
```

#### 2.2 Estructura Tarjeta Completa

**Ubicación:** Después de línea ~336 (tras card "Fin de Turno")

```typescript
const deliveryView = OPERATION_MODES[OperationMode.DELIVERY_VIEW];

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

  {/* Título */}
  <h3 className="font-bold mb-3" style={{
    fontSize: `clamp(1.25rem, 5vw, 1.5rem)`,
    color: '#e1e8ed'
  }}>
    {deliveryView.title}
  </h3>

  {/* Descripción */}
  <p className="mb-6" style={{
    fontSize: `clamp(0.75rem, 3vw, 0.875rem)`,
    color: '#8899a6'
  }}>
    {deliveryView.description}
  </p>

  {/* Bullets características */}
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

  {/* CTA Button */}
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

#### 2.3 Actualizar Grid Layout

**Cambio en contenedor grid (línea ~103):**

```typescript
// ANTES:
<div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">

// DESPUÉS:
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
  {/* Ahora 3 columnas en desktop (lg+), 2 en tablet (md), 1 en mobile */}
</div>
```

### Criterios de Aceptación FASE 2
- [ ] Tercera tarjeta visible en pantalla inicial
- [ ] Diseño idéntico a tarjetas existentes (glass morphism)
- [ ] Responsive: 360px-430px-768px-1280px+
- [ ] Hover effect funciona (scale 1.02)
- [ ] Click ejecuta `onSelectMode(OperationMode.DELIVERY_VIEW)`
- [ ] Sin console errors

---

## 🔐 FASE 3: PIN + Wrapper Component (60min)

### Objetivo
Crear `DeliveryDashboardWrapper` con validación PIN opcional y navegación.

### Tareas

| # | Tarea | Duración | Archivos |
|---|-------|----------|----------|
| 3.1 | Crear PinModal component | 25min | `src/components/ui/pin-modal.tsx` |
| 3.2 | Crear DeliveryDashboardWrapper | 20min | `src/components/deliveries/DeliveryDashboardWrapper.tsx` |
| 3.3 | Agregar ruta en App.tsx | 10min | `src/App.tsx` |
| 3.4 | Testing manual flujo completo | 5min | Browser |

### Implementación Detallada

#### 3.1 PinModal Component

**Archivo:** `src/components/ui/pin-modal.tsx` (nuevo)

```typescript
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { Input } from './input';
import { Lock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// PIN ejemplo: "1234" → hash SHA-256
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

    // Hash PIN ingresado
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

#### 3.2 DeliveryDashboardWrapper

**Archivo:** `src/components/deliveries/DeliveryDashboardWrapper.tsx` (nuevo)

```typescript
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DeliveryDashboard } from './DeliveryDashboard';
import { PinModal } from '../ui/pin-modal';
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
    
    if (failedAttempts >= 2) { // 3 intentos total (0,1,2)
      setIsLocked(true);
      setTimeout(() => {
        setIsLocked(false);
        setFailedAttempts(0);
      }, 5 * 60 * 1000); // 5 minutos
    }
  };

  const handleGoBack = () => {
    navigate('/');
  };

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

  return (
    <div className="min-h-screen relative p-4">
      {/* Breadcrumb */}
      <div className="mb-4">
        <Button 
          variant="ghost" 
          onClick={handleGoBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Operaciones
        </Button>
      </div>

      {/* Dashboard */}
      <DeliveryDashboard />
    </div>
  );
}
```

#### 3.3 Agregar Ruta App.tsx

**Archivo:** `src/App.tsx`

```typescript
// Agregar import
import { DeliveryDashboardWrapper } from './components/deliveries/DeliveryDashboardWrapper';

// En el switch/case de routing (buscar donde están CASH_COUNT y CASH_CUT):
case OperationMode.DELIVERY_VIEW:
  return <DeliveryDashboardWrapper requirePin={true} />;
```

### Criterios de Aceptación FASE 3
- [ ] Click tarjeta → Modal PIN aparece
- [ ] PIN correcto → Dashboard carga
- [ ] PIN incorrecto → Mensaje error + contador intentos
- [ ] 3 intentos fallidos → Bloqueo 5 minutos
- [ ] Botón "Volver" → Retorna a OperationSelector
- [ ] Dashboard completo funcional (todas acciones)

---

## 🧪 FASE 4: Testing y QA (60min)

### Objetivo
Validar funcionamiento completo con suite de tests automatizados + manual testing.

### Tareas

| # | Tarea | Duración | Herramientas |
|---|-------|----------|--------------|
| 4.1 | Unit tests PinModal | 15min | Vitest + Testing Library |
| 4.2 | Integration tests navegación | 20min | Vitest |
| 4.3 | Testing manual devices | 15min | Chrome DevTools + iPhone real |
| 4.4 | Fix bugs + refinamiento | 10min | - |

### Tests a Implementar

#### 4.1 Unit Tests PinModal

**Archivo:** `src/components/ui/__tests__/pin-modal.test.tsx` (nuevo)

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PinModal } from '../pin-modal';

describe('PinModal', () => {
  it('muestra modal cuando isOpen=true', () => {
    render(
      <PinModal
        isOpen={true}
        onSuccess={vi.fn()}
        onError={vi.fn()}
        onCancel={vi.fn()}
        isLocked={false}
        attempts={0}
        maxAttempts={3}
      />
    );
    
    expect(screen.getByText('PIN Supervisor Requerido')).toBeInTheDocument();
  });

  it('muestra mensaje bloqueo cuando isLocked=true', () => {
    render(
      <PinModal
        isOpen={true}
        onSuccess={vi.fn()}
        onError={vi.fn()}
        onCancel={vi.fn()}
        isLocked={true}
        attempts={3}
        maxAttempts={3}
      />
    );
    
    expect(screen.getByText('Acceso bloqueado')).toBeInTheDocument();
  });

  it('llama onCancel al clickear Cancelar', () => {
    const onCancel = vi.fn();
    render(
      <PinModal
        isOpen={true}
        onSuccess={vi.fn()}
        onError={vi.fn()}
        onCancel={onCancel}
        isLocked={false}
        attempts={0}
        maxAttempts={3}
      />
    );
    
    fireEvent.click(screen.getByText('Cancelar'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
```

#### 4.2 Integration Test Navegación

**Archivo:** `src/__tests__/integration/delivery-view-navigation.test.tsx` (nuevo)

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { OperationSelector } from '@/components/operation-selector/OperationSelector';

describe('Delivery View Navigation', () => {
  it('tarjeta Deliveries Pendientes es clickeable', () => {
    const handleSelectMode = vi.fn();
    
    render(
      <MemoryRouter>
        <OperationSelector onSelectMode={handleSelectMode} />
      </MemoryRouter>
    );
    
    const deliveryCard = screen.getByText('Deliveries Pendientes');
    expect(deliveryCard).toBeInTheDocument();
    
    fireEvent.click(deliveryCard.closest('div')!);
    expect(handleSelectMode).toHaveBeenCalledWith('delivery-view');
  });

  it('muestra 3 tarjetas en pantalla inicial', () => {
    render(
      <MemoryRouter>
        <OperationSelector onSelectMode={vi.fn()} />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Inicio de Turno')).toBeInTheDocument();
    expect(screen.getByText('Fin de Turno')).toBeInTheDocument();
    expect(screen.getByText('Deliveries Pendientes')).toBeInTheDocument();
  });
});
```

### Checklist Testing Manual

**Device Testing:**
- [ ] iPhone 12 (390x844) - Safari
- [ ] Samsung A50 (360x740) - Chrome
- [ ] iPhone 16 Pro Max (430x932) - Safari
- [ ] iPad (768x1024) - Safari
- [ ] Desktop (1920x1080) - Chrome

**Funcionalidades:**
- [ ] Tarjeta visible y responsive
- [ ] Click tarjeta → Modal PIN
- [ ] PIN correcto → Dashboard
- [ ] PIN incorrecto → Error message
- [ ] Bloqueo tras 3 intentos
- [ ] Breadcrumb "Volver" funciona
- [ ] Dashboard completo operativo
- [ ] Marcar como pagado funciona
- [ ] Filtros funcionan
- [ ] Exportar CSV funciona

### Criterios de Aceptación FASE 4
- [ ] Tests unitarios ≥80% coverage
- [ ] Integration tests pasan (100%)
- [ ] Testing manual 10 devices OK
- [ ] Zero console errors/warnings
- [ ] Performance <2s carga dashboard

---

## 📦 Deployment Strategy

### Pre-Deployment Checklist

**Code Quality:**
- [ ] TypeScript compila sin errores (`npx tsc --noEmit`)
- [ ] ESLint sin warnings (`npm run lint`)
- [ ] Tests pasan 100% (`npm run test`)
- [ ] Build exitoso (`npm run build`)

**Git:**
- [ ] Commits con mensajes descriptivos
- [ ] Branch limpio (sin archivos temporales)
- [ ] PR creado con descripción completa

### Merge Strategy

```bash
# 1. Asegurar branch actualizado
git checkout feature/delivery-view-home
git pull origin main
git merge main

# 2. Resolver conflictos si existen

# 3. Verificar tests
npm run test
npm run build

# 4. Push a remote
git push origin feature/delivery-view-home

# 5. Crear Pull Request en GitHub
# Título: "feat: Add Delivery View to home screen"
# Descripción: Incluir capturas pantalla + checklist

# 6. Aprobar + Merge a main

# 7. Deploy a producción
npm run deploy # O CI/CD automático
```

### Post-Deployment

**Monitoreo (1 semana):**
- [ ] Analytics uso feature (clicks tarjeta)
- [ ] Error rate (<1%)
- [ ] Performance dashboard (<2s)
- [ ] Feedback usuarios (survey)

**Rollback Plan:**
- Revertir commit si bugs críticos
- Feature flag futuro (toggle ON/OFF)

---

## ✅ Criterios de Éxito Global

### Funcionales
- ✅ Tercera tarjeta visible en pantalla inicial
- ✅ Navegación a dashboard funciona
- ✅ PIN opcional funciona (Opción A)
- ✅ Todas acciones dashboard operativas
- ✅ Responsive 360px-430px-768px+

### Técnicos
- ✅ TypeScript strict (0 errores, 0 `any`)
- ✅ Tests ≥85% coverage
- ✅ Performance <2s carga
- ✅ Zero breaking changes
- ✅ Bundle size <+50KB

### UX
- ✅ Acceso en <10 segundos (vs 2-3min actual)
- ✅ Feedback inmediato (toasts)
- ✅ Estados vacíos informativos
- ✅ Animaciones smooth (60fps)

---

## 📊 Resumen Esfuerzo

| Fase | Archivos | Líneas Código | Tests | Tiempo |
|------|----------|---------------|-------|--------|
| FASE 1 | 2 archivos | +80 líneas | - | 30min |
| FASE 2 | 1 archivo | +120 líneas | - | 90min |
| FASE 3 | 3 archivos | +220 líneas | - | 60min |
| FASE 4 | 2 archivos | +150 líneas tests | 8-10 | 60min |
| **TOTAL** | **8 archivos** | **~570 líneas** | **8-10** | **3-4h** |

**Costo estimado:** $240-320 USD @ $80/h

---

**Última actualización:** 24 Oct 2025  
**Próximo documento:** [4_TESTING_PLAN.md](./4_TESTING_PLAN.md)
