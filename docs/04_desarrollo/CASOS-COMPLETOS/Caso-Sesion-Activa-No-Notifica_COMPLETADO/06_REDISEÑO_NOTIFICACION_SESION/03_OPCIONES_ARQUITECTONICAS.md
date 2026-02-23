# 03 — Opciones Arquitectónicas: Rediseño de Notificación de Sesión

**Caso:** CASO-SANN-R2 — Rediseño de Notificación de Sesión Activa
**Fase DIRM:** Investigación Arquitectónica (CERO CÓDIGO)
**Fecha:** 2026-02-18
**Estado:** ✅ Completado

---

## Resumen

Se evalúan 3 opciones arquitectónicas para resolver el problema de privacidad operacional del banner de sesión activa. Las opciones A y B fueron propuestas directamente por el usuario. La opción C es una combinación que maximiza privacidad y control.

---

## Opción A — Mover Notificación al Paso 5 (SICAR Input)

### Descripción

Eliminar el banner de los Pasos 2-6 y en su lugar mostrar la información de sesión activa DENTRO del panel "Resumen de Información" del Paso 5, con controles bloqueados para prevenir avance hasta que el usuario tome una decisión.

### Mockup Visual

```
┌─────────────────────────────────────────┐
│  Paso 5 de 6                            │
│                                         │
│  Resumen de Información                 │
│                                         │
│  Sucursal:  Plaza Merliot               │
│  Cajero:    Irvin Abarca                │
│  Testigo:   Jonathan Melara             │
│                                         │
│  ┌─ ⚠️ Sesión Activa Detectada ────────┐│
│  │  Esta sucursal tiene una sesión     ││
│  │  de corte en progreso.              ││
│  │                                     ││
│  │  [Reanudar Sesión] [Abortar]        ││
│  └─────────────────────────────────────┘│
│                                         │
│  Venta esperada (SICAR):               │
│  [$_________]  ← Deshabilitado          │
│                                         │
│         [← Anterior]  [Continuar →]     │
│                       ↑ Deshabilitado   │
└─────────────────────────────────────────┘
```

### Ventajas

| # | Ventaja | Peso |
|---|---------|------|
| 1 | Privacidad: Info solo visible en Paso 5 (más profundo en el flujo) | 🟢 ALTO |
| 2 | Contexto: El "Resumen" ya muestra datos sensibles (sucursal, cajero) | 🟢 ALTO |
| 3 | Propuesta del usuario (alineada con su modelo mental) | 🟢 ALTO |
| 4 | Complejidad baja: Solo mover/adaptar componente existente | 🟢 ALTO |

### Desventajas

| # | Desventaja | Peso |
|---|-----------|------|
| 1 | Usuario debe navegar hasta Paso 5 para enterarse de la sesión activa | 🔴 ALTO |
| 2 | Pasos 2-4 se completan sin saber que hay sesión activa (trabajo potencialmente duplicado) | 🟡 MEDIO |
| 3 | Si el usuario aborta en Paso 5, pierde los datos ingresados en Pasos 2-4 | 🟡 MEDIO |

### Archivos Impactados

- `InitialWizardModalView.tsx` — Remover banner (líneas 142-166)
- `Step5SicarInput.tsx` — Agregar panel de sesión activa con botones
- `useCorteSesion.ts` — SIN CAMBIOS (funciones ya existen)

### Complejidad Estimada: 🟢 BAJA-MEDIA

---

## Opción B — Modal con Botones Abort/Resume

### Descripción

Al detectar sesión activa, abrir un MODAL de decisión antes de que el usuario continúe en el wizard. El modal presenta dos opciones claras: "Reanudar Sesión" (continúa donde quedó) o "Abortar Sesión" (descarta y empieza limpio).

### Mockup Visual — Trigger en Paso 2

