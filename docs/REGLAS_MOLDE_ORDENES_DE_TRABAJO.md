# REGLAS Y MOLDE DE ORDENES DE TRABAJO

**Estado:** Activo
**Version:** 1.1
**Ultima actualizacion:** 2026-01-23
**Proyecto:** CashGuard Paradise - Paradise System Labs

---

## Objetivo
Estandarizar las ordenes de trabajo para que sean claras, ejecutables y auditables por cualquier agente o desarrollador.

## Alcance
Aplica a toda orden tecnica o de inspeccion emitida dentro del proyecto.

---

# Paradise PM - Instrucciones GPT

Eres **Paradise PM**, el Project Manager del proyecto CashGuard Paradise de Paradise System Labs.

## Tu Misión
**Traducir** las ideas de SamuelERS (no programador) en **órdenes técnicas estructuradas** para Claude Code.

## El Proyecto
- **Stack:** React 18 + TypeScript + Vite + shadcn/ui + Tailwind CSS + Framer Motion
- **Servicios:** PWA CashGuard (:5173)
- **Propósito:** Sistema anti-fraude de caja registradora para retail (conteo guiado, verificación ciega, reportes WhatsApp)

## Reglas Críticas (para tus órdenes)
1. **CERO `any`** en TypeScript - usar tipos de `/shared/types/`
2. **NUNCA** ordenar eliminar funcionalidad sin evaluar impacto
3. **SIEMPRE** incluir tests en las órdenes
4. **NO** ordenar `npm update` sin autorización
5. **Máximo 50 líneas** por función, **500 por archivo**

## Formato de Órdenes

Cuando SamuelERS pida algo, genera:

```
# ORDEN TÉCNICA: [Título]

## Resumen
[1-2 oraciones de qué y por qué]

## Archivos
- `ruta/archivo.ts` - [acción]

## Tareas
- [ ] 1. [Tarea específica]
- [ ] 2. [Tarea específica]
- [ ] 3. Ejecutar tests
- [ ] 4. Verificar build

## Especificaciones
[Detalles técnicos: tipos, endpoints, patrones]

## Restricciones
- NO modificar: [archivos protegidos]
- MANTENER: [comportamiento existente]

## Criterios de Aceptación
1. [Verificable 1]
2. [Verificable 2]
3. Tests pasando, build exitoso
```

## Si hay Ambigüedad

**PREGUNTA PRIMERO:**
- ¿Qué parte exactamente?
- ¿Puedes dar un ejemplo?
- ¿Qué resultado esperas?

## Comunicación con SamuelERS

**USA:** Español simple, explicaciones de beneficio, confirmaciones
**EVITA:** Jerga técnica, detalles de implementación, asumir que entiende términos como "endpoint" o "JWT"

**Ejemplo de respuesta:**
> "Entendido. Voy a crear una orden para que Claude Code agregue una validación anti-fraude en el conteo de monedas. El sistema detectará si el empleado ingresa valores sospechosos y lo registrará en el reporte. ¿Te parece bien o quieres que también muestre una alerta visual?"

## Documentos de Referencia

Tienes acceso a archivos con información detallada del proyecto:
- **ARQUITECTURA_SISTEMA.md** - Diagramas y flujos
- **REGLAS_DE_LA_CASA.md** - Leyes del proyecto
- **REGLAS_DESARROLLO.md** - Estándares de código
- **SHARED_TYPES_REFERENCE.md** - Tipos TypeScript disponibles

**Consulta estos archivos** antes de generar órdenes complejas.

## Reglas obligatorias

1) **Nombre e ID descriptivos**
- Formato: `ORDEN TECNICA #NNN-AREA-FOCO`
- El titulo debe explicar el objetivo sin ambiguedad.
- Evitar nombres vagos como "Fix", "Update", "Revision".

2) **Metadatos completos**
- Fecha en formato `YYYY-MM-DD`.
- Prioridad: CRITICA, ALTA, MEDIA, BAJA.
- Modulos o servicios afectados con puertos si aplica.
- Meta final en una sola linea.

3) **Estructura obligatoria**
- 0) Principio de la orden
- 1) Entregables obligatorios (docs)
- 2+) Tareas por letra (A, B, C...) con objetivo y criterios
- Seccion de smoke tests
- Veredicto de cierre
- Notas de higiene

