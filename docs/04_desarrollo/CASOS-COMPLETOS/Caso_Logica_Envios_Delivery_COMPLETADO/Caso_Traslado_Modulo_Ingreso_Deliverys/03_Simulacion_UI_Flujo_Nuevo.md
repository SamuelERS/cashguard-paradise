# 03. Simulación UI - Flujo Nuevo Phase 2.5

**Versión:** v1.0.0  
**Fecha:** 2025-01-24  
**Status:** ✅ WIREFRAMES COMPLETOS

---

## 🎨 Mockup Phase 2.5: Checkpoint Deliveries

### Pantalla Completa (Desktop/Tablet)

```
┌────────────────────────────────────────────────────────────────┐
│  CashGuard Paradise                        🌙 Evening Cut      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 🔄 FASE 2.5: Revisión de Deliveries Pendientes         │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  Antes de generar el reporte final, revise los cobros         │
│  pendientes de envíos. Estos montos se restarán               │
│  automáticamente del SICAR esperado.                          │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ 📦 Deliveries Pendientes (COD)                        │   │
│  │                                                        │   │
│  │  ┌──────────────────────────────────────────────────┐ │   │
│  │  │ ➕ Agregar Nuevo Delivery                       │ │   │
│  │  │                                                  │ │   │
│  │  │ Cliente: [___________________________]          │ │   │
│  │  │ Monto: $[_________]                             │ │   │
│  │  │ Courier: [▼ Seleccionar]                        │ │   │
│  │  │ # Guía: [___________________________]           │ │   │
│  │  │                                                  │ │   │
│  │  │ [Cancelar] [➕ Agregar Delivery]                │ │   │
│  │  └──────────────────────────────────────────────────┘ │   │
│  │                                                        │   │
│  │  ┌──────────────────────────────────────────────────┐ │   │
│  │  │ 📋 Lista de Pendientes (3)                      │ │   │
│  │  │                                                  │ │   │
│  │  │ • Juan Pérez - $45.00 [C807 #12345]            │ │   │
│  │  │   Hace 2 días                                   │ │   │
│  │  │   [✓ Pagado] [❌ Cancelar] [🚫 Rechazar]       │ │   │
│  │  │                                                  │ │   │
│  │  │ • María López - $120.00 [Melos #67890]         │ │   │
│  │  │   Hace 5 días                                   │ │   │
│  │  │   [✓ Pagado] [❌ Cancelar] [🚫 Rechazar]       │ │   │
│  │  │                                                  │ │   │
│  │  │ • Pedro Gómez - $30.00 [C807 #11111]           │ │   │
│  │  │   ⚠️ Hace 8 días                                │ │   │
│  │  │   [✓ Pagado] [❌ Cancelar] [🚫 Rechazar]       │ │   │
│  │  └──────────────────────────────────────────────────┘ │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ ℹ️ Impacto en Reporte                                 │   │
│  │                                                        │   │
│  │  SICAR Esperado Original:        $5,000.00           │   │
│  │  Deliveries Pendientes (3):       -$195.00           │   │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │   │
│  │  SICAR Ajustado:                  $4,805.00          │   │
│  │                                                        │   │
│  │  ⚠️ Los $195.00 en deliveries se restarán del        │   │
│  │     efectivo esperado en el reporte final.            │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ [← Volver a División]    [Continuar al Reporte →]    │   │
│  └────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

### Pantalla Móvil (360px - 430px)

```
┌──────────────────────────┐
│  CashGuard Paradise      │
│  🌙 Evening Cut          │
│  ━━━━━━━━━━━━━━━━━━━━━━│
│                          │
│  🔄 FASE 2.5            │
│  Deliveries Pendientes   │
│                          │
│  Revise cobros antes del │
│  reporte final.          │
│                          │
│ ┌────────────────────┐   │
│ │ 📦 Pendientes (3) │   │
│ │                    │   │
│ │ Juan Pérez         │   │
│ │ $45.00 • 2 días    │   │
│ │ C807 #12345        │   │
│ │ [✓][❌][🚫]        │   │
│ │ ──────────────────│   │
│ │ María López        │   │
│ │ $120.00 • 5 días   │   │
│ │ Melos #67890       │   │
│ │ [✓][❌][🚫]        │   │
│ └────────────────────┘   │
│                          │
│ ┌────────────────────┐   │
│ │ ℹ️ Impacto         │   │
│ │ Original: $5,000   │   │
│ │ Pendientes: -$195  │   │
│ │ Ajustado: $4,805   │   │
│ └────────────────────┘   │
│                          │
│ [← Volver]               │
│ [Continuar al Reporte →]│
└──────────────────────────┘
```

---

## 🔄 Flujo de Interacción Usuario

### Escenario 1: Sin Deliveries Pendientes

```
Phase 2 (División) completada
        ↓
Phase 2.5: Pantalla muestra "0 deliveries pendientes"
        ↓
Usuario ve: "✅ No hay deliveries pendientes. El reporte usará SICAR original."
        ↓
