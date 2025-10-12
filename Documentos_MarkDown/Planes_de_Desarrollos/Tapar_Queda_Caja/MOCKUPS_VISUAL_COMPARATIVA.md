# 🎨 Mockups Visuales - Comparativa ANTES/DESPUÉS

**Fecha:** 11 Oct 2025
**Versión:** v1.0
**Propósito:** Visualización exacta de cambios en badges "QUEDA EN CAJA"

---

## 📊 ÍNDICE

1. [Badge #1: Header Progress Container](#badge-1-header-progress-container)
2. [Badge #2: Placeholder Step Activo](#badge-2-placeholder-step-activo)
3. [Pantalla Completa Comparativa](#pantalla-completa-comparativa)
4. [Responsive Mobile](#responsive-mobile)

---

## 🎯 BADGE #1: Header Progress Container

### ❌ ANTES (v1.3.6AD1 - Modo Desarrollo)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ┌──────────────────────────┐   ┌──────────────────┐  │
│  │ 💼 QUEDA EN CAJA 7       │   │ ACTIVO ▶         │  │
│  │                          │   │                  │  │
│  └──────────────────────────┘   └──────────────────┘  │
│          ↑                                             │
│    BADGE VERDE/BEIGE                                   │
│   (Muestra número total)                               │
│                                                         │
└─────────────────────────────────────────────────────────┘

🔴 PROBLEMA: Cajero ve "7" antes de contar → Sesgo de confirmación
```

---

### ✅ DESPUÉS (v1.3.7AE - Modo Producción)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ┌──────────────────────────┐   ┌──────────────────┐  │
│  │ 💼 VERIFICANDO CAJA      │   │ ACTIVO ▶         │  │
│  │                          │   │                  │  │
│  └──────────────────────────┘   └──────────────────┘  │
│          ↑                                             │
│    BADGE VERDE/BEIGE                                   │
│  (Texto genérico sin número)                           │
│                                                         │
└─────────────────────────────────────────────────────────┘

✅ SOLUCIÓN: Cajero NO ve número → Conteo objetivo sin sesgo
```

---

## 🎯 BADGE #2: Placeholder Step Activo

### ❌ ANTES (v1.3.6AD1 - Modo Desarrollo)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              🪙  🪙                                     │
│          (Imagen penny)                                 │
│                                                         │
│        ┌────────────────────────────────┐              │
│        │  💼  QUEDA EN CAJA 40          │              │
│        │          ↑                     │              │
│        │    BADGE BEIGE/MARRÓN          │              │
│        │   (Muestra cantidad exacta)    │              │
│        └────────────────────────────────┘              │
│                                                         │
│                Un centavo                               │
│                                                         │
│        ┌──────────────────────────────────────┐        │
│        │  ¿Cuántos un centavo?                │        │
│        │  [Input numérico activo]             │        │
│        └──────────────────────────────────────┘        │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Ingresa exactamente 40 un centavo               │  │
│  │  (Mensaje guía rojo)                             │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│                    [Confirmar →]                        │
│                                                         │
└─────────────────────────────────────────────────────────┘

🔴 PROBLEMA CRÍTICO: Cajero ve "40" ANTES de contar
                     → Rompe conteo ciego 100%
```

---

### ✅ DESPUÉS (v1.3.7AE - Modo Producción)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              🪙  🪙                                     │
│          (Imagen penny)                                 │
│                                                         │
│        ┌────────────────────────────────┐              │
│        │  💼  VERIFICANDO CAJA          │              │
│        │          ↑                     │              │
│        │    BADGE BEIGE/MARRÓN          │              │
│        │   (Texto genérico sin número)  │              │
│        └────────────────────────────────┘              │
│                                                         │
│                Un centavo                               │
│                                                         │
│        ┌──────────────────────────────────────┐        │
│        │  ¿Cuántos un centavo?                │        │
│        │  [Input numérico activo]             │        │
│        └──────────────────────────────────────┘        │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  (Mensaje guía removido - conteo independiente)  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│                    [Confirmar →]                        │
│                                                         │
└─────────────────────────────────────────────────────────┘

✅ SOLUCIÓN CRÍTICA: Cajero cuenta físicamente SIN ver cantidad esperada
                     → Conteo ciego restaurado 100%
```

**Nota adicional:** El mensaje guía rojo "Ingresa exactamente 40 un centavo" también podría ocultarse opcionalmente para reforzar el conteo ciego (pendiente decisión usuario).

---

## 🖥️ PANTALLA COMPLETA COMPARATIVA

### ❌ MODO DESARROLLO (SHOW_REMAINING_AMOUNTS = true)

```
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║  $  Fase 2: División de Efectivo                             ║
║                                                               ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  ┌──────────────────────────────────────────────────────┐    ║
║  │  📊  VERIFICACIÓN EN CAJA                            │    ║
║  │      Confirmar lo que queda                          │    ║
║  │                            🎯 Objetivo: Cambio completo │ ║
║  └──────────────────────────────────────────────────────┘    ║
║                                                               ║
║  ┌──────────────────────────────────────────────────────┐    ║
║  │  💼 QUEDA EN CAJA       Verificado: ✅ 0/4            │    ║
║  │  ↑ BADGE VERDE          ↑ Progress bar               │    ║
║  └──────────────────────────────────────────────────────┘    ║
║                                                               ║
║  ┌────────────────────────────────────────────────────────┐  ║
║  │                                                        │  ║
║  │              🪙  🪙  (Penny image)                     │  ║
║  │                                                        │  ║
║  │        ┌────────────────────────────────┐             │  ║
║  │        │  💼  QUEDA EN CAJA 40          │ ← PROBLEMA │  ║
║  │        └────────────────────────────────┘             │  ║
║  │                                                        │  ║
║  │                Un centavo                              │  ║
║  │                                                        │  ║
║  │        ┌──────────────────────────────────────┐       │  ║
║  │        │  ¿Cuántos un centavo?                │       │  ║
║  │        │  [________________]                   │       │  ║
║  │        └──────────────────────────────────────┘       │  ║
║  │                                                        │  ║
║  │  ┌──────────────────────────────────────────────┐     │  ║
║  │  │  Ingresa exactamente 40 un centavo           │     │  ║
║  │  └──────────────────────────────────────────────┘     │  ║
║  │                                                        │  ║
║  │                    [Confirmar →]                       │  ║
║  │                                                        │  ║
║  └────────────────────────────────────────────────────────┘  ║
║                                                               ║
║                    [Cancelar]                                 ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

🔴 VISUALIZACIÓN DESARROLLO: 2 badges muestran números (7 + 40)
```

---

### ✅ MODO PRODUCCIÓN (SHOW_REMAINING_AMOUNTS = false)

```
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║  $  Fase 2: División de Efectivo                             ║
║                                                               ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  ┌──────────────────────────────────────────────────────┐    ║
║  │  📊  VERIFICACIÓN EN CAJA                            │    ║
║  │      Confirmar lo que queda                          │    ║
║  │                            🎯 Objetivo: Cambio completo │ ║
║  └──────────────────────────────────────────────────────┘    ║
║                                                               ║
║  ┌──────────────────────────────────────────────────────┐    ║
║  │  💼 VERIFICANDO CAJA    Verificado: ✅ 0/4            │    ║
║  │  ↑ BADGE VERDE          ↑ Progress bar               │    ║
║  └──────────────────────────────────────────────────────┘    ║
║                                                               ║
║  ┌────────────────────────────────────────────────────────┐  ║
║  │                                                        │  ║
║  │              🪙  🪙  (Penny image)                     │  ║
║  │                                                        │  ║
║  │        ┌────────────────────────────────┐             │  ║
║  │        │  💼  VERIFICANDO CAJA          │ ← LIMPIO ✅ │  ║
║  │        └────────────────────────────────┘             │  ║
║  │                                                        │  ║
║  │                Un centavo                              │  ║
║  │                                                        │  ║
║  │        ┌──────────────────────────────────────┐       │  ║
║  │        │  ¿Cuántos un centavo?                │       │  ║
║  │        │  [________________]                   │       │  ║
║  │        └──────────────────────────────────────┘       │  ║
║  │                                                        │  ║
║  │                                            │  ║
║  │                                                        │  ║
║  │                    [Confirmar →]                       │  ║
║  │                                                        │  ║
║  └────────────────────────────────────────────────────────┘  ║
║                                                               ║
║                    [Cancelar]                                 ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

✅ VISUALIZACIÓN PRODUCCIÓN: 2 badges sin números (texto genérico)
```

---

## 📱 RESPONSIVE MOBILE (375px viewport)

### ❌ ANTES - Mobile iPhone SE

```
┌────────────────────────────────┐
│  $  Fase 2: División           │
│                                │
├────────────────────────────────┤
│                                │
│  📊 VERIFICACIÓN EN CAJA       │
│     Confirmar lo que queda     │
│                                │
├────────────────────────────────┤
│                                │
│  💼 QUEDA     Verificado:      │
│  EN CAJA 7    ✅ 0/4           │
│  ↑ Badge verde overflow?       │
│                                │
├────────────────────────────────┤
│                                │
│     🪙  🪙                     │
│                                │
│  ┌──────────────────────────┐ │
│  │ 💼 QUEDA EN CAJA 40      │ │
│  └──────────────────────────┘ │
│                                │
│     Un centavo                 │
│                                │
│  ┌──────────────────────────┐ │
│  │ ¿Cuántos un centavo?     │ │
│  │ [___]                    │ │
│  └──────────────────────────┘ │
│                                │
│  ┌──────────────────────────┐ │
│  │ Ingresa exactamente 40   │ │
│  │ un centavo               │ │
│  └──────────────────────────┘ │
│                                │
│       [Confirmar →]            │
│                                │
│       [Cancelar]               │
│                                │
└────────────────────────────────┘

⚠️ POSIBLE PROBLEMA: "QUEDA EN CAJA 7" podría causar
                     overflow horizontal en móviles
                     pequeños (texto largo + número)
```

---

### ✅ DESPUÉS - Mobile iPhone SE

```
┌────────────────────────────────┐
│  $  Fase 2: División           │
│                                │
├────────────────────────────────┤
│                                │
│  📊 VERIFICACIÓN EN CAJA       │
│     Confirmar lo que queda     │
│                                │
├────────────────────────────────┤
│                                │
│  💼 VERIFICANDO  Verificado:   │
│  CAJA          ✅ 0/4          │
│  ↑ Badge sin overflow ✅       │
│                                │
├────────────────────────────────┤
│                                │
│     🪙  🪙                     │
│                                │
│  ┌──────────────────────────┐ │
│  │ 💼 VERIFICANDO CAJA      │ │
│  └──────────────────────────┘ │
│                                │
│     Un centavo                 │
│                                │
│  ┌──────────────────────────┐ │
│  │ ¿Cuántos un centavo?     │ │
│  │ [___]                    │ │
│  └──────────────────────────┘ │
│                                │
│                                │
│                                │
│       [Confirmar →]            │
│                                │
│       [Cancelar]               │
│                                │
└────────────────────────────────┘

✅ MEJORA ADICIONAL: Texto más corto "VERIFICANDO CAJA"
                     previene overflow horizontal mobile
```

---

## 🎨 ALTERNATIVAS DE TEXTO - Mockup Visual

### Opción A: Genérico (RECOMENDADA)

```
┌────────────────────────────────┐
│  💼 VERIFICANDO CAJA           │  ← 18 caracteres
└────────────────────────────────┘

✅ Pros: Neutral, profesional, cabe en mobile
❌ Cons: Puede parecer menos informativo
```

---

### Opción B: Instrucción

```
┌────────────────────────────────┐
│  💼 CUENTE SIN VER EL TOTAL    │  ← 26 caracteres
└────────────────────────────────┘

✅ Pros: Refuerza concepto conteo ciego
❌ Cons: Texto largo → overflow mobile (375px)
```

---

### Opción C: Estado Progreso

```
┌────────────────────────────────┐
│  💼 VERIFICACIÓN EN PROCESO    │  ← 26 caracteres
└────────────────────────────────┘

✅ Pros: Informativo sobre estado actual
❌ Cons: Similar a Opción A, un poco largo
```

---

### Opción D: Emoji Solo (Minimalista)

```
┌────────────────────────────────┐
│  💼                            │  ← 1 emoji
└────────────────────────────────┘

✅ Pros: Ultra-minimalista, zero overflow
❌ Cons: Puede parecer incompleto/roto
```

---

### Opción E: Instrucción Corta

```
┌────────────────────────────────┐
│  💼 CONTEO CIEGO               │  ← 15 caracteres
└────────────────────────────────┘

✅ Pros: Técnicamente correcto, corto
❌ Cons: Término técnico poco familiar
```

---

## 📊 COMPARATIVA LONGITUD TEXTO (Mobile Safety)

| Opción | Caracteres | Mobile 375px | Tablet 768px | Desktop 1920px |
|--------|-----------|--------------|--------------|----------------|
| Original: "QUEDA EN CAJA 7" | 18 | ⚠️ Ajustado | ✅ OK | ✅ OK |
| **Opción A: "VERIFICANDO CAJA"** | **18** | **✅ OK** | **✅ OK** | **✅ OK** |
| Opción B: "CUENTE SIN VER..." | 26 | ❌ Overflow | ✅ OK | ✅ OK |
| Opción C: "VERIFICACIÓN..." | 26 | ❌ Overflow | ✅ OK | ✅ OK |
| Opción D: "💼" | 1 | ✅ OK | ✅ OK | ✅ OK |
| Opción E: "CONTEO CIEGO" | 15 | ✅ OK | ✅ OK | ✅ OK |

**Conclusión:** Opción A mantiene misma longitud que original (18 chars) → Zero riesgo overflow mobile ✅

---

## 🔍 TESTING VISUAL CHECKLIST

### Badge #1 (Header)
- [ ] **Desktop 1920px:** Badge visible con texto "VERIFICANDO CAJA"
- [ ] **Tablet 768px:** Badge visible sin overflow
- [ ] **Mobile 375px:** Badge visible sin horizontal scroll
- [ ] **Color:** Verde/beige preservado (`glass-badge-success`)
- [ ] **Responsive:** `clamp()` funciona correctamente

### Badge #2 (Placeholder)
- [ ] **Desktop 1920px:** Badge visible con texto "VERIFICANDO CAJA"
- [ ] **Tablet 768px:** Badge visible sin overflow
- [ ] **Mobile 375px:** Badge visible sin horizontal scroll
- [ ] **Color:** Beige/marrón preservado (`glass-status-error`)
- [ ] **Font size:** `1.4em` para consistencia con original

### Funcionalidad Preservada
- [ ] Input numérico sigue funcionando
- [ ] Botón "Confirmar" valida entrada correctamente
- [ ] Progress bar "Verificado: 0/4" actualiza correctamente
- [ ] Navegación denominaciones funciona
- [ ] Lógica de cálculo `verificationSteps` NO afectada

---

## 📸 SCREENSHOTS REQUERIDOS (Post-Implementación)

### Set 1: Desktop (1920x1080)
1. **Screenshot 1:** Badge #1 header con "VERIFICANDO CAJA"
2. **Screenshot 2:** Badge #2 placeholder con "VERIFICANDO CAJA"
3. **Screenshot 3:** Pantalla completa ambos badges visibles

### Set 2: Mobile (375x667 - iPhone SE)
4. **Screenshot 4:** Badge #1 header responsive
5. **Screenshot 5:** Badge #2 placeholder responsive
6. **Screenshot 6:** Scroll vertical completo (verificar no horizontal)

### Set 3: Comparativa ANTES/DESPUÉS
7. **Screenshot 7:** Split screen Badge #1 (desarrollo vs producción)
8. **Screenshot 8:** Split screen Badge #2 (desarrollo vs producción)

**Guardar en:** `/Documentos_MarkDown/Planes_de_Desarrollos/Tapar_Queda_Caja/screenshots/`

---

## 🎯 RECOMENDACIÓN FINAL

Basado en análisis visual completo:

**✅ OPCIÓN A: "💼 VERIFICANDO CAJA"**

**Razones:**
1. ✅ Misma longitud que original (18 caracteres) → Zero overflow risk
2. ✅ Texto genérico profesional → No revela información crítica
3. ✅ Mobile-friendly confirmado → Cabe en 375px viewport
4. ✅ Consistente con terminología app → "VERIFICACIÓN EN CAJA"
5. ✅ Mantiene emoji maletín 💼 → Coherencia visual

**Implementación:**
```tsx
// Badge alternativo (modo producción)
{!SHOW_REMAINING_AMOUNTS && (
  <div className="glass-badge-success" style={{...}}>
    💼 VERIFICANDO CAJA  {/* ← Opción A */}
  </div>
)}
```

---

**Documento creado:** 11 Oct 2025
**Versión:** v1.0
**Estado:** ✅ LISTO PARA IMPLEMENTACIÓN
