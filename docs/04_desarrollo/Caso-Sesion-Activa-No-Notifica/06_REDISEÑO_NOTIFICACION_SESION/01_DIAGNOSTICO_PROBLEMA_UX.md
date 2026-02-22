# 01 — Diagnóstico del Problema UX: Privacidad Operacional del Banner

**Caso:** CASO-SANN-R2 — Rediseño de Notificación de Sesión Activa
**Fase DIRM:** Investigación Arquitectónica (CERO CÓDIGO)
**Fecha:** 2026-02-18
**Estado:** ✅ Completado

---

## Resumen del Problema

El banner informativo implementado en CASO-SANN (Orden #2) y refinado en CASO-SANN-R1 (Orden #5) cumple su función técnica: notifica al usuario que existe una sesión activa en Supabase. Sin embargo, presenta un **problema de privacidad operacional** que compromete la discreción del proceso de corte de caja.

---

## Palabras Exactas del Usuario

> "al mostrarlo aqui directamente hace que los demas empleados sepan a que horas
> estan haciendo corte es mejor que aparezca en el apartado donde ponen la venta
> de sicar... O la otra es que al llegar a esa pantalla se abra un modal con los
> botones de abortar sesion reanudar la sesion"

---

## Evidencia Visual del Usuario

### Screenshot 1 — Paso 2: Banner Visible en Selección de Sucursal

**Ubicación:** Wizard → Paso 2 de 6 → Selección de Sucursal

**Contenido del banner:**
```
┌─────────────────────────────────────────┐
│ ℹ️ Se detectó una sesión activa         │
│    Sucursal: Plaza Merliot              │
│    La sesión se reanudará automáticam.  │
└─────────────────────────────────────────┘
```

**Problema identificado:**
- El banner aparece en pantalla completa, visible para CUALQUIER persona cercana al dispositivo
- Revela: (1) que se está haciendo un corte de caja, (2) en qué sucursal
- En un entorno donde múltiples empleados pueden ver la pantalla, esto compromete la discreción operacional

### Screenshot 2 — Paso 5: Panel "Resumen de Información"

**Ubicación:** Wizard → Paso 5 de 6 → Entrada SICAR

**Contenido del panel:**
```
┌─────────────────────────────────────────┐
│  Resumen de Información                 │
│                                         │
│  Sucursal:  [nombre]                    │
│  Cajero:    [nombre]                    │
│  Testigo:   [nombre]                    │
│                                         │
│  Venta esperada (SICAR):               │
│  [$_________]                           │
└─────────────────────────────────────────┘
```

**Observación del usuario:** Este es el lugar PROPUESTO para colocar la notificación de sesión activa (Opción A), porque aquí ya se muestra información sensible y el empleado está en una pantalla más privada del flujo.

---

## Análisis del Problema

### Dimensión 1: Privacidad Operacional

| Aspecto | Estado Actual | Riesgo |
|---------|---------------|--------|
| **Visibilidad del banner** | Pasos 2-6 (toda la navegación) | 🔴 ALTO |
| **Información expuesta** | Sucursal + existencia de sesión activa | 🔴 ALTO |
| **Quién puede ver** | Cualquier empleado cercano al dispositivo | 🔴 ALTO |
| **Duración de exposición** | Todo el tiempo que el usuario navegue Steps 2-6 | 🟡 MEDIO |

### Dimensión 2: Funcionalidad Actual vs Necesaria

| Funcionalidad | Implementada | Necesaria |
|---------------|:---:|:---:|
| Detectar sesión activa en Supabase | ✅ | ✅ |
| Notificar al usuario de forma visual | ✅ | ✅ |
| Permitir al usuario DECIDIR qué hacer | ❌ | ✅ |
| Ofrecer opción "Abortar sesión" | ❌ | ✅ |
| Ofrecer opción "Reanudar sesión" | ❌ | ✅ |
| Mantener discreción operacional | ❌ | ✅ |

### Dimensión 3: Contexto Operacional Paradise

En las sucursales de Acuarios Paradise:
- Múltiples empleados trabajan en el mismo turno
- El dispositivo (celular/tablet) puede ser visible para otros
- La hora y el hecho de que se realiza un corte de caja es información **operacionalmente sensible**
- El nombre de la sucursal en un banner azul es información que **no debería ser pública**

---

## Conclusión del Diagnóstico

El banner actual cumple función técnica PERO falla en:

1. **Privacidad:** Expone información a terceros no autorizados
2. **Control:** El usuario NO puede decidir qué hacer con la sesión activa
3. **Ubicación:** Aparece demasiado temprano en el flujo (Step 2) y permanece demasiado tiempo

**Recomendación:** Rediseñar el mecanismo de notificación para que sea discreto y ofrezca control al usuario. Las alternativas se evalúan en `03_OPCIONES_ARQUITECTONICAS.md`.

---

## Referencias

- CASO-SANN Orden #2: Banner implementado (`InitialWizardModalView.tsx` líneas 142-166)
- CASO-SANN-R1 Orden #5: Banner refinado a Step 2+ (condición `ctrl.currentStep >= 2`)
- Screenshots proporcionados por usuario (2026-02-18)
