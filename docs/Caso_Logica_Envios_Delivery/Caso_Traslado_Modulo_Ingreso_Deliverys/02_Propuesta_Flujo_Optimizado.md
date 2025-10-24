# 02. Propuesta Flujo Optimizado

**Versión:** v1.0.0  
**Fecha:** 2025-01-24  
**Status:** ✅ PROPUESTA COMPLETA

---

## 🎯 Opciones Evaluadas

### Opción A: Wizard Paso 6 (Antes de Gastos)

**Ubicación:** Entre Paso 5 (SICAR) y Paso 6 (Gastos)

```
Paso 5: Venta Esperada SICAR
        ↓
Paso 6: 📦 Deliveries Pendientes (NUEVO)
        ↓
Paso 7: Gastos del Día
```

#### Implementación Técnica

```typescript
// useWizardNavigation.ts - Actualizar totalSteps
const totalSteps = 7; // Era 6

// InitialWizardModal.tsx - Agregar caso
case 6: // Deliveries
  return (
    <div className="glass-morphism-panel">
      <h3>📦 Deliveries Pendientes</h3>
      <DeliveryManager />
    </div>
  );

case 7: // Gastos (antes era 6)
  return <DailyExpensesManager />;
```

#### Pros & Cons

| ✅ Ventajas | ❌ Desventajas |
|------------|---------------|
| Contexto SICAR fresco | Wizard 7 pasos (largo) |
| Preparación mental | Usuario no ha contado aún |
| Lógico antes de contar | Posible fatiga usuario |

---

### Opción B1: Wizard Paso 7 (Después de Gastos)

```
Paso 6: Gastos del Día
        ↓
Paso 7: 📦 Deliveries Pendientes (NUEVO)
        ↓
Phase 1: Conteo Inicial
```

#### Pros & Cons

| ✅ Ventajas | ❌ Desventajas |
|------------|---------------|
| Gastos + Deliveries completos | Wizard aún más largo |
| Checkpoint pre-conteo | Aún no hay efectivo físico |

---

### Opción B2: Phase 2.5 ⭐ RECOMENDADA

**Ubicación:** Entre Phase 2 (División) y Phase 3 (Reporte)

```
Phase 2: División del Efectivo
        ↓
Phase 2.5: 📦 Deliveries (NUEVO)
        ↓
Phase 3: Reporte Final (con deliveries actualizados)
```

#### Implementación Técnica

```typescript
// usePhaseManager.ts - Agregar Phase 2.5
type Phase = 1 | 2 | 2.5 | 3;

const completePhase2_5 = () => {
  setCurrentPhase(3);
};

// CashCounter.tsx - Renderizar Phase 2.5
if (phaseState.currentPhase === 2.5) {
  return (
    <DeliveryCheckpoint
      onContinue={() => phaseManager.completePhase2_5()}
      onBack={() => setPhaseState({ ...phaseState, currentPhase: 2 })}
    />
  );
}

// DeliveryCheckpoint.tsx (NUEVO)
export function DeliveryCheckpoint({ onContinue, onBack }: Props) {
  const { pending } = useDeliveries();
  
  return (
    <div className="checkpoint-container">
      <h2>Revisión de Deliveries Pendientes</h2>
      <p>Antes de generar el reporte, revise cobros pendientes</p>
      
      <DeliveryManager />
      
      <div className="alert-info">
        {pending.length > 0 && (
          <p>⚠️ {pending.length} deliveries se restarán de SICAR esperado</p>
        )}
      </div>
      
      <div className="actions">
        <Button onClick={onBack}>Volver</Button>
        <Button onClick={onContinue} variant="primary">
          Continuar al Reporte
        </Button>
      </div>
    </div>
  );
}
```

#### Pros & Cons

| ✅ Ventajas | ❌ Desventajas |
|------------|---------------|
| Checkpoint natural | Requiere nueva Phase |
| Recálculo garantizado | Código más complejo |
| No alarga wizard | Necesita DeliveryCheckpoint |
| Contexto: efectivo dividido | Testing adicional |
| UX coherente con Phase 2 | - |

---

## 📊 Matriz de Decisión

| Criterio (Peso) | Opción A | Opción B1 | Opción B2 ⭐ | Actual |
|----------------|----------|-----------|-------------|--------|
| **Coherencia operativa (5)** | 20/25 | 22/25 | 25/25 | 5/25 |
| **Precisión reporte (5)** | 18/25 | 20/25 | 25/25 | 10/25 |
| **UX simplicidad (4)** | 16/20 | 14/20 | 18/20 | 8/20 |
| **Esfuerzo técnico (3)** | 12/15 | 9/15 | 6/15 | 15/15 |
| **Mantenibilidad (3)** | 10/15 | 10/15 | 12/15 | 6/15 |
| **TOTAL** | **76/100** | **75/100** | **86/100** | **44/100** |

---

## 🏆 Recomendación Final

### Opción B2: Phase 2.5 (Checkpoint Deliveries)

**Justificación:**

1. **Timing perfecto:** Después de contar y dividir, antes del reporte
2. **Garantía técnica:** Recálculo SICAR con deliveries actualizados
3. **UX natural:** Similar a Phase 2 (checkpoint de validación)
4. **Sin alargar wizard:** 6 pasos se mantienen
5. **Coherencia:** Usuario ve diferencia correcta la primera vez

**Flujo propuesto:**

```
Wizard (6 pasos) → Phase 1 (Conteo) → Phase 2 (División) 
→ Phase 2.5 (Deliveries) → Phase 3 (Reporte con datos correctos)
```

---

**Siguiente:** `03_Simulacion_UI_Flujo_Nuevo.md`
