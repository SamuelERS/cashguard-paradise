# 🟠 PROBLEMA ALTO 1: Fuga de Memoria en Timeouts

**Documento:** Memory Leak Analysis
**Estado:** 📝 PLANIFICADO
**Prioridad:** ALTA
**Tiempo estimado:** 4-6 horas
**Severidad:** S1 (Alto Riesgo)

---

## 📋 Resumen Ejecutivo

Se han identificado **potenciales fugas de memoria** causadas por timeouts no cancelados correctamente en componentes que se desmontan antes de que el timeout se ejecute.

### Impacto
- ⚠️ **Performance:** Consumo de memoria creciente en sesiones largas
- ⚠️ **UX:** Aplicación se vuelve lenta después de múltiples operaciones
- ⚠️ **Producción:** Empleados deben recargar app frecuentemente

---

## 🎯 Objetivo

**Eliminar el 100% de fugas de memoria** relacionadas con timeouts no cancelados.

**Criterios de éxito:**
- ✅ Todos los `setTimeout/setInterval` con cleanup function
- ✅ Profiler de Chrome muestra memoria estable
- ✅ Sin warnings "Can't perform a React state update on unmounted component"

---

## 📊 Análisis Técnico

### Problema Actual

**Patrón problemático común:**
```typescript
// ❌ MAL - Timeout sin cleanup
useEffect(() => {
  setTimeout(() => {
    setState(newValue); // ❌ Error si componente se desmonta
  }, 1000);
}, []);
```

**Componentes potencialmente afectados:**
1. `useTimingConfig.ts` - Sistema de delays centralizado
2. `Phase2Manager.tsx` - Transiciones entre secciones
3. `GuidedInstructionsModal.tsx` - Animaciones modales
4. `InitialWizardModal.tsx` - Timing anti-fraude

### Root Cause

**Bug #6 (Parcialmente documentado):**
- Identificado en tests `useFieldNavigation` (Grupo 4)
- Estado: PARCIAL - Hook NO cancela timeouts en unmount
- Fuente: `CLAUDE.md` línea de bugs validados

**Evidencia técnica:**
```typescript
// useTimingConfig.ts - Problema potencial
export const useTimingConfig = () => {
  const createTimeoutWithCleanup = (callback, type, key) => {
    const timeoutId = setTimeout(callback, delay);

    // ⚠️ PROBLEMA: ¿Quién cancela este timeout si componente se desmonta?
    return () => clearTimeout(timeoutId);
  };
};
```

---

## ✅ Solución Propuesta

### Fase 1: Auditoría Exhaustiva (1-2h)
1. **Grep todos los setTimeout/setInterval:**
   ```bash
   grep -r "setTimeout\|setInterval" src/ --include="*.tsx" --include="*.ts"
   ```
2. **Identificar cuáles NO tienen cleanup**
3. **Crear lista priorizada por impacto**

### Fase 2: Implementación Fixes (2-3h)

**Patrón correcto a aplicar:**
```typescript
// ✅ BIEN - Timeout con cleanup
useEffect(() => {
  const timeoutId = setTimeout(() => {
    setState(newValue);
  }, 1000);

  return () => clearTimeout(timeoutId); // ✅ Cleanup
}, []);
```

**Archivos prioritarios a corregir:**
1. `useTimingConfig.ts` - Sistema centralizado (CRÍTICO)
2. `Phase2Manager.tsx` - Transiciones (ALTO)
3. `InitialWizardModal.tsx` - Timing anti-fraude (ALTO)
4. `GuidedInstructionsModal.tsx` - Animaciones (MEDIO)

### Fase 3: Validación (1h)

**Tests a ejecutar:**
```bash
# 1. Chrome DevTools Memory Profiler
# - Realizar 10 operaciones completas
# - Verificar memoria NO crece indefinidamente

# 2. React DevTools Profiler
# - Verificar cero warnings unmounted component

# 3. Tests unitarios
npm test -- useTimingConfig.test.ts
```

---

## 📚 Referencias

- **Bug #6:** `CLAUDE.md` - useFieldNavigation Grupo 4
- **useTimingConfig.test.ts:** Tests pendientes (15-18 tests planificados)
- **REGLAS_DE_LA_CASA.md:** Regla #2 (Funcionalidad - Zero regresión)

---

## 🗓️ Cronograma

### Semana 2 - Día 1 (16 Oct 2025)
- **09:00-11:00:** Auditoría exhaustiva (Fase 1)
- **11:00-14:00:** Implementación fixes (Fase 2)
- **14:00-15:00:** Validación profiler (Fase 3)

**Output esperado:**
- ✅ Lista completa de timeouts sin cleanup
- ✅ Todos los timeouts con cleanup function
- ✅ Memory profiler estable
- ✅ Cero warnings React

---

## ⚠️ Criterios de Bloqueo

**NO proceder a siguiente problema si:**
- ❌ Profiler muestra memoria creciente
- ❌ Warnings "unmounted component" en console
- ❌ Tests `useTimingConfig.test.ts` failing

---

**Última actualización:** 09 de Octubre de 2025
**Próximo paso:** Auditoría exhaustiva grep timeouts
**Responsable:** Equipo desarrollo CashGuard Paradise