```
┌─────────────────────────────────────────┐
│  Paso 2 de 6                            │
│                                         │
│  ┌═══════════════════════════════════┐  │
│  ║                                   ║  │
│  ║   ⚠️ Sesión Activa Detectada     ║  │
│  ║                                   ║  │
│  ║   Se encontró una sesión de       ║  │
│  ║   corte en progreso para esta     ║  │
│  ║   sucursal.                       ║  │
│  ║                                   ║  │
│  ║   ¿Qué desea hacer?              ║  │
│  ║                                   ║  │
│  ║   [🔄 Reanudar Sesión]           ║  │
│  ║   [🗑️ Abortar y Empezar Nuevo]   ║  │
│  ║                                   ║  │
│  └═══════════════════════════════════┘  │
│                                         │
└─────────────────────────────────────────┘
```

### Variante B.1 — Modal al Inicio (Antes del Wizard)

El modal podría aparecer ANTES de que el wizard se abra, interceptando en `Index.tsx` cuando el usuario presiona "Corte de Caja". Esto evita que el usuario entre al wizard sin saber que hay sesión activa.

```
Index.tsx → Click "Corte de Caja"
    ↓
¿Hay sesión activa?
    ├─ NO → Abrir wizard normalmente
    └─ SÍ → Mostrar modal de decisión
              ├─ "Reanudar" → Abrir wizard con datos recuperados
              └─ "Abortar" → Llamar abortarCorte() → Abrir wizard limpio
```

### Ventajas

| # | Ventaja | Peso |
|---|---------|------|
| 1 | Máxima privacidad: Modal es temporal (aparece y desaparece) | 🟢 ALTO |
| 2 | Control explícito: Usuario DECIDE qué hacer (no reanudación automática) | 🟢 ALTO |
| 3 | Inmediatez: Usuario sabe de la sesión ANTES de llenar datos | 🟢 ALTO |
| 4 | Propuesta del usuario (segunda alternativa explícita) | 🟢 ALTO |
| 5 | Infraestructura backend 100% lista (abort/resume ya existen) | 🟢 ALTO |

### Desventajas

| # | Desventaja | Peso |
|---|-----------|------|
| 1 | Complejidad mayor que Opción A (nuevo componente modal + wiring) | 🟡 MEDIO |
| 2 | Si se muestra en Paso 2, aún revela brevemente que hay sesión activa | 🟡 BAJO |
| 3 | Abortar requiere confirmación adicional (destrucción de datos) | 🟡 BAJO |

### Archivos Impactados

- `InitialWizardModalView.tsx` — Remover banner + agregar modal trigger
- Nuevo componente: `ActiveSessionModal.tsx` (o dentro del view)
- `useCorteSesion.ts` — SIN CAMBIOS (funciones ya existen)
- `Index.tsx` — Pasar funciones abort/resume como props (si variante B.1)

### Complejidad Estimada: 🟡 MEDIA

---

## Opción C — Híbrida: Modal Antes del Wizard + Sin Banner

### Descripción

Combina lo mejor de A y B: el modal de decisión aparece ANTES de entrar al wizard (interceptado en `Index.tsx` o al inicio del wizard Step 1). El banner se ELIMINA completamente. El usuario decide en un momento puntual y discreto, y luego navega el wizard sin ningún recordatorio visible.

### Flujo

```
Index.tsx → Click "Corte de Caja"
    ↓
detectActiveCashCutSession() → ¿Hay sesión activa?
    ├─ NO → Abrir wizard normalmente (sin banner, sin modal)
    └─ SÍ → Mostrar modal ANTES de abrir wizard
              ├─ "Reanudar Sesión"
              │     ↓ recuperarSesion()
              │     ↓ Abrir wizard con datos pre-llenados
              │     ↓ SIN banner en ningún paso
              │
              └─ "Abortar y Empezar Nuevo"
                    ↓ Modal confirmación: "¿Seguro? Se perderán los datos"
                    ↓ abortarCorte("Usuario decidió iniciar nuevo corte")
                    ↓ Abrir wizard limpio
                    ↓ SIN banner en ningún paso
```

### Mockup Visual — Modal Previo al Wizard