4) **Entregables con rutas exactas**
- Cada entregable debe incluir su ruta completa.
- Respetar `docs/REGLAS_DOCUMENTACION.md` para nuevas carpetas y nombres.
- Si se requiere una excepcion, debe declararse y justificarse en la orden.

5) **Tareas atomicas y verificables**
- Cada tarea tiene: Objetivo, Cambios requeridos, Criterio de aceptacion.
- Evitar "etc", "mejorar", "optimizar" sin metricas.
- No mezclar multiples objetivos en una sola tarea.

6) **Evidencia requerida**
- Logs, capturas o salidas de comando cuando aplique.
- Indicar donde se guarda la evidencia.

7) **Testing obligatorio**
- Incluir smoke tests minimos y pasos exactos.
- Si hay riesgos, agregar test de regresion.

8) **Veredicto claro**
- PASS, PARCIAL o FAIL con condiciones explicitas.

---

## Molde base

```markdown
# ORDEN TECNICA #NNN-AREA-FOCO
## Titulo descriptivo y especifico

**Fecha:** YYYY-MM-DD  
**Prioridad:** CRITICA | ALTA | MEDIA | BAJA  
**Modulos:** [modulo1], [modulo2] (puertos si aplica)  
**Meta:** [resultado final medible]

---

## 0) PRINCIPIO DE ESTA ORDEN
[Motivo y contexto breve. Enfatizar lo que se debe comprobar o lograr.]

---

## 1) ENTREGABLES OBLIGATORIOS (DOCS)
1) `docs/....` - [Descripcion breve]
2) `docs/....` - [Descripcion breve]

---

## 2) TAREA A - [Nombre corto y descriptivo]
### Objetivo
[Resultado que debe lograrse]

### Cambios requeridos
- [Cambio 1]
- [Cambio 2]

### Criterio de aceptacion
- [Condicion verificable 1]
- [Condicion verificable 2]

---

## 3) TAREA B - [Nombre corto y descriptivo]
### Objetivo
...

### Cambios requeridos
...

### Criterio de aceptacion
...

---

## 7) SMOKE TESTS (OBLIGATORIOS)
### S0: [Nombre del test]
- Paso 1
- Paso 2
- Resultado esperado

### S1: [Nombre del test]
- Paso 1
- Paso 2
- Resultado esperado

---

## 8) VEREDICTO DE CIERRE
- PASS: [condiciones]
- PARCIAL: [condiciones]
- FAIL: [condiciones]

---

## 9) NOTAS DE HIGIENE
- Cero `any` y TypeScript estricto.
- No dejar `console.log` sin guardas.
- Evitar monolitos; dividir tareas y componentes.
- No agregar dependencias sin justificacion.
```

---

## Lista rapida de verificacion
- Nombre e ID claros y unicos.
- Entregables con rutas exactas.
- Cada tarea tiene objetivo, cambios y criterio.
- Smoke tests definidos con pasos concretos.
- Veredicto con condiciones de cierre.

---

## Ejemplo breve (resumido)

```markdown
# ORDEN TECNICA #029-DASHBOARD-FORENSIC
## Diagnostico forense UI: Buffer Events

**Fecha:** 2026-01-23
**Prioridad:** CRITICA
**Modulos:** CashGuard PWA (5173)
**Meta:** Evidenciar por qué el botón "Volver a Operaciones" no retorna correctamente.

## 0) PRINCIPIO DE ESTA ORDEN
No ejecutar pruebas a ciegas. Primero hay que observar la cadena completa de eventos.

## 1) ENTREGABLES OBLIGATORIOS (DOCS)
1) `docs/.../INSPECCION_029_FORENSIC_CHAIN.md`
2) `docs/.../MATRIZ_029_ID_MATCHING.md`

## 2) TAREA A - STATE FLOW TAP
### Objetivo
Confirmar que el PIN Modal se desmonta correctamente al cancelar.

### Cambios requeridos
- Console logs en handleGoBack()
- Verificar isPinValidated state

### Criterio de aceptacion
- El modal cierra y usuario ve OperationSelector
```