[Continuar al Reporte] (habilitado inmediatamente)
        ↓
Phase 3: Reporte con SICAR sin ajuste
```

### Escenario 2: Con Deliveries Pendientes (Sin cambios)

```
Phase 2 (División) completada
        ↓
Phase 2.5: Pantalla muestra "3 deliveries pendientes ($195)"
        ↓
Usuario revisa lista: "OK, estos están correctos"
        ↓
[Continuar al Reporte] (sin editar)
        ↓
Phase 3: Reporte con SICAR ajustado ($5,000 - $195 = $4,805)
```

### Escenario 3: Cobra un Delivery Durante la Revisión

```
Phase 2.5: Ve "Juan Pérez - $45.00"
        ↓
Usuario recuerda: "¡Juan acaba de pagar hace 10 minutos!"
        ↓
Click [✓ Pagado] en delivery de Juan
        ↓
Sistema actualiza:
  - Deliveries pendientes: 3 → 2
  - Total pendiente: $195 → $150
  - SICAR ajustado: $4,805 → $4,850
        ↓
[Continuar al Reporte]
        ↓
Phase 3: Reporte CORRECTO (refleja pago reciente)
```

### Escenario 4: Agregar Delivery Olvidado

```
Phase 2.5: Usuario recuerda delivery no registrado
        ↓
Click [➕ Agregar Nuevo Delivery]
        ↓
Formulario:
  - Cliente: "Ana Martínez"
  - Monto: $80.00
  - Courier: C807
  - # Guía: #99999
        ↓
[Agregar Delivery]
        ↓
Sistema actualiza:
  - Deliveries pendientes: 3 → 4
  - Total pendiente: $195 → $275
  - SICAR ajustado: $4,805 → $4,725
        ↓
[Continuar al Reporte]
        ↓
Phase 3: Reporte incluye delivery que faltaba
```

---

## 🎯 Elementos UI Clave

### 1. Header con Contexto

```tsx
<div className="checkpoint-header">
  <Badge>🔄 FASE 2.5</Badge>
  <h2>Revisión de Deliveries Pendientes</h2>
  <p className="text-muted">
    Antes de generar el reporte final, revise los cobros pendientes.
    Estos montos se restarán del SICAR esperado.
  </p>
</div>
```

### 2. Panel de Impacto (Sticky)

```tsx
<div className="impact-panel sticky top-0">
  <h3>ℹ️ Impacto en Reporte</h3>
  <div className="calculation">
    <div className="row">
      <span>SICAR Esperado Original:</span>
      <span className="value">$5,000.00</span>
    </div>
    <div className="row highlight">
      <span>Deliveries Pendientes ({pendingCount}):</span>
      <span className="value negative">-${pendingTotal}</span>
    </div>
    <div className="divider" />
    <div className="row total">
      <span>SICAR Ajustado:</span>
      <span className="value">$4,805.00</span>
    </div>
  </div>
  <Alert variant="warning">
    ⚠️ Los ${pendingTotal} en deliveries se restarán del efectivo esperado.
  </Alert>
</div>
```

### 3. Botones de Navegación

```tsx
<div className="navigation-buttons">
  <Button variant="outline" onClick={handleBack}>
    ← Volver a División
  </Button>
  <Button variant="primary" onClick={handleContinue}>
    Continuar al Reporte →
  </Button>
</div>
```

---

## 📱 Responsiveness

| Breakpoint | Cambios UI |
|------------|------------|
| **≥1024px (Desktop)** | Layout 2 columnas: DeliveryManager (70%) + Impact Panel (30%) |
| **768-1023px (Tablet)** | Layout vertical stacked, Impact Panel sticky top |
| **360-767px (Mobile)** | Cards compactos, botones full-width |

---

## ✅ Feedback Visual

### Estados del Delivery Item

```
┌─────────────────────────────────────┐
│ • Juan Pérez - $45.00              │  ← Default
│   C807 #12345 • Hace 2 días        │
│   [✓][❌][🚫]                       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ • Pedro Gómez - $30.00             │
│   ⚠️ C807 #11111 • Hace 8 días     │  ← Warning (>7 días)
│   [✓][❌][🚫]                       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ • Luis Díaz - $200.00              │
│   🔴 C807 #22222 • Hace 16 días    │  ← Alert (>15 días)
│   [✓][❌][🚫]                       │
└─────────────────────────────────────┘
```

### Animación de Actualización

```typescript
// Cuando usuario marca como pagado
onMarkAsPaid(delivery) {
  // 1. Animación fade-out del item
  animate(deliveryItem, { opacity: 0 }, { duration: 0.3 });
  
  // 2. Actualizar contadores
  updatePendingCount(count - 1);
  updatePendingTotal(total - delivery.amount);
  
  // 3. Recalcular SICAR con animación
  animateSicarUpdate(newAdjustedSicar);
  
  // 4. Toast de confirmación
  toast.success(`✅ Delivery de ${delivery.customerName} marcado como pagado`);
}
```

---

**Siguiente:** `04_Implementacion_Final.md`