```
┌─────────────────────────────────────────┐
│                                         │
│  ┌═══════════════════════════════════┐  │
│  ║                                   ║  │
│  ║   ⚠️ Sesión en Progreso          ║  │
│  ║                                   ║  │
│  ║   Existe un corte de caja que     ║  │
│  ║   no se completó.                 ║  │
│  ║                                   ║  │
│  ║   ¿Qué desea hacer?              ║  │
│  ║                                   ║  │
│  ║   [🔄 Reanudar Sesión]           ║  │
│  ║                                   ║  │
│  ║   [🗑️ Abortar y Empezar Nuevo]   ║  │
│  ║                                   ║  │
│  └═══════════════════════════════════┘  │
│                                         │
│  (Pantalla principal detrás)            │
└─────────────────────────────────────────┘
```

### Ventajas

| # | Ventaja | Peso |
|---|---------|------|
| 1 | Privacidad MÁXIMA: Modal temporal, banner eliminado completamente | 🟢 ALTO |
| 2 | Control del usuario: Decide ANTES de navegar el wizard | 🟢 ALTO |
| 3 | Zero información expuesta durante navegación del wizard | 🟢 ALTO |
| 4 | Inmediatez: Decisión en el punto de entrada, no al final | 🟢 ALTO |
| 5 | UX limpia: Wizard siempre funciona igual (con o sin sesión previa) | 🟢 ALTO |
| 6 | Infraestructura backend 100% lista | 🟢 ALTO |

### Desventajas

| # | Desventaja | Peso |
|---|-----------|------|
| 1 | Mayor complejidad que A (nuevo componente + flujo condicional en Index.tsx) | 🟡 MEDIO |
| 2 | Requiere modal de confirmación para abortar (UX destrucción de datos) | 🟡 BAJO |

### Archivos Impactados

- `Index.tsx` — Flujo condicional pre-wizard + pasar abort/resume como callbacks
- `InitialWizardModalView.tsx` — ELIMINAR banner completamente (líneas 142-166)
- Nuevo componente: `ActiveSessionDecisionModal.tsx`
- `useCorteSesion.ts` — SIN CAMBIOS
- `ActiveSessionBanner.test.tsx` — Actualizar/reemplazar tests

### Complejidad Estimada: 🟡 MEDIA

---

## Tabla Comparativa Final

| Criterio | Opción A (Step 5) | Opción B (Modal Wizard) | Opción C (Modal Pre-Wizard) |
|----------|:---:|:---:|:---:|
| **Privacidad** | 🟡 Media | 🟢 Alta | 🟢 Máxima |
| **Control usuario** | 🟢 Sí (botones) | 🟢 Sí (botones) | 🟢 Sí (botones) |
| **Inmediatez** | 🔴 Tardía (Paso 5) | 🟡 Media (Paso 2) | 🟢 Inmediata (pre-wizard) |
| **Trabajo duplicado** | 🔴 Pasos 2-4 potencialmente inútiles | 🟡 Paso 2 parcial | 🟢 Zero |
| **Complejidad** | 🟢 Baja-Media | 🟡 Media | 🟡 Media |
| **Banner eliminado** | ✅ Sí | ✅ Sí | ✅ Sí |
| **Backend necesario** | ❌ Nada | ❌ Nada | ❌ Nada |
| **Propuesta usuario** | ✅ Alternativa 1 | ✅ Alternativa 2 | Combinación |

---

## Recomendación del Director

La **Opción C (Híbrida)** ofrece el mejor balance entre privacidad, control y experiencia de usuario. Sin embargo, **la decisión arquitectónica es del USUARIO, no del director ni del agente.**

Las 3 opciones son técnicamente viables con la infraestructura existente.

---

## Siguiente Paso

> ⛔ **BLOQUEADO**: El usuario debe seleccionar una opción (A, B, o C) antes de proceder con los documentos 05 (Plan de Implementación) y 06 (Criterios de Aceptación).

---

## Referencias

- `01_DIAGNOSTICO_PROBLEMA_UX.md` — Problema de privacidad detallado
- `02_INVENTARIO_INFRAESTRUCTURA.md` — Funciones backend disponibles
- `src/hooks/useCorteSesion.ts` — Código fuente abort/resume/restart
- `src/components/initial-wizard/steps/Step5SicarInput.tsx` — Destino Opción A
- `src/components/initial-wizard/InitialWizardModalView.tsx` — Banner actual (a eliminar)
